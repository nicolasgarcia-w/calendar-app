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

            {dayNumber === 4 ? (() => {
              const saved = (day.content as { reasons?: string[] } | undefined)?.reasons ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Razones (20 papelitos · tarro 1: 1–10, tarro 2: 11–20)
                  </label>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs text-slate-400 w-5 pt-2.5 text-right shrink-0">{i + 1}</span>
                        <textarea
                          name={`reason_${i}`}
                          rows={2}
                          defaultValue={saved[i] ?? ''}
                          placeholder={`Razón #${i + 1}…`}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })() : dayNumber === 5 ? (() => {
              const SONG_TITLES = ['Ojos Color Sol — Calle 13', 'Dime Que No — Ricardo Arjona', 'Who Knows — Daniel Caesar', 'Química Mayor — Mon Laferte', 'Tuki Tuki — Kris R']
              const saved = (day.content as { notes?: string[] } | undefined)?.notes ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nota por canción
                  </label>
                  <div className="flex flex-col gap-3">
                    {SONG_TITLES.map((songTitle, i) => (
                      <div key={i}>
                        <p className="text-xs text-slate-500 mb-1">{i + 1}. {songTitle}</p>
                        <textarea
                          name={`note_${i}`}
                          rows={2}
                          defaultValue={saved[i] ?? ''}
                          placeholder="Tu nota para esta canción…"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Fotos: <code>public/playlist/photo1.jpg</code> … <code>photo6.jpg</code> · Audio: <code>public/playlist/song1.mp3</code> … <code>song6.mp3</code></p>
                </div>
              )
            })() : dayNumber === 6 ? (() => {
              const BOOK_LABELS = ['The Shining — Stephen King', 'Veinte poemas de amor y una canción desesperada — Neruda', 'Project Hail Mary — Andy Weir', 'Puerto Rico — Jorell Meléndez Badillo', 'The Old Man and the Sea — Hemingway']
              const saved = (day.content as { memories?: string[] } | undefined)?.memories ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recuerdo por libro
                  </label>
                  <div className="flex flex-col gap-3">
                    {BOOK_LABELS.map((label, i) => (
                      <div key={i}>
                        <p className="text-xs text-slate-500 mb-1">{i + 1}. {label}</p>
                        <textarea
                          name={`memory_${i}`}
                          rows={3}
                          defaultValue={saved[i] ?? ''}
                          placeholder="Tu recuerdo o nota para este libro…"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })() : dayNumber === 10 ? (() => {
              const PIN_LABELS = ['Nuestro banco — En el parque', 'El muelle — Public Garden', 'Flour Bakery — Cerca']
              const savedNotes = (day.content as { notes?: string[] } | undefined)?.notes ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nota por pin del mapa</label>
                  <div className="flex flex-col gap-3">
                    {PIN_LABELS.map((label, i) => (
                      <div key={i}>
                        <p className="text-xs text-slate-500 mb-1">{i + 1}. {label}</p>
                        <textarea
                          name={`note_${i}`}
                          rows={3}
                          defaultValue={savedNotes[i] ?? ''}
                          placeholder="Tu nota para este lugar…"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })() : dayNumber === 11 ? (() => {
              const DAY_LABELS = Array.from({ length: 13 }, (_, i) => `Día ${i + 1}${i === 12 ? ' (video)' : ''}`)
              const savedNotes = (day.content as { notes?: string[] } | undefined)?.notes ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nota por día en California</label>
                  <p className="text-xs text-slate-400 mb-3">Fotos: <code>public/constellation/day1.jpeg</code> … <code>day13.jpeg</code> · Video: <code>public/constellation/day13.mp4</code></p>
                  <div className="flex flex-col gap-3">
                    {DAY_LABELS.map((label, i) => (
                      <div key={i}>
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <textarea
                          name={`note_${i}`}
                          rows={2}
                          defaultValue={savedNotes[i] ?? ''}
                          placeholder={`Tu nota para el ${label.toLowerCase()}…`}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })() : dayNumber === 12 ? (() => {
              const savedCoupons = (day.content as { coupons?: { title: string; description: string }[] } | undefined)?.coupons ?? []
              return (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Cupones (5)</label>
                  <div className="flex flex-col gap-5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Cupón {i + 1}</p>
                        <div className="flex flex-col gap-2">
                          <input
                            name={`coupon_title_${i}`}
                            type="text"
                            defaultValue={savedCoupons[i]?.title ?? ''}
                            placeholder="Título del cupón…"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                          />
                          <textarea
                            name={`coupon_desc_${i}`}
                            rows={2}
                            defaultValue={savedCoupons[i]?.description ?? ''}
                            placeholder="Descripción del cupón…"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed bg-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })() : dayNumber === 9 ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-700 mb-1">Wordle — dos puzzles</p>
                <p>Palabra 1: <code className="bg-slate-100 px-1 rounded">BOSTON</code> · Palabra 2: <code className="bg-slate-100 px-1 rounded">COMMON</code></p>
                <p className="mt-1 text-slate-500">Al resolver ambas se revela la contraseña para el Día 10: <strong>BOSTON COMMON</strong></p>
              </div>
            ) : dayNumber === 7 ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="message">
                  Mensaje (aparece cuando completa el rompecabezas)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  defaultValue={(day.content as { message?: string } | undefined)?.message ?? ''}
                  placeholder="Escribe el mensaje que verá al terminar el rompecabezas…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                />
                <p className="text-xs text-slate-400 mt-1">Imágenes: <code>public/puzzle/photo1.jpeg</code>, <code>photo2.jpeg</code>, <code>photo3.jpeg</code></p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="body">
                  Mensaje
                </label>
                <textarea
                  id="body"
                  name="body"
                  rows={10}
                  defaultValue={(day.content as { body?: string } | undefined)?.body ?? ''}
                  placeholder="Escribe tu mensaje aquí…"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                />
                <p className="text-xs text-slate-400 mt-1">Los saltos de línea se conservan.</p>
              </div>
            )}

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
