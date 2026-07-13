import type { Timestamp } from 'firebase-admin/firestore'

export type DayStatus = 'empty' | 'draft' | 'published'
export type ContentType = 'message' | 'gift' | 'activity' | 'media' | 'game'

// Content payloads — one per ContentType
export type MessageContent = {
  body: string
}

export type JarContent = {
  reasons: string[]
}

export type PlaylistContent = {
  notes: string[]
}

export type BookshelfContent = {
  memories: string[]
}

export type PuzzleContent = {
  message: string
}

export type MapContent = {
  notes: string[]
}

export type ConstellationContent = {
  notes: string[]
}

export type CouponContent = {
  coupons: { title: string; description: string }[]
}

export type AnyContent = MessageContent | JarContent | PlaylistContent | BookshelfContent | PuzzleContent | MapContent | ConstellationContent | CouponContent

// Full record — only used server-side / admin
export type Day = {
  dayNumber: number
  title: string
  status: DayStatus
  contentType: ContentType
  unlockAt: Timestamp
  openedAt: Timestamp | null
  completedAt: Timestamp | null
  content?: AnyContent
}

// Full day data for admin edit page (serializable)
export type AdminDayDetail = {
  dayNumber: number
  title: string
  status: DayStatus
  contentType: ContentType
  unlockAt: number
  content?: AnyContent
}

// Stripped record sent to the partner's calendar grid
// Never includes title, contentType, or any content payload
export type PublicDay = {
  dayNumber: number
  unlockAt: number        // Unix ms — safe to serialize
  isPublished: boolean
  isUnlocked: boolean
  isOpened: boolean
  isCompleted: boolean
}

// What admin sees in their grid
export type AdminDay = {
  dayNumber: number
  title: string
  status: DayStatus
  contentType: ContentType
  unlockAt: number        // Unix ms
  isOpened: boolean
  isCompleted: boolean
}
