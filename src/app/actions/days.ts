'use server'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { saveDayDraft, publishDay, unpublishDay, markDayOpened } from '@/lib/days'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') throw new Error('Unauthorized')
}

export async function saveDraftAction(formData: FormData) {
  await requireAdmin()
  const dayNumber = Number(formData.get('dayNumber'))
  const title = String(formData.get('title') ?? '')
  const body = String(formData.get('body') ?? '')
  await saveDayDraft(dayNumber, title, { body })
  redirect(`/admin/day/${dayNumber}?saved=1`)
}

export async function publishDayAction(formData: FormData) {
  await requireAdmin()
  const dayNumber = Number(formData.get('dayNumber'))
  const title = String(formData.get('title') ?? '')
  const body = String(formData.get('body') ?? '')
  await publishDay(dayNumber, title, { body })
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
  if (!session) throw new Error('Unauthorized')
  await markDayOpened(dayNumber)
}
