'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const COLS = 5
const ROWS = 4
const TOTAL = COLS * ROWS // 20 pieces

const IMAGES = [
  '/puzzle/photo1.jpeg',
  '/puzzle/photo2.jpeg',
]

const CONFETTI_COLORS = ['#c084fc','#f472b6','#fb923c','#facc15','#4ade80','#60a5fa','#f87171','#a78bfa']

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function solvedPositions() {
  return Array.from({ length: TOTAL }, (_, i) => i)
}

function freshPositions() {
  return shuffle(Array.from({ length: TOTAL }, (_, i) => i))
}

type PuzzleState = {
  positions: number[]
  completed: boolean
  revealImg: boolean
}

function initialPuzzle(): PuzzleState {
  // Start solved so SSR and client match; shuffled in useEffect on mount
  return { positions: solvedPositions(), completed: false, revealImg: false }
}

// Deterministic confetti pieces so SSR and client match
const CONFETTI_PIECES = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left:     (i * 37 + 11) % 100,
  delay:    ((i * 53) % 1200) / 1000,
  duration: 2.2 + ((i * 31) % 18) / 10,
  size:     6 + (i % 6),
  color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate:   (i * 67) % 360,
  drift:    ((i * 41) % 80) - 40,
}))

function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
      {CONFETTI_PIECES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            borderRadius: 2,
            '--drift': `${p.drift}px`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

type Props = {
  dayNumber: number
  title: string
  alreadyOpened: boolean
  message?: string
  isPreview?: boolean
}

export function PuzzleReveal({ dayNumber, title, alreadyOpened, message = '', isPreview = false }: Props) {
  const [opened,    setOpened]    = useState(alreadyOpened)
  const [opening,   setOpening]   = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [puzzles,   setPuzzles]   = useState<PuzzleState[]>(() => [0, 1].map(initialPuzzle))
  const [selected,  setSelected]  = useState<number | null>(null)
  const [confetti,  setConfetti]  = useState(false)
  const [showMsg,   setShowMsg]   = useState(false)
  const markedRef    = useRef(alreadyOpened)
  const completedRef = useRef<boolean[]>([false, false])
  const genRef       = useRef(0) // incremented on every shuffle/reset to cancel stale timeouts

  const puzzle      = puzzles[activeIdx]
  const locked      = new Set(puzzle.positions.map((id, slot) => slot === id ? slot : -1).filter(s => s >= 0))
  const placedCount = locked.size

  useEffect(() => {
    if (placedCount === TOTAL && !completedRef.current[activeIdx]) {
      completedRef.current[activeIdx] = true
      const gen = genRef.current
      setPuzzles(prev => prev.map((p, i) => i === activeIdx ? { ...p, completed: true } : p))
      setTimeout(() => {
        if (genRef.current !== gen) return // puzzle was reset/reshuffled, abort
        setPuzzles(prev => prev.map((p, i) => i === activeIdx ? { ...p, revealImg: true } : p))
      }, 200)

      const bothDone = completedRef.current.every(Boolean)
      if (bothDone) {
        setTimeout(() => { if (genRef.current === gen) setConfetti(true) }, 600)
        setTimeout(() => { if (genRef.current === gen) setShowMsg(true) }, 1400)
        setTimeout(() => setConfetti(false), 5000)
      }
    }
  }, [placedCount, activeIdx])

  // Shuffle on mount — avoids SSR/client hydration mismatch from Math.random()
  useEffect(() => {
    genRef.current++
    completedRef.current = [false, false]
    setPuzzles([0, 1].map(() => ({ positions: freshPositions(), completed: false, revealImg: false })))
  }, [])

  useEffect(() => { setSelected(null) }, [activeIdx])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  function handleClick(slotIdx: number) {
    if (locked.has(slotIdx)) return
    if (selected === null) { setSelected(slotIdx); return }
    if (selected === slotIdx) { setSelected(null); return }
    const newPos = [...puzzle.positions]
    ;[newPos[selected], newPos[slotIdx]] = [newPos[slotIdx], newPos[selected]]
    setPuzzles(prev => prev.map((p, i) => i === activeIdx ? { ...p, positions: newPos } : p))
    setSelected(null)
  }

  function handleRestart() {
    genRef.current++
    completedRef.current[activeIdx] = false
    setPuzzles(prev => prev.map((p, i) => i === activeIdx ? { positions: freshPositions(), completed: false, revealImg: false } : p))
    setSelected(null)
  }

  const bothDone = puzzles.every(p => p.completed)

  // ── Sealed ────────────────────────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e8e0f8 100%)' }}>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['flex flex-col items-center gap-5 transition-all duration-300',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div style={{ fontSize: 88 }} className="select-none">🖼️</div>
          <p style={{ color: '#6040a0', fontSize: 13, opacity: 0.7, letterSpacing: '0.04em' }}>
            Toca para armar el rompecabezas
          </p>
        </button>
      </div>
    )
  }

  // ── Puzzle ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-3 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e8e0f8 100%)' }}>

      <Confetti active={confetti} />

      {/* Header */}
      <div className="text-center mb-4">
        <p style={{ color: '#7050b0', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6 }}>
          Día {dayNumber}
        </p>
        <h1 style={{ color: '#3a2070', fontSize: 20, fontWeight: 700, marginTop: 2 }}>{title}</h1>
        {!bothDone && (
          <p style={{ color: '#9070c0', fontSize: 11, opacity: 0.5, marginTop: 4 }}>
            Completa los dos para ver el mensaje 💌
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              padding: '6px 22px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: activeIdx === i ? '#7050b0' : 'rgba(112,80,176,0.12)',
              color: activeIdx === i ? 'white' : '#7050b0',
              transition: 'all 0.2s', position: 'relative',
            }}
          >
            {i + 1}
            {puzzles[i].completed && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#50c878', color: 'white',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Progress */}
      <p style={{ color: '#7050b0', fontSize: 11, opacity: 0.55, marginBottom: 8 }}>
        {puzzle.completed ? '¡Completado! 🎉' : `${placedCount} de ${TOTAL} piezas`}
      </p>
      {!puzzle.completed && (
        <p style={{ color: '#9070c0', fontSize: 11, fontStyle: 'italic', opacity: 0.55, marginBottom: 10 }}>
          toca una pieza · toca otra para intercambiarlas
        </p>
      )}

      {/* Board */}
      <div className="relative w-full" style={{ maxWidth: 680 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          aspectRatio: `${COLS} / ${ROWS}`,
          width: '100%',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(60,20,120,0.18)',
          position: 'relative',
        }}>
          {puzzle.positions.map((pieceId, slotIdx) => {
            const col = pieceId % COLS
            const row = Math.floor(pieceId / COLS)
            const isLocked   = locked.has(slotIdx)
            const isSelected = selected === slotIdx
            const xPct = col === 0 ? 0 : (col / (COLS - 1)) * 100
            const yPct = row === 0 ? 0 : (row / (ROWS - 1)) * 100

            return (
              <button
                key={slotIdx}
                onClick={() => handleClick(slotIdx)}
                style={{
                  backgroundImage: `url(${IMAGES[activeIdx]})`,
                  backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                  backgroundPosition: `${xPct}% ${yPct}%`,
                  border: isSelected
                    ? '2px solid rgba(120,60,220,0.95)'
                    : '1px solid rgba(0,0,0,0.08)',
                  cursor: isLocked ? 'default' : 'pointer',
                  outline: 'none', padding: 0, position: 'relative',
                  transition: 'border 0.12s',
                }}
              >
                {!isLocked && !puzzle.revealImg && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
                )}
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(120,60,220,0.35)', pointerEvents: 'none' }} />
                )}
              </button>
            )
          })}

          {/* Full image reveal */}
          {puzzle.completed && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${IMAGES[activeIdx]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: puzzle.revealImg ? 1 : 0,
              transition: 'opacity 1.2s ease',
              zIndex: 10,
              pointerEvents: 'none',
            }} />
          )}
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={handleRestart}
            style={{
              fontSize: 11, color: '#9070c0', opacity: 0.5,
              background: 'none', border: 'none', cursor: 'pointer',
              textDecoration: 'underline',
            }}
            className="hover:opacity-80"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>

      {/* Message — only after both completed */}
      {showMsg && (
        <div className="animate-pop-in mt-6 w-full rounded-2xl p-6 text-center"
          style={{ maxWidth: 400, background: 'white', boxShadow: '0 8px 40px rgba(80,40,160,0.2)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💌</div>
          <p style={{ color: '#2a1a50', fontSize: 14, lineHeight: 1.8, fontStyle: 'italic' }}>
            {message || '…'}
          </p>
          <p style={{ color: '#8060c0', fontSize: 11, opacity: 0.5, marginTop: 14 }}>— Nico 🐸</p>
        </div>
      )}

      <a href="/home" style={{ color: '#8060c0', fontSize: 11, marginTop: 20, opacity: 0.4 }}
        className="underline hover:opacity-70 transition-opacity">
        ← Volver al calendario
      </a>
    </div>
  )
}
