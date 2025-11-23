import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'mylist.json')

function loadMyList(): number[] {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const mal_id = parseInt(url.searchParams.get('mal_id') || '0')
    if (!mal_id) return NextResponse.json({ exists: false })

    const myList = loadMyList()
    return NextResponse.json({ exists: myList.includes(mal_id) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ exists: false })
  }
}
