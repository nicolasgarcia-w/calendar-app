export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { getAllDaysForPartner } from '@/lib/days'
import { PartnerCalendarGrid } from '@/app/components/CalendarGrid'
import { ProgressBar } from '@/app/components/ProgressBar'

type Props = { searchParams: Promise<{ preview?: string }> }

export default async function HomePage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { preview } = await searchParams
  const previewDay = session.role === 'admin' ? Number(preview) || null : null

  const days = await getAllDaysForPartner()

  // If admin is previewing a day, force that day to appear unlocked and unread
  const displayDays = previewDay
    ? days.map((d) =>
        d.dayNumber === previewDay
          ? { ...d, isPublished: true, isUnlocked: true, isOpened: false, isCompleted: false }
          : d
      )
    : days

  const opened = days.filter((d) => d.isOpened).length

  return (
    <div className="min-h-screen bg-rose-50 px-4 py-8">
      <div className="max-w-md mx-auto flex flex-col gap-6">

        {previewDay && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-amber-700 font-medium">
              Vista previa — Día {previewDay} aparece desbloqueado
            </p>
            <a href="/admin" className="text-xs text-amber-500 underline">← Volver al admin</a>
          </div>
        )}

        <div className="text-center">
          <p className="text-4xl mb-2">💝</p>
          <h1 className="text-2xl font-semibold text-rose-700">Tu Calendario</h1>
          <p className="text-sm text-rose-400 mt-1 font-medium">de Nico</p>
          <p className="text-sm text-rose-300">a Camille</p>
        </div>

        <ProgressBar opened={opened} total={31} />

        <div className="bg-white rounded-2xl shadow-sm p-4 w-full">
          <PartnerCalendarGrid days={displayDays} />
        </div>

        <div className="text-center pb-4">
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-slate-400 hover:text-rose-500 underline">
              Cerrar sesión
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
