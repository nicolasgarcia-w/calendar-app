'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Dir = 'across' | 'down'

interface WordDef {
  number: number
  direction: Dir
  startRow: number
  startCol: number
  answer: string
  clue: string
}

const WORDS: WordDef[] = [
  { number: 1,  direction: 'down',   startRow: 0,  startCol: 14, answer: 'OJOSCOLORSOL', clue: 'La primera canción que me recomendaste' },
  { number: 2,  direction: 'down',   startRow: 0,  startCol: 22, answer: 'CAMILLE',       clue: 'Quién siguió a quién primero en Instagram' },
  { number: 3,  direction: 'across', startRow: 1,  startCol: 6,  answer: 'SPLASH',        clue: 'Donde nos conocimos' },
  { number: 4,  direction: 'down',   startRow: 1,  startCol: 9,  answer: 'AQUARIUM',      clue: 'Nuestra primera cita' },
  { number: 5,  direction: 'down',   startRow: 2,  startCol: 20, answer: 'NEWYORK',       clue: 'Nuestro primer viaje solos' },
  { number: 6,  direction: 'across', startRow: 3,  startCol: 7,  answer: 'PLURIBUS',      clue: 'El primer show que empezamos juntos' },
  { number: 7,  direction: 'down',   startRow: 5,  startCol: 11, answer: 'CHEESECAKE',    clue: 'El primer restaurante al que fuimos' },
  { number: 8,  direction: 'across', startRow: 6,  startCol: 5,  answer: 'STUVI',         clue: 'Nuestro primer beso de verdad' },
  { number: 8,  direction: 'down',   startRow: 6,  startCol: 5,  answer: 'SANFRANCISCO',  clue: 'Nuestra ciudad favorita de California' },
  { number: 9,  direction: 'across', startRow: 6,  startCol: 13, answer: 'BLACKPHONE',    clue: 'Nuestra primera película solos' },
  { number: 10, direction: 'across', startRow: 8,  startCol: 5,  answer: 'NOVEMBER',      clue: 'El mes en que te pedí salir' },
  { number: 11, direction: 'across', startRow: 11, startCol: 0,  answer: 'HANDMAID',      clue: 'El primer libro que te regalé' },
]

const ROWS = 18
const COLS = 23

interface CellInfo {
  row: number
  col: number
  label?: number
  wordIndices: number[]
}

function buildGrid(): (CellInfo | null)[][] {
  const grid: (CellInfo | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  WORDS.forEach((word, wi) => {
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === 'across' ? word.startRow : word.startRow + i
      const c = word.direction === 'across' ? word.startCol + i : word.startCol
      if (!grid[r][c]) grid[r][c] = { row: r, col: c, wordIndices: [] }
      grid[r][c]!.wordIndices.push(wi)
    }
  })
  // Assign number labels (only one label per cell, first encountered wins)
  const labeled = new Set<string>()
  WORDS.forEach((word) => {
    const key = `${word.startRow},${word.startCol}`
    if (!labeled.has(key)) {
      labeled.add(key)
      const cell = grid[word.startRow][word.startCol]
      if (cell) cell.label = word.number
    }
  })
  return grid
}

const GRID = buildGrid()

function ck(r: number, c: number) { return `${r},${c}` }

function wordCellSet(wi: number): Set<string> {
  const word = WORDS[wi]
  const s = new Set<string>()
  for (let i = 0; i < word.answer.length; i++) {
    const r = word.direction === 'across' ? word.startRow : word.startRow + i
    const c = word.direction === 'across' ? word.startCol + i : word.startCol
    s.add(ck(r, c))
  }
  return s
}

function findWordIndex(r: number, c: number, dir: Dir): number {
  const cell = GRID[r]?.[c]
  if (!cell) return -1
  return cell.wordIndices.find(wi => WORDS[wi].direction === dir) ?? -1
}

function nextCell(r: number, c: number, dir: Dir): [number, number] {
  return dir === 'across' ? [r, c + 1] : [r + 1, c]
}

function prevCell(r: number, c: number, dir: Dir): [number, number] {
  return dir === 'across' ? [r, c - 1] : [r - 1, c]
}

type Props = { dayNumber: number; title: string; alreadyOpened: boolean }

export function CrosswordReveal({ dayNumber, title, alreadyOpened }: Props) {
  const [opened, setOpened] = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)
  const [letters, setLetters] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [dir, setDir] = useState<Dir>('across')
  const [activeWi, setActiveWi] = useState(-1)
  const markedRef = useRef(alreadyOpened)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFocusingRef = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`crossword-${dayNumber}`)
      if (saved) setLetters(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [dayNumber])

  useEffect(() => {
    if (Object.keys(letters).length > 0) {
      localStorage.setItem(`crossword-${dayNumber}`, JSON.stringify(letters))
    }
  }, [letters, dayNumber])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  const select = useCallback((r: number, c: number, preferDir?: Dir) => {
    const cell = GRID[r]?.[c]
    if (!cell) return
    const hasAcross = cell.wordIndices.some(wi => WORDS[wi].direction === 'across')
    const hasDown   = cell.wordIndices.some(wi => WORDS[wi].direction === 'down')

    let newDir = preferDir ?? dir
    if (selected && selected[0] === r && selected[1] === c && !preferDir) {
      // Toggle direction when clicking same cell
      newDir = dir === 'across' ? 'down' : 'across'
    }
    if (newDir === 'across' && !hasAcross) newDir = 'down'
    if (newDir === 'down'   && !hasDown)   newDir = 'across'

    setDir(newDir)
    setSelected([r, c])
    setActiveWi(findWordIndex(r, c, newDir))
  }, [selected, dir])

  const handleKey = useCallback((e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select(r, c + 1, 'across'); return }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); select(r, c - 1, 'across'); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); select(r + 1, c, 'down');   return }
    if (e.key === 'ArrowUp')    { e.preventDefault(); select(r - 1, c, 'down');   return }

    if (e.key === 'Backspace') {
      e.preventDefault()
      const key = ck(r, c)
      if (letters[key]) {
        setLetters(prev => { const n = { ...prev }; delete n[key]; return n })
      } else {
        const [pr, pc] = prevCell(r, c, dir)
        if (GRID[pr]?.[pc]) {
          select(pr, pc, dir)
          setLetters(prev => { const n = { ...prev }; delete n[ck(pr, pc)]; return n })
        }
      }
      return
    }

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault()
      setLetters(prev => ({ ...prev, [ck(r, c)]: e.key.toUpperCase() }))
      const [nr, nc] = nextCell(r, c, dir)
      // Advance only if next cell is in the same word
      if (GRID[nr]?.[nc] && findWordIndex(nr, nc, dir) === activeWi) {
        select(nr, nc, dir)
      }
    }
  }, [letters, dir, activeWi, select])

  // Move DOM focus whenever selected cell changes
  useEffect(() => {
    if (!selected || !scrollRef.current) return
    const [r, c] = selected
    isFocusingRef.current = true
    const input = scrollRef.current.querySelector<HTMLInputElement>(
      `input[data-cell="${ck(r, c)}"]`
    )
    input?.focus()
    isFocusingRef.current = false
  }, [selected])

  const activeCells = activeWi >= 0 ? wordCellSet(activeWi) : new Set<string>()

  // Unique clues per direction
  const acrossClues = WORDS.filter(w => w.direction === 'across')
  const downClues   = WORDS.filter(w => w.direction === 'down')

  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {['top-8 left-6','top-16 right-10','bottom-24 left-12','bottom-16 right-8'].map((pos, i) => (
            <span key={i} className={`absolute text-rose-200 text-2xl opacity-60 ${pos}`}>🌸</span>
          ))}
        </div>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['relative flex flex-col items-center gap-5 transition-all duration-350', opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div className="text-9xl drop-shadow-sm select-none">🧩</div>
          <p className="text-rose-500 text-sm font-medium tracking-wide animate-pulse-subtle">Toca para abrir</p>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-rose-300 text-xs font-semibold mb-1 tracking-widest uppercase">Día {dayNumber}</p>
        <h1 className="text-center text-xl font-semibold text-rose-800 mb-4">{title}</h1>

        {/* Active clue banner */}
        {activeWi >= 0 && (
          <div className="mb-3 mx-auto max-w-sm bg-white/80 rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-xs font-bold text-rose-400 mr-1">
              {WORDS[activeWi].number} {WORDS[activeWi].direction === 'across' ? 'Horizontal' : 'Vertical'}:
            </span>
            <span className="text-sm text-slate-700">{WORDS[activeWi].clue}</span>
          </div>
        )}

        {/* Scrollable grid */}
        <div ref={scrollRef} className="overflow-x-auto pb-2 -mx-4 px-4">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 28px)`,
              gridTemplateRows: `repeat(${ROWS}, 28px)`,
              gap: '1px',
              backgroundColor: '#1e293b',
              border: '2px solid #1e293b',
              borderRadius: 4,
              width: 'fit-content',
              margin: '0 auto',
            }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const cell = GRID[r][c]
                const key = ck(r, c)
                const isSelected = selected?.[0] === r && selected?.[1] === c
                const isHighlighted = activeCells.has(key)

                if (!cell) return (
                  <div key={key} style={{ backgroundColor: '#1e293b', width: 28, height: 28 }} />
                )

                const bg = isSelected ? '#fda4af' : isHighlighted ? '#fecdd3' : 'white'

                return (
                  <div
                    key={key}
                    style={{ position: 'relative', width: 28, height: 28, backgroundColor: bg, cursor: 'text' }}
                    onClick={() => select(r, c)}
                  >
                    {cell.label !== undefined && (
                      <span style={{
                        position: 'absolute', top: 1, left: 1.5,
                        fontSize: 7, lineHeight: 1, color: '#64748b', fontWeight: 700,
                        pointerEvents: 'none', userSelect: 'none', zIndex: 1,
                      }}>
                        {cell.label}
                      </span>
                    )}
                    <input
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={letters[key] ?? ''}
                      readOnly
                      data-cell={key}
                      onKeyDown={(e) => handleKey(e, r, c)}
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1e293b',
                        background: 'transparent', border: 'none', outline: 'none',
                        textTransform: 'uppercase', cursor: 'text',
                        paddingTop: cell.label !== undefined ? 9 : 0,
                        caretColor: 'transparent',
                      }}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Clue lists */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {([['across', acrossClues], ['down', downClues]] as [Dir, WordDef[]][]).map(([d, clues]) => (
            <div key={d}>
              <h2 className="text-sm font-bold text-rose-700 mb-2 uppercase tracking-wide">
                {d === 'across' ? 'Horizontal' : 'Vertical'}
              </h2>
              <ul className="space-y-1.5">
                {clues.map((w) => {
                  const wi = WORDS.indexOf(w)
                  const isActive = wi === activeWi
                  return (
                    <li
                      key={`${w.number}-${d}`}
                      className={`text-sm px-2 py-1 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-rose-100 text-rose-800 font-medium' : 'text-slate-600 hover:bg-rose-50'}`}
                      onClick={() => select(w.startRow, w.startCol, w.direction)}
                    >
                      <span className="font-semibold text-rose-500 mr-1">{w.number}.</span>
                      {w.clue}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/home" className="text-sm text-rose-400 hover:text-rose-600 underline underline-offset-2">
            ← Volver al calendario
          </a>
        </div>
      </div>
    </div>
  )
}
