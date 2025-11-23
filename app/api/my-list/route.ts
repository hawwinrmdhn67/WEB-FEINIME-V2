import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Anime } from '@/lib/api'
import { getAnimeDetail } from '@/lib/api'

const filePath = path.join(process.cwd(), 'mylist.json')

function loadMyList(): number[] {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export async function GET(req: NextRequest) {
  try {
    const myListIds = loadMyList()
    const animePromises = myListIds.map(id => getAnimeDetail(id))
    const animeList = (await Promise.all(animePromises)).filter(a => a !== null) as Anime[]
    return NextResponse.json(animeList)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}
