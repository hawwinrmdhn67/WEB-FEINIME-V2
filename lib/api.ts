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
// CONFIG
// =========================

// Maksimal request paralel (Jikan sangat ketat)
const MAX_CONCURRENT = 1

// Retry handling
const DEFAULT_RETRIES = 3
const INITIAL_BACKOFF = 500 // ms

// Rate limit & timeout
const RATE_LIMIT_MS = 350 // delay antar request
const REQUEST_TIMEOUT_MS = 10_000 // 10 detik

// Environment check (Next.js / SSR safe)
const IS_SERVER = typeof window === "undefined"

// =========================
// HELPERS
// =========================

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = (ms: number) => ms + Math.random() * ms * 0.3

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  const url = new URL(`${JIKAN_API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null)
        url.searchParams.append(k, String(v))
    })
  }
  return url.toString()
}

// =========================
// CONCURRENCY (SEMAPHORE)
// =========================

let active = 0
const queue: Array<() => void> = []

async function acquire() {
  if (active < MAX_CONCURRENT) {
    active++
    return
  }
  await new Promise<void>((r) => queue.push(r))
  active++
}

function release() {
  active--
  const next = queue.shift()
  if (next) next()
}

export async function getAnimeCharacters(
  mal_id: number
): Promise<Character[]> {
  const res = await fetchWithRetry<{ data: Character[] }>(
    `${JIKAN_API_BASE}/anime/${mal_id}/characters`
  )

  if (!res?.data) return []

  return res.data
    .sort((a, b) => (a.role === "Main" ? -1 : 1))
    .slice(0, 12)
}

export async function getAnimeReviews(
  mal_id: number
): Promise<Review[]> {
  const res = await fetchWithRetry<{ data: Review[] }>(
    `${JIKAN_API_BASE}/anime/${mal_id}/reviews?preliminary=true&spoiler=false`
  )

  if (!res?.data) return []

  return res.data.slice(0, 6)
}

export async function getAnimeStatistics(
  mal_id: number
): Promise<Statistics | null> {
  const res = await fetchWithRetry<{ data: Statistics }>(
    `${JIKAN_API_BASE}/anime/${mal_id}/statistics`
  )

  return res?.data || null
}

export async function getMangaDetail(
  mal_id: number
): Promise<Manga | null> {
  const res = await fetchWithRetry<{ data: Manga }>(
    `${JIKAN_API_BASE}/manga/${mal_id}/full`
  )

  return res?.data || null
}

/** ✅ SSR SAFE – UPCOMING SEASON (PAGE 1 ONLY) */
export async function getSeasonUpcoming(): Promise<AnimeResponse> {
  return fetchAnimeList(
    "/seasons/upcoming",
    { limit: 50, sfw: true },
    3600
  )
}

// =========================
// FETCH WITH RETRY (FINAL)
// =========================

async function fetchWithRetry<T>(
  url: string,
  retries = DEFAULT_RETRIES,
  backoff = INITIAL_BACKOFF
): Promise<T | null> {
  await acquire()

  try {
    await delay(jitter(RATE_LIMIT_MS))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const res = await fetch(url, {
      signal: controller.signal,
      cache: IS_SERVER ? "force-cache" : "no-store",
      next: IS_SERVER ? { revalidate: 600 } : undefined,
    })

    clearTimeout(timeout)

    if (res.status === 429) {
      if (retries > 0) {
        await delay(jitter(backoff))
        return fetchWithRetry(url, retries - 1, backoff * 2)
      }
      return null
    }

    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    if (retries > 0) {
      await delay(jitter(backoff))
      return fetchWithRetry(url, retries - 1, backoff * 2)
    }
    return null
  } finally {
    release()
  }
}

// =========================
// CORE LIST FETCHER
// =========================

async function fetchAnimeList(
  path: string,
  params: Record<string, any>,
  revalidate = 600
): Promise<AnimeResponse> {
  const url = buildUrl(path, params)
  const res = await fetchWithRetry<{ data: Anime[]; pagination?: Pagination }>(
    url
  )
  return res ? { data: res.data || [], pagination: res.pagination } : { data: [] }
}

// =========================
// PUBLIC API (SSR SAFE)
// =========================

/** ✅ SSR SAFE – PAGE 1 ONLY */
export async function getSeasonNow(): Promise<AnimeResponse> {
  return fetchAnimeList("/seasons/now", { limit: 25 }, 3600)
}

/** ✅ SSR SAFE – PAGE 1 ONLY */
export async function getTopAnime(): Promise<AnimeResponse> {
  return fetchAnimeList("/top/anime", { limit: 25 }, 3600)
}

/** ✅ SSR SAFE – PAGE 1 ONLY */
export async function getPopularAnime(): Promise<AnimeResponse> {
  return fetchAnimeList(
    "/top/anime",
    { filter: "bypopularity", limit: 25 },
    3600
  )
}

/** CLIENT PAGINATION */
export async function getSeasonNowPage(
  page: number
): Promise<AnimeResponse> {
  return fetchAnimeList(
    "/seasons/now",
    { limit: 25, page },
    3600
  )
}

/** SEARCH (CLIENT) */
export async function searchAnime(
  query: string,
  page = 1
): Promise<AnimeResponse> {
  return fetchAnimeList(
    "/anime",
    { q: query, page, limit: 25, sfw: true },
    300
  )
}
export async function getAnimeByGenre(
  genreIds: number | string,
  page = 1
): Promise<AnimeResponse> {
  const url = buildUrl("/anime", {
    genres: String(genreIds),
    page,
    limit: 25,
    order_by: "score",
    sort: "desc",
    sfw: true,
  })

  const res = await fetchWithRetry<{
    data: Anime[]
    pagination?: Pagination
  }>(url)

  return {
    data: res?.data || [],
    pagination: res?.pagination ?? null,
  }
}

/** DETAIL (SSR SAFE) */
export async function getAnimeDetail(
  mal_id: number
): Promise<Anime | null> {
  const res = await fetchWithRetry<{ data: Anime }>(
    `${JIKAN_API_BASE}/anime/${mal_id}/full`
  )
  return res?.data || null
}
