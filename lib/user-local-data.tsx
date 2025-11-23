// lib/userLocalData.ts
export type HistoryItem = {
  mal_id: number
  title: string
  image: string
  viewed_at: string // ISO
}

export type UserData = {
  history?: HistoryItem[]
  ratings?: Record<number, number>
  progress?: Record<number, number>
  favorites?: number[]
  shares?: number
}

const STORAGE_KEY = 'feinime_user_data'

export function getUserData(): UserData {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (!raw) return { history: [], ratings: {}, progress: {}, favorites: [], shares: 0 }
    return JSON.parse(raw) as UserData
  } catch {
    return { history: [], ratings: {}, progress: {}, favorites: [], shares: 0 }
  }
}

export function saveUserData(data: UserData) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  } catch (e) {
    console.error('Failed saving feinime user data', e)
  }
}

export function clearUserData() {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}
