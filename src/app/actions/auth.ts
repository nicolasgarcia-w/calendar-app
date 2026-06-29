'use server'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID!
const PARTNER_UID = process.env.NEXT_PUBLIC_PARTNER_UID!

export async function createSessionAction(uid: string) {
  if (uid === ADMIN_UID) {
    await createSession(uid, 'admin')
    redirect('/admin')
  } else if (uid === PARTNER_UID) {
    await createSession(uid, 'partner')
    redirect('/home')
  } else {
    throw new Error('Unauthorized')
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect('/login')
}
