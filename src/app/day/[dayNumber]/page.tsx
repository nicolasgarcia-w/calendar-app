export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getDayForPartner } from '@/lib/days'
import { MessageReveal } from '@/app/components/MessageReveal'
import { CrosswordReveal } from '@/app/components/CrosswordReveal'
import { WNRSReveal } from '@/app/components/WNRSReveal'
import { ConstellationReveal } from '@/app/components/ConstellationReveal'
import { LuckyJarReveal } from '@/app/components/LuckyJarReveal'
import { PlaylistReveal } from '@/app/components/PlaylistReveal'
import { BookshelfReveal } from '@/app/components/BookshelfReveal'
import { PuzzleReveal } from '@/app/components/PuzzleReveal'

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
    if (dayNumber === 4) {
      const reasons = (day.content as { reasons?: string[] } | undefined)?.reasons ?? []
      return <LuckyJarReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} isPreview reasons={reasons} />
    }
    if (dayNumber === 5) {
      const notes = (day.content as { notes?: string[] } | undefined)?.notes ?? []
      return <PlaylistReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} isPreview notes={notes} />
    }
    if (dayNumber === 6) {
      const memories = (day.content as { memories?: string[] } | undefined)?.memories ?? []
      return <BookshelfReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} isPreview memories={memories} />
    }
    if (dayNumber === 7) {
      const message = (day.content as { message?: string } | undefined)?.message ?? ''
      return <PuzzleReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} isPreview message={message} />
    }
    if (dayNumber === 11) {
      return <ConstellationReveal dayNumber={dayNumber} title={day.title} alreadyOpened={true} />
    }
    return (
      <MessageReveal
        dayNumber={dayNumber}
        title={day.title}
        body={(day.content as { body?: string } | undefined)?.body ?? ''}
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
  if (dayNumber === 4) {
    const reasons = (day.content as { reasons?: string[] } | undefined)?.reasons ?? []
    return <LuckyJarReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} reasons={reasons} />
  }
  if (dayNumber === 5) {
    const notes = (day.content as { notes?: string[] } | undefined)?.notes ?? []
    return <PlaylistReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} notes={notes} />
  }
  if (dayNumber === 6) {
    const memories = (day.content as { memories?: string[] } | undefined)?.memories ?? []
    return <BookshelfReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} memories={memories} />
  }
  if (dayNumber === 7) {
    const message = (day.content as { message?: string } | undefined)?.message ?? ''
    return <PuzzleReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} message={message} />
  }
  if (dayNumber === 11) {
    return <ConstellationReveal dayNumber={dayNumber} title={day.title} alreadyOpened={day.openedAt !== null} />
  }

  return (
    <MessageReveal
      dayNumber={dayNumber}
      title={day.title}
      body={(day.content as { body?: string } | undefined)?.body ?? ''}
      alreadyOpened={day.openedAt !== null}
    />
  )
}
