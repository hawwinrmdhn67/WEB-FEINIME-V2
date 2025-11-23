import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'mylist.json')

function loadMyList(): number[] {
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function saveMyList(list: number[]) {
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2))
}

export async function POST(req: NextRequest) {
  try {
    const { mal_id } = await req.json()
    if (!mal_id) return NextResponse.json({ error: 'mal_id required' }, { status: 400 })

    let myList = loadMyList()
    if (!myList.includes(mal_id)) return NextResponse.json({ error: 'Anime not found' }, { status: 404 })

    myList = myList.filter(id => id !== mal_id)
    saveMyList(myList)

    return NextResponse.json({ success: true, action: 'removed', mal_id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to remove anime' }, { status: 500 })
  }
}
