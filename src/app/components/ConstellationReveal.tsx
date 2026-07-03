'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

// ── Constellation stars (x%, y% of map container) ────────────────────────────
const STARS = [
  { id: 1,  x: 18, y: 14, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 2,  x: 40, y: 8,  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 3,  x: 62, y: 18, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 4,  x: 78, y: 10, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 5,  x: 25, y: 32, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 6,  x: 52, y: 28, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 7,  x: 72, y: 38, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 8,  x: 15, y: 52, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 9,  x: 38, y: 50, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 10, x: 60, y: 58, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 11, x: 82, y: 55, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 12, x: 28, y: 70, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 13, x: 50, y: 76, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 14, x: 70, y: 74, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
  { id: 15, x: 42, y: 88, text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.' },
]

// Lines connecting stars [fromId, toId]
const LINES: [number, number][] = [
  [1, 2], [2, 3], [3, 4], [2, 6], [3, 6], [1, 5], [5, 6],
  [6, 7], [5, 8], [5, 9], [6, 9], [7, 10], [7, 11],
  [8, 12], [9, 12], [9, 13], [10, 13], [10, 14], [11, 14],
  [12, 15], [13, 15], [14, 15],
]

// Decorative background stars (deterministic positions)
const BG_STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 99),
  y: ((i * 53 + 7)  % 97),
  size: (i % 3) === 0 ? 2 : 1,
  duration: 2 + (i % 4),
  delay: (i * 0.4) % 5,
}))

const INTRO_LINES = [
  'Esa noche, hace exactamente 4 meses…',
  'el 11 de marzo, en el Griffith Observatory,',
  'miramos las estrellas juntos.',
  'Cada una tiene algo que decirte.',
]

type Phase = 'sealed' | 'intro' | 'telescope' | 'expanding' | 'map'

type Props = { dayNumber: number; title: string; alreadyOpened: boolean }

export function ConstellationReveal({ dayNumber, title, alreadyOpened }: Props) {
  const [phase, setPhase] = useState<Phase>('sealed')
  const [opening, setOpening] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [selectedStar, setSelectedStar] = useState<number | null>(null)
  const [openedStars, setOpenedStars] = useState<Set<number>>(new Set())
  const markedRef = useRef(alreadyOpened)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`constellation-${dayNumber}`)
    if (saved) setOpenedStars(new Set(JSON.parse(saved)))
    if (alreadyOpened) setPhase('intro')
  }, [dayNumber, alreadyOpened])

  // Intro: no auto-advance — user taps to continue

  // After expansion, show the map and animate constellation lines in
  useEffect(() => {
    if (phase !== 'expanding') return
    const t = setTimeout(() => {
      setPhase('map')
      let i = 0
      const interval = setInterval(() => {
        i++
        setVisibleLines(i)
        if (i >= LINES.length) clearInterval(interval)
      }, 60)
    }, 1200)
    return () => clearTimeout(t)
  }, [phase])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setPhase('intro'), 350)
  }

  function handleStarClick(id: number) {
    setSelectedStar(id)
    const next = new Set(openedStars).add(id)
    setOpenedStars(next)
    localStorage.setItem(`constellation-${dayNumber}`, JSON.stringify([...next]))
  }

  function getStar(id: number) { return STARS.find(s => s.id === id)! }

  // ── Sealed ──────────────────────────────────────────────────────────────────
  if (phase === 'sealed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['flex flex-col items-center gap-5 transition-all duration-350',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div className="text-8xl animate-float select-none">🔭</div>
          <p className="text-blue-200 text-sm font-medium tracking-wide animate-pulse-subtle">
            Toca para abrir
          </p>
        </button>
      </div>
    )
  }

  // ── Intro text ───────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8"
        style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
        <div className="flex flex-col items-center gap-5 text-center mb-16">
          {INTRO_LINES.map((line, i) => (
            <p
              key={i}
              className="animate-text-appear text-blue-100 font-light tracking-wide"
              style={{ animationDelay: `${i * 1.1}s`, fontSize: '1rem', opacity: 0 }}
            >
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={() => setPhase('telescope')}
          className="animate-text-appear animate-pulse-subtle text-blue-300 text-sm tracking-widest border border-blue-400 border-opacity-30 rounded-full px-6 py-2 hover:border-opacity-70 transition-all"
          style={{ animationDelay: `${INTRO_LINES.length * 1.1 + 0.5}s`, opacity: 0 }}
        >
          continuar →
        </button>
      </div>
    )
  }

  // ── Telescope prompt ─────────────────────────────────────────────────────────
  if (phase === 'telescope') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in"
        style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
        <button
          onClick={() => setPhase('expanding')}
          className="flex flex-col items-center gap-6 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {/* Telescope viewfinder graphic */}
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-4 border-blue-300 flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(147,197,253,0.3), inset 0 0 40px rgba(10,10,46,0.8)' }}>
              <div className="w-24 h-24 rounded-full border-2 border-blue-200 flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, #1e1e6e 0%, #0a0a2e 100%)' }}>
                <span className="text-3xl">✨</span>
              </div>
            </div>
            {/* Crosshair lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-300 opacity-40" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-300 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-blue-100 font-medium text-base tracking-wide">Mira a través del telescopio</p>
            <p className="text-blue-300 text-xs mt-1 opacity-70">toca para ver el cielo</p>
          </div>
        </button>
      </div>
    )
  }

  // ── Expanding ────────────────────────────────────────────────────────────────
  if (phase === 'expanding') {
    return (
      <div className="fixed inset-0 animate-telescope-expand"
        style={{ background: 'radial-gradient(ellipse at center, #0d0d3d 0%, #050516 100%)' }}>
        {BG_STARS.slice(0, 40).map(s => (
          <div key={s.id} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: 0.6 }} />
        ))}
      </div>
    )
  }

  // ── Star map ─────────────────────────────────────────────────────────────────
  const selectedData = selectedStar !== null ? getStar(selectedStar) : null

  return (
    <div className="fixed inset-0 overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0d0d3d 0%, #050516 100%)' }}>

      {/* Back link */}
      <a href="/home"
        className="absolute top-4 left-4 z-20 text-xs text-blue-300 opacity-60 hover:opacity-100 transition-opacity">
        ← volver
      </a>

      {/* Title */}
      <p className="absolute top-4 left-0 right-0 text-center text-xs text-blue-200 opacity-40 tracking-widest uppercase z-20">
        {title}
      </p>

      {/* Progress */}
      <p className="absolute top-4 right-4 z-20 text-xs text-blue-300 opacity-50">
        {openedStars.size} / {STARS.length}
      </p>

      {/* Background stars */}
      {BG_STARS.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            '--twinkle-duration': `${s.duration}s`,
            '--twinkle-delay': `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Constellation map */}
      <div ref={mapRef} className="absolute inset-0">
        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {LINES.slice(0, visibleLines).map(([aId, bId], i) => {
            const a = getStar(aId)
            const b = getStar(bId)
            return (
              <line
                key={i}
                x1={`${a.x}%`} y1={`${a.y}%`}
                x2={`${b.x}%`} y2={`${b.y}%`}
                stroke="rgba(147,197,253,0.25)"
                strokeWidth="1"
              />
            )
          })}
        </svg>

        {/* Constellation stars */}
        {STARS.map(star => {
          const isOpen = openedStars.has(star.id)
          const isSelected = selectedStar === star.id
          return (
            <button
              key={star.id}
              onClick={() => handleStarClick(star.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125 active:scale-95"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              {/* Glow ring */}
              <div className={`absolute inset-0 rounded-full -m-2 ${isSelected ? '' : 'animate-star-glow'}`}
                style={{
                  background: isOpen
                    ? 'radial-gradient(circle, rgba(253,224,71,0.3) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%)',
                  width: 20, height: 20, marginLeft: -6, marginTop: -6,
                }} />
              {/* Star dot */}
              <div
                className="rounded-full"
                style={{
                  width: isSelected ? 10 : isOpen ? 8 : 6,
                  height: isSelected ? 10 : isOpen ? 8 : 6,
                  backgroundColor: isOpen ? '#fde047' : '#bfdbfe',
                  boxShadow: isOpen
                    ? '0 0 8px 2px rgba(253,224,71,0.8)'
                    : '0 0 4px 1px rgba(191,219,254,0.6)',
                  transition: 'all 0.3s ease',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Hint */}
      {openedStars.size === 0 && (
        <p className="absolute bottom-24 left-0 right-0 text-center text-blue-300 text-xs opacity-50 animate-pulse-subtle">
          toca una estrella ✨
        </p>
      )}

      {/* Bottom sheet */}
      {selectedData && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 animate-fade-in"
          style={{ background: 'linear-gradient(to top, #050516 80%, transparent)' }}
        >
          <div className="px-6 pt-8 pb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-300 text-xs">★</span>
              <p className="text-blue-200 text-xs tracking-widest uppercase opacity-60">
                Estrella {selectedData.id} de {STARS.length}
              </p>
            </div>
            <p className="text-blue-50 text-base font-light leading-relaxed">
              {selectedData.text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
