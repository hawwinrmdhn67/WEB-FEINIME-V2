import { NextRequest, NextResponse } from 'next/server'
import { getAnimeSearch } from '@/lib/searchProxy'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  try {
    const data = await getAnimeSearch(query)
    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Server proxy search failed:', err)
    return NextResponse.json({ error: err.message || 'Failed to search' }, { status: 500 })
  }
}
