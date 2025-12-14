import {
  getTopAnime,
  getSeasonNow,
  getPopularAnime,
} from '@/lib/api'
import HomeClient from './home-client'

export default async function HomePage() {
  const [top, seasonal, popular] = await Promise.all([
    getTopAnime(),
    getSeasonNow(),
    getPopularAnime(),
  ])

  return (
    <HomeClient
      topAnimeData={top.data ?? []}
      seasonalAnime={seasonal.data ?? []}
      popularAnime={popular.data ?? []}
    />
  )
}
