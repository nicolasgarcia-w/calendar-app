import type { PublicDay, AdminDay } from '@/lib/types'

function formatUnlockDate(ms: number): string {
  return new Date(ms).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

// ── Partner card ──────────────────────────────────────────────────────────────

type PartnerCardProps = { day: PublicDay }

export function PartnerDayCard({ day }: PartnerCardProps) {
  const { dayNumber, isPublished, isUnlocked, isOpened, isCompleted } = day
  const isOpen = isPublished && isUnlocked

  if (isOpen) {
    return (
      <a
        href={`/day/${dayNumber}`}
        className={[
          'relative flex flex-col items-center justify-center rounded-xl aspect-square',
          'transition-all duration-150 cursor-pointer active:scale-95',
          isOpened
            ? 'bg-rose-300 text-white shadow-sm'
            : 'bg-rose-500 text-white shadow-md hover:bg-rose-600',
        ].join(' ')}
      >
        <span className="text-lg leading-none">
          {isCompleted ? '✓' : isOpened ? (dayNumber === 2 ? '🧩' : '💌') : '🎁'}
        </span>
        <span className="text-sm font-bold mt-1">{dayNumber}</span>
      </a>
    )
  }

  // Locked — show date label, no time
  const dateLabel = formatUnlockDate(day.unlockAt)

  return (
    <div className="flex flex-col items-center justify-center rounded-xl aspect-square bg-slate-100 text-slate-400 select-none gap-0.5">
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

type AdminCardProps = { day: AdminDay }

export function AdminDayCard({ day }: AdminCardProps) {
  const { dayNumber, title, status, isOpened } = day
  const style = STATUS_STYLES[status]
  const icon  = STATUS_ICON[status]

  return (
    <a
      href={`/admin/day/${dayNumber}`}
      className={[
        'relative flex flex-col items-center justify-center rounded-xl aspect-square border',
        'hover:shadow-md active:scale-95 transition-all duration-150 cursor-pointer px-1',
        style,
      ].join(' ')}
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
