export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { getAllDaysForPartner } from '@/lib/days'
import { PartnerCalendarGrid } from '@/app/components/CalendarGrid'
import { ProgressBar } from '@/app/components/ProgressBar'

export default async function HomePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const days = await getAllDaysForPartner()
  const opened = days.filter((d) => d.isOpened).length

  return (
    <div className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-sm mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-4xl mb-2">💝</p>
          <h1 className="text-2xl font-semibold text-rose-700">Your Calendar</h1>
          <p className="text-sm text-rose-300 mt-1">31 days, just for you</p>
        </div>

        {/* Progress */}
        <ProgressBar opened={opened} total={31} />

        {/* Calendar card */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <PartnerCalendarGrid days={days} />
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-slate-400 hover:text-rose-500 underline">
              Sign out
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
