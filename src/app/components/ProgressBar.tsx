type Props = { opened: number; total: number }

export function ProgressBar({ opened, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((opened / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-rose-400 mb-1.5">
        <span>{opened} de {total} días abiertos</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-rose-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
