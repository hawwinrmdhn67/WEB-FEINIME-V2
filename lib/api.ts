// lib/api.ts

const JIKAN_API_BASE = 'https://api.jikan.moe/v4'

// =========================
// 1. INTERFACES / TYPES
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
  duration: string
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
  pagination?: Pagination
}

// =========================
// 2. RATE LIMITER & QUEUE SYSTEM
// =========================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * GLOBAL QUEUE:
 * Variabel ini bertugas menampung Promise chain.
 * FIX: Menggunakan Promise<any> agar kompatibel dengan berbagai return type.
 */
let apiQueue: Promise<any> = Promise.resolve()

/**
 * scheduleRequest:
 * Fungsi ini memastikan setiap request ke API Jikan diberi jeda waktu 400ms
 * dan dieksekusi secara berurutan (sequential).
 */
function scheduleRequest(callback: () => Promise<Response>): Promise<Response> {
  // Tambahkan request baru ke ujung antrian
  const operation = apiQueue.then(async () => {
    // Tunggu 400ms SEBELUM melakukan fetch
    await delay(400)
    return callback()
  })

  // Update pointer antrian agar request berikutnya menunggu request ini selesai
  // Kita catch error agar jika satu request gagal, antrian tidak macet
  apiQueue = operation.catch(() => {})

  return operation
}

/**
 * fetchWithRetry:
 * Menggunakan scheduleRequest untuk membungkus fetch.
 * Jika masih terkena 429, dia akan melakukan retry dengan backoff.
 */
async function fetchWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 1000
): Promise<T | null> {
  const url = endpoint.startsWith('http') ? endpoint : `${JIKAN_API_BASE}${endpoint}`

  try {
    // PENTING: Gunakan scheduleRequest, jangan langsung fetch
    const res = await scheduleRequest(() => fetch(url, options))

    // Jika masih terkena limit (kasus sangat jarang dengan queue), lakukan retry manual
    if (res.status === 429) {
      if (retries > 0) {
        console.warn(`[API 429] Rate limit hit for ${url}, queueing retry in ${backoff}ms...`)
        await delay(backoff)
        return fetchWithRetry<T>(endpoint, options, retries - 1, backoff * 2)
      } else {
        console.error(`[API Fail] Max retries reached for ${url}`)
        return null
      }
    }

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch (err) {
    if (retries > 0) {
      await delay(backoff)
      return fetchWithRetry<T>(endpoint, options, retries - 1, backoff * 2)
    }
    console.error(`[API Error] ${err}`)
    return null
  }
}

/**
 * Helper untuk membangun URL dengan Query Params
 */
function buildUrl(path: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(`${JIKAN_API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

/**
 * fetchAnimeList:
 * Mengambil list anime dengan dukungan pagination otomatis melalui Queue System.
 */
async function fetchAnimeList(
  path: string,
  params: Record<string, any>,
  pages = 1,
  revalidate = 3600
): Promise<AnimeResponse> {
  try {
    if (pages === 1) {
      const url = buildUrl(path, params)
      const data = await fetchWithRetry<AnimeResponse>(url, { next: { revalidate } })
      return data || { data: [] }
    }

    // Buat array promise untuk setiap halaman
    const promises = []
    for (let i = 1; i <= pages; i++) {
      const url = buildUrl(path, { ...params, page: i })
      promises.push(fetchWithRetry<AnimeResponse>(url, { next: { revalidate } }))
    }

    // Jalankan (scheduleRequest akan membuatnya sequential otomatis)
    const results = await Promise.all(promises)
    
    const allData = results.flatMap((r) => r?.data || [])
    const lastResult = results.findLast((r) => r?.pagination) 
    
    return { 
      data: allData, 
      pagination: lastResult?.pagination 
    }
  } catch (error) {
    console.error('Fetch list error:', error)
    return { data: [] }
  }
}

// =========================
// 3. API FUNCTIONS
// =========================

// A. Detail Anime
export async function getAnimeDetail(mal_id: number): Promise<Anime | null> {
  const res = await fetchWithRetry<{ data: Anime }>(`/anime/${mal_id}/full`, {
    next: { revalidate: 3600 },
  })
  return res?.data || null
}

// B. Characters / Reviews / Statistics
export async function getAnimeCharacters(mal_id: number): Promise<Character[]> {
  const res = await fetchWithRetry<{ data: Character[] }>(`/anime/${mal_id}/characters`, {
    next: { revalidate: 3600 },
  })
  
  if (!res?.data) return []
  
  return res.data
    .sort((a, b) => (a.role === 'Main' ? -1 : 1))
    .slice(0, 12)
}

export async function getAnimeReviews(mal_id: number): Promise<Review[]> {
  const res = await fetchWithRetry<{ data: Review[] }>(
    `/anime/${mal_id}/reviews?preliminary=true&spoiler=false`,
    { next: { revalidate: 3600 } }
  )
  return res?.data ? res.data.slice(0, 6) : []
}

export async function getAnimeStatistics(mal_id: number): Promise<Statistics | null> {
  const res = await fetchWithRetry<{ data: Statistics }>(`/anime/${mal_id}/statistics`, {
    next: { revalidate: 3600 },
  })
  return res?.data || null
}

// C. Manga Detail
export async function getMangaDetail(mal_id: number): Promise<Manga | null> {
  const res = await fetchWithRetry<{ data: Manga }>(`/manga/${mal_id}/full`, {
    next: { revalidate: 3600 },
  })
  return res?.data || null
}

// D. Lists

export async function getTopAnime(): Promise<AnimeResponse> {
  return fetchAnimeList('/top/anime', { limit: 25 }, 2)
}

export async function getPopularAnime(): Promise<AnimeResponse> {
  return fetchAnimeList('/top/anime', { filter: 'bypopularity', limit: 25 }, 2)
}

// E. Season

export async function getSeasonNow(page = 1): Promise<AnimeResponse> {
  return fetchAnimeList('/seasons/now', { limit: 25, page }, 1, 86400)
}

export async function getSeasonUpcoming(): Promise<AnimeResponse> {
  return fetchAnimeList('/seasons/upcoming', { limit: 25 }, 2, 86400)
}

// F. Search
export async function searchAnime(query: string, page = 1, signal?: AbortSignal): Promise<AnimeResponse> {
  const url = buildUrl('/anime', {
    q: query,
    page,
    limit: 25,
    sfw: true
  })
  
  const res = await fetchWithRetry<AnimeResponse>(url, { next: { revalidate: 300 } })
  return res || { data: [] }
}

// G. Genres
export async function getGenres(): Promise<Genre[]> {
  const res = await fetchWithRetry<{ data: Genre[] }>('/genres/anime', {
    next: { revalidate: 86400 },
  })
  return res?.data || []
}

// Optimized: Fetch 5 halaman dengan Queue System
export async function getAnimeByGenre(genreId: number): Promise<AnimeResponse> {
  const LIMIT_PAGES = 5
  
  try {
    const promises = []
    
    // Kita request 5 halaman sekaligus.
    // Berkat scheduleRequest, ini tidak akan ditembak bersamaan.
    for (let page = 1; page <= LIMIT_PAGES; page++) {
      const url = buildUrl('/anime', {
        genres: genreId,
        page: page,
        limit: 25,
        order_by: 'start_date',
        sort: 'desc',
        sfw: true
      })

      promises.push(fetchWithRetry<AnimeResponse>(url, { next: { revalidate: 3600 } }))
    }

    const results = await Promise.all(promises)
    const combinedData = results.flatMap(r => r?.data || [])

    // Dedup: Hilangkan duplikat
    const uniqueMap = new Map<number, Anime>()
    combinedData.forEach(item => {
        if(!uniqueMap.has(item.mal_id)) {
            uniqueMap.set(item.mal_id, item)
        }
    })
    
    const uniqueData = Array.from(uniqueMap.values())

    return {
      data: uniqueData,
      pagination: {
        last_visible_page: LIMIT_PAGES,
        has_next_page: true,
        current_page: 1,
      }
    }

  } catch (e) {
    console.error("Error fetching genre:", e)
    return { data: [] }
  }
}