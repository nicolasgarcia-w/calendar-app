'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const VIDEO_STAR_ID = 13

type StarDef = { id: number; x: number; y: number; label: string; isVideo?: boolean }

// 13 stars for the California trip
const STARS: StarDef[] = [
  { id: 1,  x: 38, y: 12, label: 'Estrella 1'  },
  { id: 2,  x: 58, y: 10, label: 'Estrella 2'  },
  { id: 3,  x: 75, y: 16, label: 'Estrella 3'  },
  { id: 4,  x: 82, y: 30, label: 'Estrella 4'  },
  { id: 5,  x: 68, y: 34, label: 'Estrella 5'  },
  { id: 6,  x: 50, y: 30, label: 'Estrella 6'  },
  { id: 7,  x: 32, y: 35, label: 'Estrella 7'  },
  { id: 8,  x: 18, y: 48, label: 'Estrella 8'  },
  { id: 9,  x: 40, y: 52, label: 'Estrella 9'  },
  { id: 10, x: 62, y: 50, label: 'Estrella 10' },
  { id: 11, x: 78, y: 58, label: 'Estrella 11' },
  { id: 12, x: 46, y: 67, label: 'Estrella 12' },
  { id: 13, x: 28, y: 74, label: 'Estrella 13', isVideo: true },
]

const LINES: [number, number][] = [
  [1,2],[2,3],[3,4],[4,5],[5,6],[6,2],[6,7],[7,8],[8,9],[9,6],[9,10],[10,5],[10,11],[9,12],[12,13],[7,13],
]

const BG_STARS = Array.from({ length: 140 }, (_, i) => ({
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

// Future trip constellations for the universe view
type UniConst = { name: string; stars: { x: number; y: number }[]; lines: [number, number][] }
const FUTURE_CONSTELLATIONS: UniConst[] = [
  { name: 'España',       stars: [{x:10,y:14},{x:14,y:10},{x:19,y:12},{x:16,y:17},{x:10,y:19}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]] },
  { name: 'New Orleans',  stars: [{x:80,y:11},{x:85,y:8}, {x:89,y:12},{x:86,y:18},{x:80,y:17}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]] },
  { name: 'París',        stars: [{x:86,y:45},{x:90,y:41},{x:93,y:47},{x:88,y:52},{x:83,y:49}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0]] },
  { name: 'Roma',         stars: [{x:74,y:79},{x:79,y:75},{x:83,y:79},{x:80,y:85},{x:73,y:83}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[0,3]] },
  { name: 'Buenos Aires', stars: [{x:17,y:80},{x:22,y:76},{x:27,y:78},{x:24,y:84},{x:17,y:85}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0]] },
  { name: 'Londres',      stars: [{x:8, y:54},{x:12,y:49},{x:16,y:53},{x:12,y:59},{x:6, y:58}], lines:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]] },
]

// CA constellation scaled into the universe view (centered at 50%, 48%)
const CA_SCALE = 0.22
const CA_CX = 50
const CA_CY = 48
function caUniPos(star: StarDef) {
  return { x: CA_CX + (star.x - 50) * CA_SCALE, y: CA_CY + (star.y - 42) * CA_SCALE }
}

type Phase = 'sealed' | 'intro' | 'telescope' | 'expanding' | 'map' | 'universe'
type Props = { dayNumber: number; title: string; alreadyOpened: boolean; notes?: string[] }

export function ConstellationReveal({ dayNumber, title, alreadyOpened, notes = [] }: Props) {
  const [phase, setPhase]           = useState<Phase>('sealed')
  const [opening, setOpening]       = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [selectedStar, setSelectedStar] = useState<number | null>(null)
  const [openedStars, setOpenedStars]   = useState<Set<number>>(new Set())
  const [uniLines, setUniLines]     = useState(0)
  const markedRef = useRef(alreadyOpened)

  const allOpened = openedStars.size >= STARS.length

  useEffect(() => {
    const saved = localStorage.getItem(`constellation-${dayNumber}`)
    if (saved) setOpenedStars(new Set(JSON.parse(saved)))
    if (alreadyOpened) setPhase('intro')
  }, [dayNumber, alreadyOpened])

  useEffect(() => {
    if (phase !== 'expanding') return
    const t = setTimeout(() => {
      setPhase('map')
      let i = 0
      const iv = setInterval(() => { i++; setVisibleLines(i); if (i >= LINES.length) clearInterval(iv) }, 60)
    }, 1200)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'universe') return
    setUniLines(0)
    let i = 0
    const totalLines = LINES.length + FUTURE_CONSTELLATIONS.reduce((a, c) => a + c.lines.length, 0)
    const iv = setInterval(() => { i++; setUniLines(i); if (i >= totalLines) clearInterval(iv) }, 30)
    return () => clearInterval(iv)
  }, [phase])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setPhase('intro'), 350)
  }

  function handleStarClick(id: number) {
    if (selectedStar === id) { setSelectedStar(null); return }
    setSelectedStar(id)
    const next = new Set(openedStars).add(id)
    setOpenedStars(next)
    localStorage.setItem(`constellation-${dayNumber}`, JSON.stringify([...next]))
  }

  function getStar(id: number) { return STARS.find(s => s.id === id)! }

  // ── Sealed ───────────────────────────────────────────────────────────────────
  if (phase === 'sealed') return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
      <button onClick={handleOpen} disabled={opening}
        className={['flex flex-col items-center gap-5 transition-all duration-350', opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}>
        <div className="text-8xl animate-float select-none">🔭</div>
        <p className="text-blue-200 text-sm font-medium tracking-wide animate-pulse-subtle">Toca para abrir</p>
      </button>
    </div>
  )

  // ── Intro ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8"
      style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
      <div className="flex flex-col items-center gap-5 text-center mb-16">
        {INTRO_LINES.map((line, i) => (
          <p key={i} className="animate-text-appear text-blue-100 font-light tracking-wide"
            style={{ animationDelay: `${i * 1.1}s`, fontSize: '1rem', opacity: 0 }}>
            {line}
          </p>
        ))}
      </div>
      <button onClick={() => setPhase('telescope')}
        className="animate-text-appear animate-pulse-subtle text-blue-300 text-sm tracking-widest border border-blue-400 border-opacity-30 rounded-full px-6 py-2 hover:border-opacity-70 transition-all"
        style={{ animationDelay: `${INTRO_LINES.length * 1.1 + 0.5}s`, opacity: 0 }}>
        continuar →
      </button>
    </div>
  )

  // ── Telescope ────────────────────────────────────────────────────────────────
  if (phase === 'telescope') return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in"
      style={{ background: 'linear-gradient(to bottom, #0a0a2e, #1a1a4e)' }}>
      <button onClick={() => setPhase('expanding')}
        className="flex flex-col items-center gap-6 hover:scale-105 active:scale-95 transition-all duration-200">
        <div className="relative">
          <div className="w-36 h-36 rounded-full border-4 border-blue-300 flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(147,197,253,0.3), inset 0 0 40px rgba(10,10,46,0.8)' }}>
            <div className="w-24 h-24 rounded-full border-2 border-blue-200 flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, #1e1e6e 0%, #0a0a2e 100%)' }}>
              <span className="text-3xl">✨</span>
            </div>
          </div>
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

  // ── Expanding ────────────────────────────────────────────────────────────────
  if (phase === 'expanding') return (
    <div className="fixed inset-0 animate-telescope-expand"
      style={{ background: 'radial-gradient(ellipse at center, #0d0d3d 0%, #050516 100%)' }}>
      {BG_STARS.slice(0, 40).map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: 0.6 }} />
      ))}
    </div>
  )

  // ── Universe ─────────────────────────────────────────────────────────────────
  if (phase === 'universe') {
    const caLines = LINES.slice(0, Math.min(uniLines, LINES.length))
    return (
      <div className="fixed inset-0 select-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #080825 0%, #020210 100%)', animation: 'uni-appear 1s ease both' }}>
        <style>{`@keyframes uni-appear { from { opacity: 0 } to { opacity: 1 } }`}</style>

        {/* Back button */}
        <button onClick={() => { setPhase('map'); setVisibleLines(LINES.length) }}
          className="absolute top-4 left-4 z-30 text-xs text-blue-300 opacity-60 hover:opacity-100 transition-opacity">
          ← California
        </button>

        {/* Title */}
        <p className="absolute top-4 left-0 right-0 text-center text-xs text-blue-200 opacity-50 tracking-widest uppercase z-20"
          style={{ animation: 'uni-appear 2s 0.5s ease both', opacity: 0 }}>
          Próximas Aventuras
        </p>

        {/* Background stars */}
        {BG_STARS.map(s => (
          <div key={s.id} className="absolute rounded-full bg-white animate-twinkle"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
              '--twinkle-duration': `${s.duration}s`, '--twinkle-delay': `${s.delay}s` } as React.CSSProperties}
          />
        ))}

        {/* SVG lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {/* CA mini lines */}
          {caLines.map(([aId, bId], i) => {
            const a = caUniPos(getStar(aId))
            const b = caUniPos(getStar(bId))
            return <line key={`cl${i}`} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(253,224,71,0.35)" strokeWidth="0.8"/>
          })}
          {/* Future constellation lines */}
          {FUTURE_CONSTELLATIONS.map((fc, ci) => {
            const offset = LINES.length + FUTURE_CONSTELLATIONS.slice(0, ci).reduce((a, c) => a + c.lines.length, 0)
            return fc.lines.slice(0, Math.max(0, uniLines - offset)).map(([ai, bi], li) => {
              const a = fc.stars[ai]; const b = fc.stars[bi]
              return <line key={`fl${ci}-${li}`} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(147,197,253,0.22)" strokeWidth="0.6"/>
            })
          })}
        </svg>

        {/* CA mini stars (golden) */}
        {STARS.map(star => {
          const pos = caUniPos(star)
          return (
            <div key={star.id} className="absolute rounded-full" style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              width: 5, height: 5,
              background: star.isVideo ? '#f9a8d4' : '#fde047',
              transform: 'translate(-50%,-50%)',
              boxShadow: star.isVideo ? '0 0 5px 2px rgba(249,168,212,0.6)' : '0 0 5px 2px rgba(253,224,71,0.6)',
              zIndex: 2,
            }}/>
          )
        })}

        {/* CA label */}
        <p className="absolute text-yellow-300 text-xs font-light tracking-widest z-10"
          style={{ left: `${CA_CX}%`, top: `${CA_CY + 9}%`, transform: 'translateX(-50%)', opacity: 0.85,
            animation: 'uni-appear 1.5s 0.3s ease both' }}>
          ✦ California
        </p>

        {/* Future constellation stars + labels */}
        {FUTURE_CONSTELLATIONS.map((fc, ci) => {
          const cx = fc.stars.reduce((s, st) => s + st.x, 0) / fc.stars.length
          const bottomY = Math.max(...fc.stars.map(s => s.y))
          return (
            <div key={ci} style={{ animation: `uni-appear 1.2s ${0.4 + ci * 0.25}s ease both`, opacity: 0 }}>
              {fc.stars.map((s, si) => (
                <div key={si} className="absolute rounded-full" style={{
                  left: `${s.x}%`, top: `${s.y}%`,
                  width: 4, height: 4,
                  background: '#93c5fd',
                  transform: 'translate(-50%,-50%)',
                  boxShadow: '0 0 4px 1px rgba(147,197,253,0.5)',
                  zIndex: 2,
                }}/>
              ))}
              <p className="absolute text-blue-300 text-xs text-center tracking-wide z-10"
                style={{ left: `${cx}%`, top: `${bottomY + 3.5}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap', opacity: 0.8 }}>
                {fc.name}
              </p>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Star map ─────────────────────────────────────────────────────────────────
  const selectedData = selectedStar !== null ? getStar(selectedStar) : null
  const note = selectedData ? (notes[selectedData.id - 1] ?? '') : ''

  return (
    <div className="fixed inset-0 overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0d0d3d 0%, #050516 100%)' }}>

      <p className="absolute top-4 left-0 right-0 text-center text-xs text-blue-200 opacity-40 tracking-widest uppercase z-20">{title}</p>
      <p className="absolute top-4 right-4 z-20 text-xs text-blue-300 opacity-50">{openedStars.size} / {STARS.length}</p>

      {/* Background stars */}
      {BG_STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
            '--twinkle-duration': `${s.duration}s`, '--twinkle-delay': `${s.delay}s` } as React.CSSProperties}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {LINES.slice(0, visibleLines).map(([aId, bId], i) => {
          const a = getStar(aId); const b = getStar(bId)
          return <line key={i} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="rgba(147,197,253,0.25)" strokeWidth="1"/>
        })}
      </svg>

      {/* Stars */}
      {STARS.map(star => {
        const isOpen     = openedStars.has(star.id)
        const isSelected = selectedStar === star.id
        return (
          <button key={star.id} onClick={() => handleStarClick(star.id)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125 active:scale-95"
            style={{ left: `${star.x}%`, top: `${star.y}%` }}>
            <div className={`absolute rounded-full ${isSelected ? '' : 'animate-star-glow'}`}
              style={{
                background: isOpen ? 'radial-gradient(circle, rgba(253,224,71,0.3) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%)',
                width: 20, height: 20, marginLeft: -6, marginTop: -6,
              }}/>
            <div className="rounded-full" style={{
              width:  isSelected ? 10 : isOpen ? 8 : 6,
              height: isSelected ? 10 : isOpen ? 8 : 6,
              backgroundColor: isOpen ? '#fde047' : star.isVideo ? '#f9a8d4' : '#bfdbfe',
              boxShadow: isOpen ? '0 0 8px 2px rgba(253,224,71,0.8)'
                : star.isVideo ? '0 0 6px 2px rgba(249,168,212,0.7)'
                : '0 0 4px 1px rgba(191,219,254,0.6)',
              transition: 'all 0.3s ease',
            }}/>
          </button>
        )
      })}

      {/* Hint */}
      {openedStars.size === 0 && !selectedData && (
        <p className="absolute bottom-24 left-0 right-0 text-center text-blue-300 text-xs opacity-50 animate-pulse-subtle">
          toca una estrella ✨
        </p>
      )}

      {/* Universe button */}
      {allOpened && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 animate-fade-in">
          <button onClick={() => setPhase('universe')}
            className="text-yellow-200 text-sm tracking-widest border border-yellow-300 border-opacity-30 rounded-full px-8 py-3 hover:border-opacity-70 transition-all animate-pulse-subtle">
            Ver el universo →
          </button>
        </div>
      )}

      {/* Star popup — floats near the tapped star */}
      {selectedData && (
        <>
          {/* Dismiss overlay */}
          <div className="absolute inset-0 z-30" onClick={() => setSelectedStar(null)}/>

          <div
            className="absolute z-40 animate-fade-in"
            style={{
              left: `clamp(110px, ${selectedData.x}%, calc(100% - 110px))`,
              ...(selectedData.y < 52
                ? { top: `calc(${selectedData.y}% + 22px)` }
                : { bottom: `calc(${100 - selectedData.y}% + 22px)` }),
              transform: 'translateX(-50%)',
              width: 220,
              background: 'rgba(4,4,24,0.95)',
              border: '1px solid rgba(147,197,253,0.28)',
              borderRadius: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.75), 0 0 20px rgba(147,197,253,0.07)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedStar(null)}
              style={{ position: 'absolute', top: 8, right: 10, color: 'rgba(147,197,253,0.55)', fontSize: 18, lineHeight: 1, zIndex: 1, background: 'none', border: 'none', cursor: 'pointer' }}
            >×</button>

            {/* Photo or video */}
            {selectedData.isVideo ? (
              <video
                src={`/constellation/day${selectedData.id}.mp4`}
                controls playsInline
                style={{ width: '100%', borderRadius: '16px 16px 0 0', display: 'block', maxHeight: 165, background: '#080820' }}
              />
            ) : (
              <img
                src={`/constellation/day${selectedData.id}.jpeg`}
                alt={selectedData.label}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '16px 16px 0 0', display: 'block' }}
              />
            )}

            {/* Label + note */}
            <div style={{ padding: '10px 14px 14px' }}>
              <p style={{ color: 'rgba(147,197,253,0.55)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                {selectedData.isVideo ? '▶ ' : '★ '}{selectedData.label}
              </p>
              {note ? (
                <p style={{ color: '#dde8ff', fontSize: 13, lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{note}"</p>
              ) : (
                <p style={{ color: 'rgba(147,197,253,0.3)', fontSize: 12, fontStyle: 'italic', margin: 0 }}>(nota por agregar)</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Back link — rendered last so it's always above overlays */}
      <a href="/home" className="absolute top-4 left-4 text-xs text-blue-300 opacity-60 hover:opacity-100 transition-opacity" style={{ zIndex: 50 }}>← volver</a>
    </div>
  )
}
