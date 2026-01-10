'use client'

import dynamic from 'next/dynamic'

const SearchPage = dynamic(() => import('@/components/search-page'), { ssr: false })

export default function Page() {
  return <SearchPage />
}
