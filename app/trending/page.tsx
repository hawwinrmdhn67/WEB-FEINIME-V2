import { getTopAnime } from '@/lib/api'
import TrendingClient from './trending-client'

export default async function TrendingPage() {
  const res = await getTopAnime()
  const data = res.data ?? []

  return <TrendingClient initialAnimes={data} />
}
