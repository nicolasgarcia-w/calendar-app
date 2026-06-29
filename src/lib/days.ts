import 'server-only'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { adminDb } from './firebaseAdmin'
import type { Day, PublicDay, AdminDay, AdminDayDetail, MessageContent } from './types'

export async function getAllDaysForAdmin(): Promise<AdminDay[]> {
  const snap = await adminDb.collection('days').orderBy('dayNumber').get()

  return snap.docs.map((doc) => {
    const d = doc.data() as Day
    return {
      dayNumber: d.dayNumber,
      title: d.title,
      status: d.status,
      contentType: d.contentType,
      unlockAt: d.unlockAt.toMillis(),
      isOpened: d.openedAt !== null,
      isCompleted: d.completedAt !== null,
    }
  })
}

export async function getAllDaysForPartner(): Promise<PublicDay[]> {
  const snap = await adminDb.collection('days').orderBy('dayNumber').get()
  const now = Date.now()

  return snap.docs.map((doc) => {
    const d = doc.data() as Day
    const unlockMs = d.unlockAt.toMillis()
    return {
      dayNumber: d.dayNumber,
      unlockAt: unlockMs,
      isPublished: d.status === 'published',
      isUnlocked: unlockMs <= now,
      isOpened: d.openedAt !== null,
      isCompleted: d.completedAt !== null,
    }
  })
}

export async function getDayForAdmin(dayNumber: number): Promise<AdminDayDetail | null> {
  const doc = await adminDb.collection('days').doc(String(dayNumber)).get()
  if (!doc.exists) return null
  const d = doc.data() as Day
  return {
    dayNumber: d.dayNumber,
    title: d.title,
    status: d.status,
    contentType: d.contentType,
    unlockAt: d.unlockAt.toMillis(),
    content: d.content,
  }
}

// Returns full day only if it's published + unlocked — never leaks locked content
export async function getDayForPartner(dayNumber: number): Promise<(AdminDayDetail & { openedAt: number | null }) | null> {
  const doc = await adminDb.collection('days').doc(String(dayNumber)).get()
  if (!doc.exists) return null
  const d = doc.data() as Day
  const now = Date.now()
  if (d.status !== 'published' || d.unlockAt.toMillis() > now) return null
  return {
    dayNumber: d.dayNumber,
    title: d.title,
    status: d.status,
    contentType: d.contentType,
    unlockAt: d.unlockAt.toMillis(),
    content: d.content,
    openedAt: d.openedAt ? d.openedAt.toMillis() : null,
  }
}

export async function saveDayDraft(dayNumber: number, title: string, content: MessageContent) {
  await adminDb.collection('days').doc(String(dayNumber)).update({
    title,
    content,
    status: 'draft',
  })
}

export async function publishDay(dayNumber: number, title: string, content: MessageContent) {
  await adminDb.collection('days').doc(String(dayNumber)).update({
    title,
    content,
    status: 'published',
  })
}

export async function unpublishDay(dayNumber: number) {
  await adminDb.collection('days').doc(String(dayNumber)).update({
    status: 'draft',
  })
}

export async function markDayOpened(dayNumber: number) {
  await adminDb.collection('days').doc(String(dayNumber)).update({
    openedAt: FieldValue.serverTimestamp(),
  })
}
