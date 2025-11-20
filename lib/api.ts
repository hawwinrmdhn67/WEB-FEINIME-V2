const JIKAN_API_BASE = 'https://api.jikan.moe/v4'

// ==========================================
// 1. INTERFACES (TIPE DATA)
// ==========================================

// Helper Types
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

// --- GENRE ---
export interface Genre {
    mal_id: number
    name: string
    url: string
    count: number
}

// --- CHARACTER & VOICE ACTOR ---
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

// --- REVIEWS ---
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

// --- STATISTICS ---
export interface Statistics {
    watching: number
    completed: number
    on_hold: number
    dropped: number
    plan_to_watch: number
    total: number
}

// --- ANIME ---
export interface Anime {
    mal_id: number
    title: string
    title_english?: string
    images: {
        jpg: {
            image_url: string
            small_image_url: string
            large_image_url: string
        }
    }
    trailer?: { 
        url?: string | null
        embed_url?: string | null
        youtube_id?: string | null
    } | null
    type?: string
    source?: string
    episodes?: number | null
    status?: string
    // Mengubah score menjadi number | undefined karena data Jikan bisa mengembalikan undefined
    score?: number | undefined 
    synopsis?: string
    year?: number | null
    rank?: number
    popularity?: number
    aired?: { from: string; to?: string | null }
    genres?: JikanResource[]
    studios?: JikanResource[]
    relations?: Relation[]
}

// --- MANGA ---
export interface Manga {
    mal_id: number
    title: string
    title_english?: string
    images: { jpg: { large_image_url: string } }
    synopsis?: string
    status?: string
    score?: number | undefined
    chapters?: number | null
    volumes?: number | null
    authors?: JikanResource[] 
    published?: { from: string; to?: string | null }
    genres?: JikanResource[] 
    url?: string 
}

// Response Wrapper
export interface AnimeResponse {
    data: Anime[]
    pagination?: {
        last_visible_page: number
        has_next_page: boolean
        current_page: number
    }
}

// ==========================================
// 2. HELPER FUNCTIONS (RETRY LOGIC)
// ==========================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fungsi Fetch Pintar dengan Auto-Retry dan Exponential Backoff 
 * untuk menangani Rate Limit Jikan API (429).
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
    try {
        // Delay kecil global untuk menghindari rate limit agresif Jikan
        await delay(300)
        const res = await fetch(url, options)

        // Jika terkena Rate Limit (429), retry
        if (res.status === 429 && retries > 0) {
            console.warn(`[API] Rate limit hit for ${url}. Retrying in ${backoff}ms...`)
            await delay(backoff)
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }

        return res
    } catch (error) {
        // Retry pada error jaringan
        if (retries > 0) {
            await delay(backoff)
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }
        throw error
    }
}

// ==========================================
// 3. API FETCH FUNCTIONS
// ==========================================

// --- A. ANIME DETAIL ---
export async function getAnimeDetail(mal_id: number): Promise<Anime | null> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/full`, {
            next: { revalidate: 3600 } 
        })

        if (res.status === 404) return null
        if (!res.ok) return null
        
        const data = await res.json()
        return data.data as Anime
    } catch (error) {
        return null
    }
}

// --- B. SUB-DATA (Characters, Reviews, Stats) ---
export async function getAnimeCharacters(mal_id: number): Promise<Character[]> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/characters`, { 
            next: { revalidate: 3600 } 
        })
        if (!res.ok) return []
        const data = await res.json()
        return (data.data as Character[]).sort((a, b) => a.role === 'Main' ? -1 : 1).slice(0, 12)
    } catch (error) { return [] }
}

export async function getAnimeReviews(mal_id: number): Promise<Review[]> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/reviews?preliminary=true&spoiler=false`, { 
            next: { revalidate: 3600 } 
        })
        if (!res.ok) return []
        const data = await res.json()
        return (data.data as Review[]).slice(0, 6)
    } catch (error) { return [] }
}

export async function getAnimeStatistics(mal_id: number): Promise<Statistics | null> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/anime/${mal_id}/statistics`, { 
            next: { revalidate: 3600 } 
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.data as Statistics
    } catch (error) { return null }
}

// --- C. MANGA DETAIL ---
export async function getMangaDetail(mal_id: number): Promise<Manga | null> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/manga/${mal_id}/full`, { 
            next: { revalidate: 3600 } 
        })
        if (res.status === 404) return null
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        return data.data as Manga
    } catch (error) { return null }
}

// --- D. LIST FUNCTIONS ---

export async function getTopAnime(): Promise<AnimeResponse> {
    try {
        const [res1, res2] = await Promise.all([
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?page=1&limit=25`, { next: { revalidate: 3600 } }),
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?page=2&limit=25`, { next: { revalidate: 3600 } })
        ])

        if (!res1.ok || !res2.ok) throw new Error('Failed')

        const data1 = await res1.json()
        const data2 = await res2.json()

        return {
            data: [...data1.data, ...data2.data],
            pagination: data1.pagination
        }
    } catch (error) {
        return { data: [] }
    }
}

export async function getPopularAnime(): Promise<AnimeResponse> {
    try {
        const [res1, res2] = await Promise.all([
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?filter=bypopularity&page=1&limit=25`, { next: { revalidate: 3600 } }),
            fetchWithRetry(`${JIKAN_API_BASE}/top/anime?filter=bypopularity&page=2&limit=25`, { next: { revalidate: 3600 } })
        ])

        if (!res1.ok || !res2.ok) throw new Error('Failed')

        const data1 = await res1.json()
        const data2 = await res2.json()

        return {
            data: [...data1.data, ...data2.data],
            pagination: data1.pagination
        }
    } catch (error) { return { data: [] } }
}

export async function getSeasonNow(page = 1): Promise<AnimeResponse> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/seasons/now?page=${page}&limit=25`, { 
            next: { revalidate: 86400 } 
        })
        if (!res.ok) throw new Error('Failed')
        return await res.json()
    } catch (error) { return { data: [] } }
}

// 4. Search (MODIFIED: Accepts signal)
export async function searchAnime(query: string, page = 1, signal?: AbortSignal): Promise<AnimeResponse> {
    try {
        const url = `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=25&sfw=true`
        
        // Pass signal ke fetchWithRetry agar request bisa di-cancel
        const res = await fetchWithRetry(url, { 
            signal, // Ini kuncinya
            next: { revalidate: 300 } 
        })
        
        if (!res.ok) return { data: [] }
        return await res.json()
    } catch (error) { return { data: [] } }
}

// --- E. GENRE FUNCTIONS ---

export async function getGenres(): Promise<Genre[]> {
    try {
        const res = await fetchWithRetry(`${JIKAN_API_BASE}/genres/anime`, { next: { revalidate: 86400 } })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        return data.data
    } catch (error) { return [] }
}

export async function getAnimeByGenre(genreId: number): Promise<AnimeResponse> {
    try {
        const pages = [1, 2, 3, 4, 5]
        const promises = pages.map(page => 
            fetchWithRetry(
                `${JIKAN_API_BASE}/anime?genres=${genreId}&page=${page}&limit=25&order_by=start_date&sort=desc&sfw=true`, 
                { next: { revalidate: 3600 } }
            ).then(res => res.ok ? res.json() : { data: [] })
        )

        const results = await Promise.all(promises)
        const combinedData = results.flatMap(r => r.data || [])
        const uniqueData = Array.from(new Map(combinedData.map((item: Anime) => [item.mal_id, item])).values())

        return {
            data: uniqueData,
            pagination: { last_visible_page: 5, has_next_page: true, current_page: 1 }
        }
    } catch (error) { return { data: [] } }
}