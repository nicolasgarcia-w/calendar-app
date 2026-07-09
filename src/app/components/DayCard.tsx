import type { PublicDay, AdminDay } from '@/lib/types'

function formatUnlockDate(ms: number): string {
  return new Date(ms).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

// ── Partner card ──────────────────────────────────────────────────────────────

type PartnerCardProps = { day: PublicDay; index?: number }

export function PartnerDayCard({ day, index = 0 }: PartnerCardProps) {
  const { dayNumber, isPublished, isUnlocked, isOpened, isCompleted } = day
  const isOpen = isPublished && isUnlocked

  const delay = `${index * 25}ms`

  if (isOpen) {
    const icon = isCompleted ? '✓' : isOpened ? (dayNumber === 2 ? '🧩' : dayNumber === 3 ? '🃏' : dayNumber === 4 ? '🫙' : dayNumber === 5 ? '🎵' : dayNumber === 6 ? '📚' : dayNumber === 7 ? '🖼️' : dayNumber === 8 ? '🫙' : dayNumber === 11 ? '⭐' : '💌') : '🎁'
    const isNew = !isOpened && !isCompleted

    return (
      <a
        href={`/day/${dayNumber}`}
        className={[
          'relative flex flex-col items-center justify-center rounded-2xl aspect-square',
          'transition-all duration-200 cursor-pointer',
          'hover:scale-110 hover:shadow-xl active:scale-95',
          'animate-pop-in',
          isNew
            ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg animate-shimmer'
            : isOpened
            ? 'bg-gradient-to-br from-rose-200 to-rose-300 text-white shadow-sm'
            : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-md',
        ].join(' ')}
        style={{ animationDelay: delay }}
      >
        <span className="text-xl leading-none drop-shadow-sm">{icon}</span>
        <span className="text-sm font-bold mt-1 drop-shadow-sm">{dayNumber}</span>
      </a>
    )
  }

  const dateLabel = formatUnlockDate(day.unlockAt)

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl aspect-square bg-slate-100 text-slate-400 select-none gap-0.5 animate-pop-in"
      style={{ animationDelay: delay }}
    >
      <span className="text-sm leading-none">🔒</span>
      <span className="text-xs font-semibold">{dayNumber}</span>
      <span className="text-[9px] leading-tight opacity-70">{dateLabel}</span>
    </div>
  )
}

// ── Admin card ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  empty:     'bg-slate-100 text-slate-500 border-slate-200',
  draft:     'bg-amber-50  text-amber-700  border-amber-200',
  published: 'bg-rose-50   text-rose-700   border-rose-200',
}

const STATUS_ICON: Record<string, string> = {
  empty:     '○',
  draft:     '✏️',
  published: '✓',
}

type AdminCardProps = { day: AdminDay; index?: number }

export function AdminDayCard({ day, index = 0 }: AdminCardProps) {
  const { dayNumber, title, status, isOpened } = day
  const style = STATUS_STYLES[status]
  const icon  = STATUS_ICON[status]

  return (
    <a
      href={`/admin/day/${dayNumber}`}
      className={[
        'relative flex flex-col items-center justify-center rounded-2xl aspect-square border',
        'hover:scale-110 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer px-1',
        'animate-pop-in',
        style,
      ].join(' ')}
      style={{ animationDelay: `${index * 25}ms` }}
    >
      <span className="text-xs absolute top-1 right-1.5 opacity-60">{icon}</span>
      <span className="text-sm font-bold">{dayNumber}</span>
      {title && (
        <span className="text-[10px] leading-tight text-center mt-0.5 line-clamp-2 opacity-70">
          {title}
        </span>
      )}
      {isOpened && <span className="text-[9px] mt-0.5 opacity-50">opened</span>}
    </a>
  )
}
