import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getDayForPartner } from '@/lib/days'
import { MessageReveal } from '@/app/components/MessageReveal'

type Props = { params: Promise<{ dayNumber: string }> }

export default async function DayPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { dayNumber: dayParam } = await params
  const dayNumber = Number(dayParam)
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) redirect('/home')

  // Admin can preview any published day
  if (session.role === 'admin') {
    const { getDayForAdmin } = await import('@/lib/days')
    const day = await getDayForAdmin(dayNumber)
    if (!day || day.status !== 'published') redirect('/admin')
    return (
      <MessageReveal
        dayNumber={dayNumber}
        title={day.title}
        body={day.content?.body ?? ''}
        alreadyOpened={true}
      />
    )
  }

  // Partner — enforces published + unlocked server-side
  const day = await getDayForPartner(dayNumber)
  if (!day) redirect('/home')

  return (
    <MessageReveal
      dayNumber={dayNumber}
      title={day.title}
      body={day.content?.body ?? ''}
      alreadyOpened={day.openedAt !== null}
    />
  )
}
