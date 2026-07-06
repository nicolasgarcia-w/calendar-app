'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const NOTE_COLORS = ['#fef3c7', '#fce7f3', '#dbeafe', '#dcfce7', '#ffe4e6', '#fef9c3']
const PLACEHOLDER = 'Una razón por escribir…'

// 10 positions per jar — reused for both
const NOTE_LAYOUT = [
  { left: 14, top: 10, rot: -14 },
  { left: 54, top:  8, rot:   9 },
  { left: 76, top: 18, rot:  -5 },
  { left:  8, top: 30, rot:  16 },
  { left: 40, top: 26, rot: -10 },
  { left: 68, top: 38, rot:   7 },
  { left: 18, top: 52, rot: -16 },
  { left: 56, top: 56, rot:  12 },
  { left: 22, top: 74, rot:  -7 },
  { left: 56, top: 78, rot:  14 },
]

// Background decorative jars shown when all 20 notes are read
// i=5 (left=48%, top=6%) is excluded — lands directly behind the title text
const BG_JARS = [
  ...Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: (i * 61 + 7)  % 88,
    top:  (i * 47 + 17) % 82,
    size: 36 + (i % 4) * 14,
    opacity: 0.30 + (i % 3) * 0.12,
    delay: (i * 0.7) % 5,
  })).filter(j => j.id !== 5),
  // Extra cluster in the bottom-right
  { id: 100, left: 82, top: 72, size: 52, opacity: 0.42, delay: 0.3 },
  { id: 101, left: 90, top: 82, size: 38, opacity: 0.34, delay: 1.1 },
  { id: 102, left: 76, top: 86, size: 60, opacity: 0.36, delay: 0.7 },
  { id: 103, left: 88, top: 62, size: 44, opacity: 0.30, delay: 1.8 },
  { id: 104, left: 94, top: 74, size: 32, opacity: 0.38, delay: 0.5 },
  { id: 105, left: 80, top: 92, size: 50, opacity: 0.32, delay: 2.1 },
]

// Note position as % of the jar container div
// Jar body in SVG viewBox(0 0 260 400): x:[12,248] y:[100,378]
// bodyLeft%=4.6  bodyTop%=25  bodyW%=90.8  bodyH%=69.5
function notePos(layout: typeof NOTE_LAYOUT[0]) {
  return {
    leftPct: 4.6 + (layout.left / 100) * 90.8,
    topPct:  25  + (layout.top  / 100) * 69.5,
  }
}

type JarConfig = { w: number; h: number; noteW: number; noteH: number }
const SOLO: JarConfig = { w: 230, h: 353, noteW: 44, noteH: 34 }

type Props = { dayNumber: number; title: string; alreadyOpened: boolean; reasons?: string[]; isPreview?: boolean }

export function LuckyJarReveal({ dayNumber, title, alreadyOpened, reasons = [], isPreview = false }: Props) {
  const notes = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    text: reasons[i]?.trim() || PLACEHOLDER,
  }))
  const jar1Notes = notes.slice(0,  10)
  const jar2Notes = notes.slice(10, 20)

  const [opened,       setOpened]       = useState(alreadyOpened)
  const [opening,      setOpening]      = useState(false)
  const [selected,     setSelected]     = useState<number | null>(null)
  const [openedNotes,  setOpenedNotes]  = useState<Set<number>>(new Set())
  const [hoveredNote,  setHoveredNote]  = useState<number | null>(null)
  // 'hidden' → 'entering' → 'visible'
  const [jar2Phase,    setJar2Phase]    = useState<'hidden' | 'entering' | 'visible'>('hidden')
  const markedRef     = useRef(alreadyOpened)
  const jar2Triggered = useRef(false)

  const jar1Done = jar1Notes.every(n => openedNotes.has(n.id))
  const allDone  = jar2Notes.every(n => openedNotes.has(n.id)) && jar1Done
  const isDuo    = jar2Phase !== 'hidden'
  const cfg      = SOLO

  // Restore from localStorage (skipped for admin preview so it always starts fresh)
  useEffect(() => {
    if (isPreview) return
    try {
      const saved = localStorage.getItem(`jar-${dayNumber}`)
      if (!saved) return
      const ids = JSON.parse(saved) as number[]
      setOpenedNotes(new Set(ids))
      if (ids.filter(id => id <= 10).length === 10) {
        jar2Triggered.current = true
        setJar2Phase('visible')
      }
    } catch { /* ignore */ }
  }, [dayNumber, isPreview])

  useEffect(() => {
    if (!jar1Done || jar2Triggered.current) return
    jar2Triggered.current = true
    setJar2Phase('entering')
    const t = setTimeout(() => setJar2Phase('visible'), 60)
    return () => clearTimeout(t)
  }, [jar1Done])

  function saveOpened(next: Set<number>) {
    setOpenedNotes(next)
    if (!isPreview) localStorage.setItem(`jar-${dayNumber}`, JSON.stringify([...next]))
  }

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  function handleNoteClick(id: number) {
    setSelected(id)
    saveOpened(new Set(openedNotes).add(id))
  }

  const selectedNote = selected !== null ? notes[selected - 1] : null

  // ── Sealed ──────────────────────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)' }}>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['flex flex-col items-center gap-5 transition-all duration-300',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div className="text-8xl animate-float select-none">🫙</div>
          <p className="text-rose-400 text-sm font-medium tracking-wide animate-pulse-subtle">
            Toca para abrir
          </p>
        </button>
      </div>
    )
  }

  // ── Jar view ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 animate-fade-in overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)' }}>

      {/* Background decorative jars — fade in slowly when all done */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          opacity: allDone ? 1 : 0,
          transition: 'opacity 2s ease',
        }}
      >
        {BG_JARS.map(j => (
          <div key={j.id}
            className="absolute animate-float select-none"
            style={{
              left: `${j.left}%`,
              top:  `${j.top}%`,
              fontSize: j.size,
              opacity: j.opacity,
              animationDelay: `${j.delay}s`,
              animationDuration: `${3 + (j.id % 3)}s`,
            }}>
            🫙
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-xs text-rose-300 tracking-widest uppercase mb-1">Día {dayNumber}</p>
        <h1 className="text-xl font-semibold text-rose-700 mb-1">{title}</h1>

        {allDone ? (
          <p className="text-sm text-rose-400 font-medium mb-6 animate-pulse-subtle">
            20 de ∞ razones, y contando 🩷
          </p>
        ) : jar1Done ? (
          <p className="text-xs text-rose-300 mb-6">
            Tarro 1 completo · {jar2Notes.filter(n => openedNotes.has(n.id)).length} de 10 en el tarro 2
          </p>
        ) : (
          <p className="text-xs text-rose-300 mb-6">
            {openedNotes.size} de 10 razones descubiertas
          </p>
        )}
      </div>

      {/* Jars — side by side in duo mode */}
      <div className="relative z-10 flex flex-row items-start justify-center gap-4">

        {/* Jar 1 */}
        <Jar
          jarId={1}
          cfg={cfg}
          notes={jar1Notes}
          openedNotes={openedNotes}
          hoveredNote={hoveredNote}
          onHover={setHoveredNote}
          onClick={handleNoteClick}
        />

        {/* Jar 2 — slides up from below when jar1Done */}
        {jar2Phase !== 'hidden' && (
          <div
            style={{
              transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
              opacity:   jar2Phase === 'entering' ? 0 : 1,
              transform: jar2Phase === 'entering' ? 'translateX(80px)' : 'translateX(0)',
            }}
          >
            <Jar
              jarId={2}
              cfg={cfg}
              notes={jar2Notes}
              openedNotes={openedNotes}
              hoveredNote={hoveredNote}
              onHover={setHoveredNote}
              onClick={handleNoteClick}
            />
          </div>
        )}
      </div>

      {!allDone && (
        <p className="relative z-10 text-xs text-rose-300 mt-6 animate-pulse-subtle">
          toca un papelito 🩷
        </p>
      )}

      {allDone && (
        <button
          onClick={() => {
            localStorage.removeItem(`jar-${dayNumber}`)
            setOpenedNotes(new Set())
            setJar2Phase('hidden')
            jar2Triggered.current = false
            setSelected(null)
          }}
          className="relative z-10 mt-6 px-5 py-2 rounded-full text-sm font-medium text-rose-600 border border-rose-300 hover:bg-rose-50 active:scale-95 transition-all"
        >
          Sellar los tarros 🫙
        </button>
      )}

      <a href="/home" className="relative z-10 text-xs text-rose-300 underline mt-4 hover:text-rose-500">
        ← Volver al calendario
      </a>

      {/* Note modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="animate-pop-in w-full rounded-t-3xl p-8 pb-12 shadow-2xl"
            style={{
              backgroundColor: NOTE_COLORS[(selectedNote.id - 1) % NOTE_COLORS.length],
              maxWidth: 480,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-rose-200 mx-auto mb-6" />
            <p className="text-xs font-bold text-rose-400 tracking-widest uppercase mb-3">
              Razón #{selectedNote.id}
            </p>
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              {selectedNote.text}
            </p>
            <div className="flex justify-between items-center mt-8">
              <p className="text-sm text-rose-400 italic">— de Nico 🐸</p>
              <button onClick={() => setSelected(null)} className="text-xs text-rose-400 underline">
                cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Jar sub-component ─────────────────────────────────────────────────────────

type JarProps = {
  jarId: number
  cfg: JarConfig
  notes: { id: number; text: string }[]
  openedNotes: Set<number>
  hoveredNote: number | null
  onHover: (id: number | null) => void
  onClick: (id: number) => void
}

function Jar({ jarId, cfg, notes, openedNotes, hoveredNote, onHover, onClick }: JarProps) {
  const { w, h, noteW, noteH } = cfg
  const gradId = `jarGlass-${jarId}`
  const lidId  = `lidGrad-${jarId}`
  const bandId = `lidBand-${jarId}`

  return (
    <div className="relative" style={{ width: w, height: h }}>

        {/* Ground shadow */}
        <div className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: w * 0.7,
            height: 18,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.07)',
            filter: 'blur(8px)',
            bottom: -10,
          }}
        />

        {/* SVG jar */}
        <svg
          width="100%" height="100%"
          viewBox="0 0 260 400"
          className="absolute inset-0"
          style={{ filter: 'drop-shadow(0 6px 18px rgba(251,113,133,0.15)) drop-shadow(0 2px 4px rgba(0,0,0,0.07))' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
              <stop offset="30%"  stopColor="rgba(255,255,255,0.04)" />
              <stop offset="70%"  stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
            </linearGradient>
            <linearGradient id={lidId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#fda4af" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id={bandId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Body */}
          <rect x="12" y="100" width="236" height="278" rx="28" ry="28"
            fill="rgba(255,255,255,0.10)"
            stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" />
          <rect x="13" y="101" width="234" height="276" rx="27" ry="27"
            fill={`url(#${gradId})`} />
          {/* Highlights */}
          <rect x="24"  y="112" width="22" height="240" rx="11" fill="rgba(255,255,255,0.18)" />
          <rect x="220" y="130" width="10" height="180" rx="5"  fill="rgba(255,255,255,0.09)" />
          {/* Bottom shadow */}
          <ellipse cx="130" cy="368" rx="100" ry="10" fill="rgba(0,0,0,0.04)" />

          {/* Neck */}
          <rect x="62" y="66" width="136" height="42" rx="10"
            fill="rgba(255,255,255,0.40)"
            stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
          <rect x="70" y="72" width="38" height="24" rx="8" fill="rgba(255,255,255,0.35)" />

          {/* Lid band */}
          <rect x="52" y="52" width="156" height="20" rx="6"
            fill={`url(#${bandId})`}
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />

          {/* Lid top */}
          <rect x="44" y="36" width="172" height="22" rx="9"
            fill={`url(#${lidId})`}
            style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }} />
          <rect x="54" y="40" width="80" height="8" rx="4" fill="rgba(255,255,255,0.45)" />
          <rect x="44" y="54" width="172" height="5" rx="0"  fill="rgba(0,0,0,0.08)" />
        </svg>

        {/* Notes */}
        {notes.map((note, i) => {
          const layout  = NOTE_LAYOUT[i]
          const { leftPct, topPct } = notePos(layout)
          const color   = NOTE_COLORS[note.id % NOTE_COLORS.length]
          const isRead  = openedNotes.has(note.id)
          const isHover = hoveredNote === note.id

          return (
            <button
              key={note.id}
              onMouseEnter={() => onHover(note.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(note.id)}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top:  `${topPct}%`,
                width:  noteW,
                height: noteH,
                backgroundColor: color,
                borderRadius: 3,
                border: 'none',
                cursor: 'pointer',
                opacity: isRead ? 0.50 : 1,
                zIndex: isHover ? 20 : 10,
                boxShadow: isHover
                  ? '0 6px 16px rgba(0,0,0,0.22), 0 2px 5px rgba(0,0,0,0.12)'
                  : '0 2px 5px rgba(0,0,0,0.13), 0 1px 2px rgba(0,0,0,0.07)',
                transform: isHover
                  ? `rotate(${layout.rot * 0.4}deg) translateY(-5px) scale(1.12)`
                  : `rotate(${layout.rot}deg)`,
                transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, opacity 0.3s ease',
              }}
            >
              {/* Folded corner */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 0, height: 0,
                borderStyle: 'solid',
                borderWidth: `${noteH * 0.28}px ${noteW * 0.22}px 0 0`,
                borderColor: 'rgba(0,0,0,0.09) transparent transparent transparent',
              }} />
              {isRead ? (
                <span style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: noteH * 0.38, color: 'rgba(0,0,0,0.30)',
                }}>✓</span>
              ) : (
                <>
                  <div style={{ position:'absolute', left: noteW*0.12, top: noteH*0.26, right: noteW*0.22, height:1.5, borderRadius:1, background:'rgba(0,0,0,0.10)' }} />
                  <div style={{ position:'absolute', left: noteW*0.12, top: noteH*0.50, right: noteW*0.30, height:1.5, borderRadius:1, background:'rgba(0,0,0,0.07)' }} />
                  <div style={{ position:'absolute', left: noteW*0.12, top: noteH*0.70, right: noteW*0.18, height:1.5, borderRadius:1, background:'rgba(0,0,0,0.06)' }} />
                </>
              )}
            </button>
          )
        })}
    </div>
  )
}
