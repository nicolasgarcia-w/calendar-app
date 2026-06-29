import { PartnerDayCard, AdminDayCard } from './DayCard'
import type { PublicDay, AdminDay } from '@/lib/types'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// July 1, 2026 is a Wednesday → index 3
const JULY_START_INDEX = 3

// ── Partner calendar ──────────────────────────────────────────────────────────

export function PartnerCalendarGrid({ days }: { days: PublicDay[] }) {
  const byNumber = Object.fromEntries(days.map((d) => [d.dayNumber, d]))

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-center text-rose-700 font-semibold text-lg mb-3">Julio 2026</h2>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: JULY_START_INDEX }).map((_, i) => (
          <div key={`empty-start-${i}`} />
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
          const day = byNumber[n]
          if (!day) return <div key={n} className="aspect-square" />
          return <PartnerDayCard key={n} day={day} />
        })}
        <div />
      </div>
    </div>
  )
}

// ── Admin calendar ────────────────────────────────────────────────────────────

export function AdminCalendarGrid({ days }: { days: AdminDay[] }) {
  const byNumber = Object.fromEntries(days.map((d) => [d.dayNumber, d]))
  const published = days.filter((d) => d.status === 'published').length
  const draft     = days.filter((d) => d.status === 'draft').length
  const empty     = days.filter((d) => d.status === 'empty').length

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-center text-slate-700 font-semibold text-lg mb-1">Julio 2026</h2>
      <div className="flex justify-center gap-3 text-xs mb-3">
        <span className="text-rose-600">✓ {published} publicados</span>
        <span className="text-amber-600">✏️ {draft} borradores</span>
        <span className="text-slate-400">○ {empty} vacíos</span>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: JULY_START_INDEX }).map((_, i) => (
          <div key={`empty-start-${i}`} />
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => {
          const day = byNumber[n]
          if (!day) return <div key={n} className="aspect-square" />
          return <AdminDayCard key={n} day={day} />
        })}
        <div />
      </div>
    </div>
  )
}
