// lib/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Robust Jikan API helper (TypeScript)
 * - rate limiting + semaphore (serial by default)
 * - retries with exponential backoff + jitter
 * - global pause when many 429s happen
 * - safe JSON parsing
 *
 * Usage:
 * import { getTopAnime, getAnimeDetail, tuneRateLimit } from '@/lib/api'
 */

const JIKAN_API_BASE = 'https://api.jikan.moe/v4'

// =========================
// 1) INTERFACES / TYPES
// =========================

export interface RelationEntry {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Relation {
  relation: string
  entry: RelationEntry[]
}

export interface JikanResource {
  mal_id: number
  type: string
  name: string
  url: string
}

export interface Genre extends JikanResource {
  count: number
}

export interface VoiceActor {
  person: { mal_id: number; name: string; url: string }
  language: string
}

export interface Character {
  character: {
    mal_id: number
    name: string
    images: { jpg: { image_url: string } }
    url: string
  }
  role: string
  voice_actors: VoiceActor[]
}

export interface Review {
  mal_id: number
  url: string
  type: string
  score: number
  date: string
  review: string
  user: {
    username: string
    images: { jpg: { image_url: string } }
  }
}

export interface Statistics {
  watching: number
  completed: number
  on_hold: number
  dropped: number
  plan_to_watch: number
  total: number
}

export interface JikanImages {
  image_url: string
  small_image_url: string
  large_image_url: string
}

export interface Anime {
  mal_id: number
  url: string
  images: { jpg: JikanImages; webp?: JikanImages }
  trailer?: {
    youtube_id?: string | null
    url?: string | null
    embed_url?: string | null
  } | null
  approved?: boolean
  titles?: { type: string; title: string }[]
  title: string
  title_english?: string
  title_japanese?: string
  title_synonyms?: string[]
  type?: string
  source?: string
  episodes?: number | null
  status?: string
  airing?: boolean
  aired?: {
    from: string
    to?: string | null
    prop?: any
    string?: string
  }
  duration?: string
  rating?: string
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  members?: number
  favorites?: number
  synopsis?: string
  background?: string
  season?: string
  year?: number | null
  broadcast?: { day?: string; time?: string; timezone?: string; string?: string }
  producers?: JikanResource[]
  licensors?: JikanResource[]
  studios?: JikanResource[]
  genres?: JikanResource[]
  explicit_genres?: JikanResource[]
  themes?: JikanResource[]
  demographics?: JikanResource[]
  relations?: Relation[]
}

export interface Manga {
  mal_id: number
  url: string
  images: { jpg: { large_image_url: string } }
  title: string
  title_english?: string
  synopsis?: string
  status?: string
  score?: number
  chapters?: number | null
  volumes?: number | null
  authors?: JikanResource[]
  published?: { from: string; to?: string | null }
  genres?: JikanResource[]
}

export interface Pagination {
  last_visible_page: number
  has_next_page: boolean
  current_page: number
  items?: { count: number; total: number; per_page: number }
}

export interface AnimeResponse {
  data: Anime[]
  pagination?: Pagination | null
}

// =========================
// 2) CONFIG & HELPERS
// =========================

// Make config mutable so tuneRateLimit can override in dev/runtime
let RATE_LIMIT_MS = 800 // ms between requests per worker (jikan is strict)
let MAX_CONCURRENT = 1 // conservative concurrency to avoid 429
let REQUEST_TIMEOUT_MS = 15_000 // per-request timeout
let DEFAULT_RETRIES = 4
let INITIAL_BACKOFF = 1000 // ms

const RECENT_429_WINDOW_MS = 10_000 // window to count recent 429s
const RECENT_429_THRESHOLD = 3 // threshold to trigger global pause

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const nowMs = () => Date.now()
const jitter = (baseMs: number) =>
  baseMs + Math.floor(Math.random() * Math.max(1, Math.floor(baseMs * 0.3)))

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = path.startsWith('http') ? new URL(path) : new URL(`${JIKAN_API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v))
    })
  }
  return url.toString()
}

// fallback for Array.prototype.findLast for environments that don't have it
function findLast<T>(arr: T[], predicate: (v: T) => boolean): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return arr[i]
  }
  return undefined
}

// =========================
// 3) CONCURRENCY + GLOBAL PAUSE (semaphore + queue)
// =========================

let activeWorkers = 0
const workerQueue: Array<() => void> = []

async function acquireWorker() {
  if (activeWorkers < MAX_CONCURRENT) {
    activeWorkers++
    return
  }
  await new Promise<void>((resolve) =>
    workerQueue.push(() => {
      activeWorkers++
      resolve()
    })
  )
}

function releaseWorker() {
  activeWorkers = Math.max(0, activeWorkers - 1)
  const next = workerQueue.shift()
  if (next) next()
}

// Global pause logic when many 429s happen in short window
let last429Timestamps: number[] = []
let globalPauseUntil: number | null = null

function record429() {
  const t = nowMs()
  last429Timestamps.push(t)
  last429Timestamps = last429Timestamps.filter((ts) => ts > t - RECENT_429_WINDOW_MS)
  const recentCount = last429Timestamps.length
  if (recentCount >= RECENT_429_THRESHOLD) {
    const pauseMs = 5000 + Math.floor(Math.random() * 4000) // 5-9s pause
    globalPauseUntil = nowMs() + pauseMs
    // eslint-disable-next-line no-console
    console.warn(`[GLOBAL PAUSE] Detected ${recentCount} recent 429s — pausing requests for ${pauseMs}ms`)
  }
}

function isGloballyPaused() {
  return globalPauseUntil !== null && nowMs() < globalPauseUntil
}

// scheduleRequest: acquires worker slot, waits rate-limit + jitter, executes callback
async function scheduleRequest(callback: () => Promise<Response>): Promise<Response> {
  // if global pause active, wait until cleared (but check periodically)
  while (isGloballyPaused()) {
    const msLeft = (globalPauseUntil ?? 0) - nowMs()
    // eslint-disable-next-line no-console
    console.warn(`[GLOBAL PAUSE] waiting ${msLeft}ms before sending more requests`)
    await delay(Math.max(200, msLeft))
  }

  await acquireWorker()
  try {
    await delay(jitter(RATE_LIMIT_MS))
    const res = await callback()
    return res
  } finally {
    // tiny breathing room
    await delay(30)
    releaseWorker()
  }
}

// =========================
// 4) fetchWithRetry (robust + timeout + Retry-After + backoff)
// =========================

async function fetchWithRetry<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries = DEFAULT_RETRIES,
  backoff = INITIAL_BACKOFF
): Promise<T | null> {
  const url = endpoint.startsWith('http') ? endpoint : `${JIKAN_API_BASE}${endpoint}`

  try {
    // Build AbortController for timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    // If caller passed a signal, prefer caller's signal; otherwise use our controller
    const signal = options.signal ?? controller.signal
    const mergedOptions: RequestInit = { ...options, signal }

    // Use scheduleRequest to respect rate-limit and concurrency
    const res = await scheduleRequest(() => fetch(url, mergedOptions))

    clearTimeout(timeout)

    // Handle 429 explicitly
    if (res.status === 429) {
      record429()
      const ra = res.headers.get('Retry-After')
      // Retry-After can be seconds or HTTP-date; parse as seconds when possible
      let raMs: number | null = null
      if (ra) {
        const asNum = Number(ra)
        if (!Number.isNaN(asNum)) {
          raMs = Math.max(1000, Math.floor(asNum * 1000))
        } else {
          const parsed = Date.parse(ra)
          if (!Number.isNaN(parsed)) {
            raMs = Math.max(1000, parsed - Date.now())
          }
        }
      }

      const waitMs = raMs ?? jitter(backoff)

      // eslint-disable-next-line no-console
      console.warn(`[API 429] Rate limit hit for ${url}, queueing retry in ${waitMs}ms (retries left ${retries})`)

      if (retries > 0) {
        await delay(waitMs)
        return fetchWithRetry<T>(endpoint, options, retries - 1, Math.min(backoff * 2, 30_000))
      }
      // eslint-disable-next-line no-console
      console.error(`[API Fail] Max retries reached for ${url}`)
      return null
    }

    if (!res.ok) {
      // attempt to read small portion of body for logging
      let bodyText = ''
      try {
        bodyText = await res.text()
      } catch (_) {
        /* ignore */
      }
      // eslint-disable-next-line no-console
      console.warn(`[API] Non-OK response ${res.status} for ${url}: ${bodyText.slice(0, 200)}`)
      return null
    }

    try {
      const json = await res.json()
      return json as T
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[API] JSON parse error for ${url}:`, err)
      return null
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    if (err?.name === 'AbortError') {
      console.warn(`[API] Request timeout/aborted for ${url}`)
    } else {
      console.error(`[API Error] ${String(err)} for ${url}`)
    }

    if (retries > 0) {
      await delay(jitter(backoff))
      return fetchWithRetry<T>(endpoint, options, retries - 1, Math.min(backoff * 2, 30_000))
    }
    return null
  }
}

// =========================
// 5) High-level helpers (list fetcher with pages)
// =========================

export async function fetchAnimeList(
  path: string,
  params: Record<string, any> = {},
  pages = 1,
  revalidate = 3600
): Promise<AnimeResponse> {
  try {
    if (pages <= 1) {
      const url = buildUrl(path, params)
      const data = await fetchWithRetry<{ data: Anime[]; pagination?: Pagination }>(url, {
        // Keep Next.js friendly `next` option if using Next's fetch on server
        // but if run in browser it's okay to pass it harmlessly
        // @ts-ignore-next-line: Next fetch option passthrough (server/runtime)
        next: { revalidate },
      } as unknown as RequestInit)
      return data ? { data: data.data || [], pagination: data.pagination ?? null } : { data: [] }
    }

    // Create promises for pages but scheduleRequest will throttle execution
    const tasks: Promise<{ data: Anime[]; pagination?: Pagination } | null>[] = []
    for (let i = 1; i <= pages; i++) {
      const url = buildUrl(path, { ...params, page: i })
      tasks.push(
        fetchWithRetry<{ data: Anime[]; pagination?: Pagination }>(url, {
          // @ts-ignore-next-line
          next: { revalidate },
        } as unknown as RequestInit).then((r) => (r ? { data: r.data || [], pagination: r.pagination } : null))
      )
    }

    const results = await Promise.all(tasks)
    const allData = results.flatMap((r) => (r ? r.data : []))
    // find last pagination entry if exists
    const lastWithPagination = findLast(
      (results.filter(Boolean) as ({ data: Anime[]; pagination?: Pagination } | null)[]).filter(Boolean) as {
        data: Anime[]
        pagination?: Pagination
      }[],
      (r) => !!r.pagination
    )

    return {
      data: allData,
      pagination: lastWithPagination?.pagination ?? null,
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Fetch list error:', err)
    return { data: [] }
  }
}

// =========================
// 6) API FUNCTIONS
// =========================

export async function getAnimeDetail(mal_id: number): Promise<Anime | null> {
  const res = await fetchWithRetry<{ data: Anime }>(`/anime/${mal_id}/full`, {
    // @ts-ignore-next-line
    next: { revalidate: 3600 },
  } as unknown as RequestInit)
  return res?.data || null
}

export async function getAnimeCharacters(mal_id: number): Promise<Character[]> {
  const res = await fetchWithRetry<{ data: Character[] }>(`/anime/${mal_id}/characters`, {
    // @ts-ignore-next-line
    next: { revalidate: 3600 },
  } as unknown as RequestInit)

  if (!res?.data) return []

  return res.data
    .sort((a, b) => (a.role === 'Main' ? -1 : 1))
    .slice(0, 12)
}

export async function getAnimeReviews(mal_id: number): Promise<Review[]> {
  const res = await fetchWithRetry<{ data: Review[] }>(
    `/anime/${mal_id}/reviews?preliminary=true&spoiler=false`,
    // @ts-ignore-next-line
    { next: { revalidate: 3600 } } as unknown as RequestInit
  )
  return res?.data ? res.data.slice(0, 6) : []
}

export async function getAnimeStatistics(mal_id: number): Promise<Statistics | null> {
  const res = await fetchWithRetry<{ data: Statistics }>(`/anime/${mal_id}/statistics`, {
    // @ts-ignore-next-line
    next: { revalidate: 3600 },
  } as unknown as RequestInit)
  return res?.data || null
}

export async function getMangaDetail(mal_id: number): Promise<Manga | null> {
  const res = await fetchWithRetry<{ data: Manga }>(`/manga/${mal_id}/full`, {
    // @ts-ignore-next-line
    next: { revalidate: 3600 },
  } as unknown as RequestInit)
  return res?.data || null
}

export async function getTopAnime(): Promise<AnimeResponse> {
  return fetchAnimeList('/top/anime', { limit: 25 }, 2)
}

export async function getPopularAnime(): Promise<AnimeResponse> {
  return fetchAnimeList('/top/anime', { filter: 'bypopularity', limit: 25 }, 2)
}

export async function getSeasonNow(): Promise<AnimeResponse> {
  const res = await fetchAnimeList('/seasons/now', { limit: 25 }, 2, 86400)
  return res || { data: [] }
}

export async function getSeasonUpcoming(): Promise<AnimeResponse> {
  return fetchAnimeList('/seasons/upcoming', { limit: 25 }, 3, 86400)
}

export async function searchAnime(query: string, page = 1): Promise<AnimeResponse> {
  const url = buildUrl('/anime', {
    q: query,
    page,
    limit: 25,
    sfw: true,
  })
  const res = await fetchWithRetry<{ data: Anime[] }>(url, {
    // @ts-ignore-next-line
    next: { revalidate: 300 },
  } as unknown as RequestInit)
  return res ? { data: res.data || [] } : { data: [] }
}

export async function getGenres(): Promise<Genre[]> {
  const res = await fetchWithRetry<{ data: Genre[] }>('/genres/anime', {
    // @ts-ignore-next-line
    next: { revalidate: 86400 },
  } as unknown as RequestInit)
  return res?.data || []
}

// Optimized: Fetch up to LIMIT_PAGES but dedupe results and return aggregated pagination metadata
export async function getAnimeByGenre(
  genreIds: number | string,
  page = 1
): Promise<AnimeResponse> {
  const genreParam = String(genreIds)

  const url = buildUrl('/anime', {
    genres: genreParam,
    page,
    limit: 25,
    order_by: 'score',
    sort: 'desc',
    sfw: true,
  })

  const res = await fetchWithRetry<{
    data: Anime[]
    pagination?: Pagination
  }>(url, {
    // @ts-ignore
    next: { revalidate: 3600 },
  } as RequestInit)

  return {
    data: res?.data || [],
    pagination: res?.pagination ?? null,
  }
}

// =========================
// 7) Utility: allow runtime tuning
// =========================

export function tuneRateLimit(options: {
  rateLimitMs?: number
  maxConcurrent?: number
  requestTimeoutMs?: number
  defaultRetries?: number
  initialBackoffMs?: number
}) {
  if (options.rateLimitMs !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[tuneRateLimit] Overriding RATE_LIMIT_MS at runtime (dev only)')
    RATE_LIMIT_MS = options.rateLimitMs
  }
  if (options.maxConcurrent !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[tuneRateLimit] Overriding MAX_CONCURRENT at runtime (dev only)')
    MAX_CONCURRENT = options.maxConcurrent
  }
  if (options.requestTimeoutMs !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[tuneRateLimit] Overriding REQUEST_TIMEOUT_MS at runtime (dev only)')
    REQUEST_TIMEOUT_MS = options.requestTimeoutMs
  }
  if (options.defaultRetries !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[tuneRateLimit] Overriding DEFAULT_RETRIES at runtime (dev only)')
    DEFAULT_RETRIES = options.defaultRetries
  }
  if (options.initialBackoffMs !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[tuneRateLimit] Overriding INITIAL_BACKOFF at runtime (dev only)')
    INITIAL_BACKOFF = options.initialBackoffMs
  }
}

// =========================
// 8) Export debug helpers (optional)
// =========================

export const __api_debug = {
  get RATE_LIMIT_MS() {
    return RATE_LIMIT_MS
  },
  get MAX_CONCURRENT() {
    return MAX_CONCURRENT
  },
  get REQUEST_TIMEOUT_MS() {
    return REQUEST_TIMEOUT_MS
  },
  get DEFAULT_RETRIES() {
    return DEFAULT_RETRIES
  },
  get INITIAL_BACKOFF() {
    return INITIAL_BACKOFF
  },
}
