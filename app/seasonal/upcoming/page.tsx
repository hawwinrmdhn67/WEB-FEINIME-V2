import { getSeasonUpcoming, Anime } from '@/lib/api'
import UpcomingClient from './upcoming-client'

export default async function UpcomingPage() {
  const res = await getSeasonUpcoming()
  const rawData: Anime[] = res.data ?? []
  const uniqueData = Array.from(
    new Map(rawData.map(item => [item.mal_id, item])).values()
  )

  const safeData = uniqueData.filter(
    item => !item.genres?.some(g => g.name === 'Hentai')
  )

  const finalData = safeData.slice(0, 50)

  return <UpcomingClient animes={finalData} />
}
