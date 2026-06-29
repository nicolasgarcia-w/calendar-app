import type { Timestamp } from 'firebase-admin/firestore'

export type DayStatus = 'empty' | 'draft' | 'published'
export type ContentType = 'message' | 'gift' | 'activity' | 'media' | 'game'

// Content payloads — one per ContentType
export type MessageContent = {
  body: string
}

// Full record — only used server-side / admin
export type Day = {
  dayNumber: number
  title: string
  status: DayStatus
  contentType: ContentType
  unlockAt: Timestamp
  openedAt: Timestamp | null
  completedAt: Timestamp | null
  content?: MessageContent  // grows as we add more content types
}

// Full day data for admin edit page (serializable)
export type AdminDayDetail = {
  dayNumber: number
  title: string
  status: DayStatus
  contentType: ContentType
  unlockAt: number
  content?: MessageContent
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
