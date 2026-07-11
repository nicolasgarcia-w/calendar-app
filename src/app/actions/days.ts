'use server'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { saveDayDraft, publishDay, unpublishDay, markDayOpened } from '@/lib/days'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Unauthorized')
}

function extractContent(dayNumber: number, formData: FormData) {
  if (dayNumber === 4) {
    const reasons: string[] = []
    for (let i = 0; i < 20; i++) {
      reasons.push(String(formData.get(`reason_${i}`) ?? '').trim())
    }
    return { reasons }
  }
  if (dayNumber === 5) {
    const notes: string[] = []
    for (let i = 0; i < 5; i++) {
      notes.push(String(formData.get(`note_${i}`) ?? '').trim())
    }
    return { notes }
  }
  if (dayNumber === 6) {
    const memories: string[] = []
    for (let i = 0; i < 5; i++) {
      memories.push(String(formData.get(`memory_${i}`) ?? '').trim())
    }
    return { memories }
  }
  if (dayNumber === 7) {
    return { message: String(formData.get('message') ?? '').trim() }
  }
  if (dayNumber === 10) {
    const notes: string[] = []
    for (let i = 0; i < 3; i++) {
      notes.push(String(formData.get(`note_${i}`) ?? '').trim())
    }
    return { notes }
  }
  return { body: String(formData.get('body') ?? '') }
}

export async function saveDraftAction(formData: FormData) {
  await requireAdmin()
  const dayNumber = Number(formData.get('dayNumber'))
  const title = String(formData.get('title') ?? '')
  await saveDayDraft(dayNumber, title, extractContent(dayNumber, formData))
  redirect(`/admin/day/${dayNumber}?saved=1`)
}

export async function publishDayAction(formData: FormData) {
  await requireAdmin()
  const dayNumber = Number(formData.get('dayNumber'))
  const title = String(formData.get('title') ?? '')
  await publishDay(dayNumber, title, extractContent(dayNumber, formData))
  redirect(`/admin/day/${dayNumber}?published=1`)
}

export async function unpublishDayAction(formData: FormData) {
  await requireAdmin()
  const dayNumber = Number(formData.get('dayNumber'))
  await unpublishDay(dayNumber)
  redirect(`/admin/day/${dayNumber}`)
}

export async function markOpenedAction(dayNumber: number) {
  const session = await getSession()
  if (!session || session.role !== 'partner') return
  await markDayOpened(dayNumber)
}
