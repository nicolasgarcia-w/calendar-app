export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { getAllDaysForAdmin } from '@/lib/days'
import { AdminCalendarGrid } from '@/app/components/CalendarGrid'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/home')

  const days = await getAllDaysForAdmin()

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-sm mx-auto">

        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🗓️</p>
          <h1 className="text-2xl font-semibold text-slate-800">Panel de Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Toca un día para editarlo</p>
        </div>

        <AdminCalendarGrid days={days} />

        <div className="text-center mt-8">
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-slate-400 hover:text-slate-600 underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
