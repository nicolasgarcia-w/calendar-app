export const dynamic = 'force-dynamic'

import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getDayForAdmin } from '@/lib/days'
import { saveDraftAction, publishDayAction, unpublishDayAction } from '@/app/actions/days'

type Props = { params: Promise<{ dayNumber: string }>; searchParams: Promise<{ saved?: string; published?: string }> }

const STATUS_BADGE: Record<string, string> = {
  empty:     'bg-slate-100 text-slate-500',
  draft:     'bg-amber-100 text-amber-700',
  published: 'bg-rose-100 text-rose-700',
}

const STATUS_LABEL: Record<string, string> = {
  empty:     'vacío',
  draft:     'borrador',
  published: 'publicado',
}

export default async function AdminDayPage({ params, searchParams }: Props) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/home')

  const { dayNumber: dayParam } = await params
  const { saved, published: publishedParam } = await searchParams
  const dayNumber = Number(dayParam)

  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) redirect('/admin')

  const day = await getDayForAdmin(dayNumber)
  if (!day) redirect('/admin')

  const unlockDate = new Date(day.unlockAt).toLocaleString('es-ES', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  const toast = saved ? 'Guardado como borrador.' : publishedParam ? '¡Publicado! Ella puede verlo ahora.' : null

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <a href="/admin" className="text-slate-400 hover:text-slate-600 text-sm">← Calendario</a>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-semibold text-slate-800">Día {dayNumber}</h1>
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[day.status]}`}>
            {STATUS_LABEL[day.status]}
          </span>
        </div>

        {toast && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2">
            {toast}
          </div>
        )}

        <p className="text-xs text-slate-400 mb-6">Se desbloquea: {unlockDate}</p>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form className="flex flex-col gap-4">
            <input type="hidden" name="dayNumber" value={dayNumber} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="title">
                Título
              </label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={day.title}
                placeholder="ej. Día 1 — Una notita para ti"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="body">
                Mensaje
              </label>
              <textarea
                id="body"
                name="body"
                rows={10}
                defaultValue={day.content?.body ?? ''}
                placeholder="Escribe tu mensaje aquí…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1">Los saltos de línea se conservan.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                formAction={saveDraftAction}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Guardar borrador
              </button>
              <button
                formAction={publishDayAction}
                className="w-full rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                {day.status === 'published' ? 'Actualizar y mantener publicado' : 'Publicar'}
              </button>
            </div>
          </form>

          {day.status === 'published' && (
            <form className="mt-3">
              <input type="hidden" name="dayNumber" value={dayNumber} />
              <button
                formAction={unpublishDayAction}
                className="w-full rounded-lg py-2 text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Despublicar (volver a borrador)
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          <a href={`/home?preview=${dayNumber}`} className="underline hover:text-rose-500">
            Vista previa como pareja →
          </a>
        </p>
      </div>
    </div>
  )
}
