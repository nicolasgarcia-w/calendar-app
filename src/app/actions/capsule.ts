'use server'
import { Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebaseAdmin'
import { getSession } from '@/lib/session'

export async function sealCapsuleAction(formData: FormData) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const message = String(formData.get('message') ?? '').trim()
  const email   = String(formData.get('email') ?? '').trim()
  const years   = Number(formData.get('years') ?? 1)

  if (!email || !message) return { error: 'Faltan campos requeridos.' }

  const now    = new Date()
  const sendAt = new Date(now)
  sendAt.setFullYear(sendAt.getFullYear() + years)

  await adminDb.collection('capsules').add({
    userId:    session.uid,
    email,
    message,
    years,
    createdAt: Timestamp.fromDate(now),
    sendAt:    Timestamp.fromDate(sendAt),
    sent:      false,
  })

  return { ok: true, sendAt: sendAt.toISOString() }
}
