export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getDayForPartner } from '@/lib/days'
import { MessageReveal } from '@/app/components/MessageReveal'
import { CrosswordReveal } from '@/app/components/CrosswordReveal'
import { WNRSReveal } from '@/app/components/WNRSReveal'
import { ConstellationReveal } from '@/app/components/ConstellationReveal'

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
    if (dayNumber === 2) {
      return <CrosswordReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} />
    }
    if (dayNumber === 3) {
      return <WNRSReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} />
    }
    if (dayNumber === 11) {
      return <ConstellationReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} />
    }
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

  if (dayNumber === 2) {
    return <CrosswordReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} />
  }
  if (dayNumber === 3) {
    return <WNRSReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} />
  }
  if (dayNumber === 11) {
    return <ConstellationReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} />
  }

  return (
    <MessageReveal
      dayNumber={dayNumber}
      title={day.title}
      body={day.content?.body ?? ''}
      alreadyOpened={day.openedAt !== null}
    />
  )
}
