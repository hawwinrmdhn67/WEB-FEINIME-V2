import { searchAnime } from '@/lib/api'
import type { Anime } from '@/lib/api'

const cache = new Map<string, Anime[]>()
const queue: {
  query: string
  resolve: (data: Anime[]) => void
  reject: (err: any) => void
}[] = []
let processing = false
const MIN_REQUEST_INTERVAL = 1000 // 1 detik per request

async function processQueue() {
  if (processing) return
  processing = true

  while (queue.length > 0) {
    const { query, resolve, reject } = queue.shift()!
    try {
      if (cache.has(query)) resolve(cache.get(query)!)
      else {
        const data = await searchAnime(query)
        cache.set(query, data.data)
        resolve(data.data)
      }
    } catch (err) {
      reject(err)
    }
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL))
  }

  processing = false
}

export function getAnimeSearch(query: string): Promise<Anime[]> {
  return new Promise((resolve, reject) => {
    queue.push({ query, resolve, reject })
    processQueue()
  })
}
