import { getSeasonNow } from '@/lib/api'
import SeasonalClient from './seasonal-client'

export default async function SeasonalPage() {
  const res = await getSeasonNow()
  const animes = res.data ?? []

  return <SeasonalClient animes={animes} />
}
