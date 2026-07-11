'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const WORDS = ['BOSTON', 'COMMON']
const MAX_GUESSES = 8
const WORD_LENGTH = 6

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

type CellResult = 'correct' | 'present' | 'absent'

function evaluateGuess(guess: string, target: string): CellResult[] {
  const result: CellResult[] = Array(WORD_LENGTH).fill('absent') as CellResult[]
  const tUsed = Array(WORD_LENGTH).fill(false)
  const gUsed = Array(WORD_LENGTH).fill(false)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) { result[i] = 'correct'; tUsed[i] = true; gUsed[i] = true }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (gUsed[i]) continue
    for (let j = 0; j < WORD_LENGTH; j++) {
      if (tUsed[j]) continue
      if (guess[i] === target[j]) { result[i] = 'present'; tUsed[j] = true; break }
    }
  }
  return result
}

function bestKeyState(letter: string, guesses: string[], results: CellResult[][]): CellResult | null {
  let best: CellResult | null = null
  guesses.forEach((g, gi) => {
    [...g].forEach((ch, ci) => {
      if (ch !== letter) return
      const r = results[gi]?.[ci]; if (!r) return
      if (r === 'correct') best = 'correct'
      else if (r === 'present' && best !== 'correct') best = 'present'
      else if (r === 'absent' && best === null) best = 'absent'
    })
  })
  return best
}

type PuzzleState = { guesses: string[]; results: CellResult[][]; solved: boolean; failed: boolean }
const initPuzzle = (): PuzzleState => ({ guesses: [], results: [], solved: false, failed: false })

type Stage = 'sealed' | 'playing' | 'between' | 'complete'

type Props = { dayNumber: number; title: string; alreadyOpened: boolean; isPreview?: boolean }

const RESULT_STYLE: Record<CellResult, React.CSSProperties> = {
  correct: { background: '#538d4e', color: 'white', borderColor: '#538d4e' },
  present: { background: '#b59f3b', color: 'white', borderColor: '#b59f3b' },
  absent:  { background: '#3a3a3c', color: 'white', borderColor: '#3a3a3c' },
}

export function WordleReveal({ dayNumber, title, alreadyOpened, isPreview = false }: Props) {
  const [stage, setStage]             = useState<Stage>(alreadyOpened ? 'playing' : 'sealed')
  const [puzzleIdx, setPuzzleIdx]     = useState(0)
  const [puzzles, setPuzzles]         = useState<[PuzzleState, PuzzleState]>([initPuzzle(), initPuzzle()])
  const [currentGuess, setCurrentGuess] = useState('')
  const [shaking, setShaking]         = useState(false)
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setStage('playing')
  }

  const puzzle  = puzzles[puzzleIdx]
  const word    = WORDS[puzzleIdx]
  const isOver  = puzzle.solved || puzzle.failed

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShaking(true); setTimeout(() => setShaking(false), 500); return
    }
    const guess    = currentGuess.toUpperCase()
    const result   = evaluateGuess(guess, word)
    const correct  = guess === word
    const newCount = puzzle.guesses.length + 1

    setPuzzles(prev => {
      const next: [PuzzleState, PuzzleState] = [{ ...prev[0] }, { ...prev[1] }]
      const p = next[puzzleIdx]
      p.guesses = [...p.guesses, guess]
      p.results = [...p.results, result]
      p.solved  = correct
      p.failed  = !correct && newCount >= MAX_GUESSES
      return next
    })
    setCurrentGuess('')

    if (correct) {
      if (puzzleIdx === 0) {
        setTimeout(() => setStage('between'), 1200)
        setTimeout(() => { setStage('playing'); setPuzzleIdx(1) }, 3000)
      } else {
        setTimeout(() => setStage('complete'), 1200)
      }
    }
  }, [currentGuess, puzzle.guesses.length, puzzleIdx, word])

  const handleKey = useCallback((key: string) => {
    if (stage !== 'playing' || isOver) return
    if (key === '⌫' || key === 'Backspace') { setCurrentGuess(g => g.slice(0, -1)); return }
    if (key === 'ENTER' || key === 'Enter')  { submitGuess(); return }
    if (/^[A-Za-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(g => g + key.toUpperCase())
    }
  }, [stage, isOver, currentGuess, submitGuess])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKey(e.key)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKey])

  function resetPuzzle(idx: number) {
    setPuzzles(prev => {
      const next: [PuzzleState, PuzzleState] = [{ ...prev[0] }, { ...prev[1] }]
      next[idx] = initPuzzle()
      return next
    })
    setPuzzleIdx(idx); setCurrentGuess(''); setStage('playing')
  }

  function buildGrid(p: PuzzleState, isCurrent: boolean) {
    const rows: { letters: string[]; results: (CellResult | null)[] }[] = []
    p.guesses.forEach((g, i) => rows.push({ letters: [...g], results: p.results[i] }))
    if (isCurrent && !isOver) {
      rows.push({
        letters: Array.from({ length: WORD_LENGTH }, (_, i) => currentGuess[i] ?? ''),
        results: Array(WORD_LENGTH).fill(null),
      })
    }
    while (rows.length < MAX_GUESSES) rows.push({ letters: Array(WORD_LENGTH).fill(''), results: Array(WORD_LENGTH).fill(null) })
    return rows
  }

  // ── Sealed ────────────────────────────────────────────────────────────────────
  if (stage === 'sealed') return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <button onClick={handleOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 80 }}>🎁</div>
        <p style={{ color: '#b08060', fontSize: 13, letterSpacing: '0.1em', margin: 0 }}>Toca para abrir</p>
      </button>
    </div>
  )

  // ── Between ───────────────────────────────────────────────────────────────────
  if (stage === 'between') return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <style>{`@keyframes pop-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      <div style={{ textAlign: 'center', animation: 'pop-in 0.4s ease forwards' }}>
        <div style={{ fontSize: 72 }}>🎉</div>
        <h2 style={{ color: '#2d2d2d', fontSize: 22, fontWeight: 700, marginTop: 12 }}>¡BOSTON!</h2>
        <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>Ahora el segundo…</p>
      </div>
    </div>
  )

  // ── Complete ──────────────────────────────────────────────────────────────────
  if (stage === 'complete') return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: '#faf8f5' }}>
      <style>{`
        @keyframes pop-in  { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shine   { 0%,100% { opacity: 0.75; } 50% { opacity: 1; } }
      `}</style>
      <div style={{ maxWidth: 340, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, animation: 'pop-in 0.5s ease forwards' }}>🎊</div>
        <h2 style={{ color: '#2d2d2d', fontSize: 24, fontWeight: 800, marginTop: 16, animation: 'fade-up 0.6s 0.3s ease both' }}>
          ¡Las dos palabras!
        </h2>
        <p style={{ color: '#888', fontSize: 14, marginTop: 8, lineHeight: 1.7, animation: 'fade-up 0.6s 0.5s ease both' }}>
          Tus respuestas forman la contraseña para el Día 10:
        </p>
        <div style={{
          marginTop: 28, padding: '22px 32px',
          background: 'white', borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '2px solid #e0d8d0',
          animation: 'fade-up 0.6s 0.7s ease both',
        }}>
          <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, margin: '0 0 10px' }}>
            Contraseña del Día 10
          </p>
          <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.06em', color: '#1a1a1a', fontFamily: 'monospace', animation: 'shine 2.5s ease-in-out infinite', margin: 0 }}>
            BOSTON COMMON
          </p>
          <p style={{ color: '#aaa', fontSize: 11, marginTop: 10, fontStyle: 'italic', margin: '10px 0 0' }}>
            Escríbela exactamente así (con espacio)
          </p>
        </div>
        <a href="/home" style={{ display: 'inline-block', marginTop: 28, color: '#b08060', fontSize: 13, textDecoration: 'underline', animation: 'fade-up 0.6s 1s ease both' }}>
          ← Volver al calendario
        </a>
      </div>
    </div>
  )

  // ── Playing ───────────────────────────────────────────────────────────────────
  const grid = buildGrid(puzzle, true)

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: '#faf8f5', userSelect: 'none' }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes pop-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #e8e0d8' }}>
        <a href="/home" style={{ color: '#b08060', fontSize: 12, textDecoration: 'none', opacity: 0.7 }}>← Calendario</a>
      </div>
      <div style={{ textAlign: 'center', padding: '12px 16px 12px', borderBottom: '1px solid #e8e0d8' }}>
        <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
          Día {dayNumber} · Puzzle {puzzleIdx + 1} de 2
        </p>
        <h1 style={{ color: '#2d2d2d', fontSize: 20, fontWeight: 800, margin: '4px 0 6px' }}>{title}</h1>
        <p style={{ color: '#a08070', fontSize: 12, margin: 0, fontStyle: 'italic' }}>
          Resuelve los dos puzzles para desbloquear la contraseña del Día 10 🔑
        </p>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 8 }}>
        <div
          style={{
            display: 'grid', gridTemplateRows: `repeat(${MAX_GUESSES}, 52px)`, gap: 6,
            animation: shaking ? 'shake 0.5s ease' : undefined,
          }}
        >
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${WORD_LENGTH}, 52px)`, gap: 6 }}>
              {row.letters.map((letter, ci) => {
                const result = row.results[ci]
                const isCurrentRow = ri === puzzle.guesses.length && !isOver
                const isTyped = isCurrentRow && ci < currentGuess.length
                return (
                  <div key={ci} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 52, height: 52, borderRadius: 4,
                    border: `2px solid ${result ? (RESULT_STYLE[result] as { borderColor: string }).borderColor : isTyped ? '#878a8c' : '#d3d6da'}`,
                    background: result ? (RESULT_STYLE[result] as { background: string }).background : 'white',
                    color: result ? 'white' : '#1a1a1b',
                    fontSize: 22, fontWeight: 800,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}>
                    {letter}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Status messages */}
        {puzzle.solved && (
          <p style={{ color: '#538d4e', fontSize: 16, fontWeight: 700, marginTop: 20, animation: 'pop-in 0.4s ease' }}>
            {puzzleIdx === 0 ? '¡BOSTON! Pasando al siguiente…' : '🎊 ¡COMMON!'}
          </p>
        )}
        {puzzle.failed && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: '#e05050', fontSize: 14, fontWeight: 600 }}>
              La palabra era <strong>{word}</strong>
            </p>
            <button
              onClick={() => resetPuzzle(puzzleIdx)}
              style={{
                marginTop: 10, padding: '8px 24px', borderRadius: 20,
                background: '#f0ece6', border: '1px solid #d0c8be',
                color: '#7a6a5a', fontSize: 13, cursor: 'pointer',
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>

      {/* Keyboard */}
      <div style={{ paddingBottom: 28, paddingTop: 8 }}>
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 5 }}>
            {row.map(key => {
              const ks = key.length === 1 ? bestKeyState(key, puzzle.guesses, puzzle.results) : null
              const isWide = key === 'ENTER' || key === '⌫'
              const keyBg    = ks === 'correct' ? '#538d4e' : ks === 'present' ? '#b59f3b' : ks === 'absent' ? '#3a3a3c' : '#d3d6da'
              const keyColor = ks ? 'white' : '#1a1a1b'
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  style={{
                    width: isWide ? 62 : 35, height: 54, borderRadius: 4, border: 'none',
                    background: keyBg, color: keyColor,
                    fontSize: isWide ? 11 : 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.3s',
                  }}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
