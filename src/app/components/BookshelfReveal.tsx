'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const BOOKS = [
  {
    id: 1,
    spine:    'The Shining',
    title:    'The Shining',
    author:   'Stephen King',
    spineColor:  '#0a7a80',
    spineText:   '#d0f5f5',
    pageLeft:    '#065a60',
    pageRight:   '#f0fffe',
    accentColor: '#20c0c8',
    height: 178,
    width:   46,
    icon:    '🔴',
    cover:   '/bookshelf/cover1.jpeg',
  },
  {
    id: 2,
    spine:    'Veinte Poemas de Amor',
    title:    'Veinte poemas de amor y una canción desesperada',
    author:   'Pablo Neruda',
    spineColor:  '#e8dfc8',
    spineText:   '#3a2a10',
    pageLeft:    '#d8ceb0',
    pageRight:   '#fdfaf3',
    accentColor: '#8a6a30',
    height: 162,
    width:   43,
    icon:    '🌹',
    cover:   '/bookshelf/cover2.jpg',
  },
  {
    id: 3,
    spine:    'Project Hail Mary',
    title:    'Project Hail Mary',
    author:   'Andy Weir',
    spineColor:  '#1a1a1a',
    spineText:   '#f5d800',
    pageLeft:    '#111111',
    pageRight:   '#fffde8',
    accentColor: '#f5d800',
    height: 184,
    width:   50,
    icon:    '🌌',
    cover:   '/bookshelf/cover3.jpg',
  },
  {
    id: 4,
    spine:    'Puerto Rico',
    title:    'Puerto Rico',
    author:   'Jorell Meléndez Badillo',
    spineColor:  '#4a9ed8',
    spineText:   '#ffffff',
    pageLeft:    '#2a78b8',
    pageRight:   '#f0f8ff',
    accentColor: '#1a68a8',
    height: 156,
    width:   44,
    icon:    '🌿',
    cover:   '/bookshelf/cover4.jpg',
  },
  {
    id: 5,
    spine:    'The Old Man and the Sea',
    title:    'The Old Man and the Sea',
    author:   'Ernest Hemingway',
    spineColor:  '#c84a10',
    spineText:   '#fde8c8',
    pageLeft:    '#a03208',
    pageRight:   '#fffaf5',
    accentColor: '#e86820',
    height: 170,
    width:   48,
    icon:    '🌊',
    cover:   '/bookshelf/cover5.jpg',
  },
]

// Deterministic background book rows
// Each row: array of {w, h, color}
const BG_SPINE_COLORS = [
  '#3d1a08','#1c2d40','#2d1040','#0f2818','#402010',
  '#3a2d08','#1a3028','#381830','#203840','#301808',
  '#1a1040','#2a3010','#401828','#103028','#382808',
  '#281838','#183820','#3a1010','#102838','#283018',
]

function makeBgRow(seed: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const s = (seed * 31 + i * 17) % BG_SPINE_COLORS.length
    const w = 14 + ((seed + i * 7) % 22)
    const h = 55 + ((seed * 3 + i * 11) % 55)
    return { w, h, color: BG_SPINE_COLORS[s] }
  })
}

const BG_ROWS = [
  makeBgRow(5,  55),
  makeBgRow(13, 50),
  makeBgRow(29, 58),
  makeBgRow(41, 52),
  makeBgRow(7,  56),
]

function BackgroundWall() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: '#2a1a0a',
      overflow: 'hidden',
    }}>
      {/* Overhead ambient light */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '140%', height: 320,
        background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,195,100,0.13) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Repeating shelf rows */}
      {BG_ROWS.map((row, ri) => {
        const rowTop = ri * 20 // percent spacing
        const shelfH = 130 + (ri % 2) * 20
        return (
          <div key={ri} style={{
            position: 'absolute',
            top: `${rowTop}%`,
            left: 0, right: 0,
            height: shelfH,
          }}>
            {/* Books */}
            <div style={{
              position: 'absolute', bottom: 10, left: 0, right: 0,
              display: 'flex', alignItems: 'flex-end', gap: 2, padding: '0 4px',
              overflowX: 'hidden',
            }}>
              {row.map((book, bi) => (
                <div key={bi} style={{
                  flexShrink: 0,
                  width: book.w,
                  height: book.h,
                  background: book.color,
                  borderRadius: '1px 2px 2px 1px',
                  opacity: 0.55,
                }} />
              ))}
            </div>

            {/* Shelf plank */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 10,
              background: 'linear-gradient(180deg, #6a4020 0%, #4a2a10 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }} />
          </div>
        )
      })}

      {/* Dark vignette overlay to focus on center */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 70% at 50% 50%, transparent 20%, rgba(10,5,2,0.65) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

type Props = {
  dayNumber: number
  title: string
  alreadyOpened: boolean
  memories?: string[]
  isPreview?: boolean
}

export function BookshelfReveal({ dayNumber, title, alreadyOpened, memories = [], isPreview = false }: Props) {
  const [opened,  setOpened]  = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)
  const [pulledId, setPulledId] = useState<number | null>(null)
  const [openId,   setOpenId]   = useState<number | null>(null)
  const [readIds,  setReadIds]  = useState<Set<number>>(new Set())
  const markedRef = useRef(alreadyOpened)

  const openBook = BOOKS.find(b => b.id === openId)
  const memory   = openId !== null ? (memories[openId - 1] ?? '') : ''

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  function handleBookClick(id: number) {
    if (pulledId === id) {
      setOpenId(id)
      setReadIds(prev => new Set([...prev, id]))
    } else {
      setPulledId(id)
    }
  }

  function closeBook() { setOpenId(null) }

  // ── Sealed ────────────────────────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
        <BackgroundWall />
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['flex flex-col items-center gap-5 transition-all duration-300 relative z-10',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div style={{ fontSize: 88 }} className="select-none drop-shadow-xl">📚</div>
          <p style={{ color: '#d4a86a', fontSize: 13, fontStyle: 'italic', letterSpacing: '0.06em', opacity: 0.85 }}>
            Bienvenida a la librería
          </p>
        </button>
      </div>
    )
  }

  // ── Bookshelf ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 animate-fade-in relative overflow-hidden">
      <BackgroundWall />

      {/* Overhead lamp focused on the interactive shelf */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 380,
        background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,200,100,0.18) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Header */}
      <div className="mb-10 text-center relative z-10">
        <p style={{ color: '#a07848', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>
          Día {dayNumber}
        </p>
        <h1 style={{ color: '#f0d8a8', fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>
          {title}
        </h1>
        <div style={{ width: 40, height: 1, background: '#a07848', margin: '10px auto 8px', opacity: 0.5 }} />
        <p style={{ color: '#c8a878', fontSize: 13, fontStyle: 'italic', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 10px' }}>
          Como siempre terminamos en librerías, escogí unos libros que significan algo para nosotros.
        </p>
        <p style={{ color: '#a07848', fontSize: 11, opacity: 0.6 }}>
          {readIds.size === BOOKS.length
            ? 'Todos los libros leídos ✦'
            : `${readIds.size} de ${BOOKS.length} libros abiertos`}
        </p>
      </div>

      {/* Interactive shelf */}
      <div className="relative w-full z-10" style={{ maxWidth: 560 }}>

        {/* Warm glow from lamp above the shelf */}
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 240,
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,200,100,0.16) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Back wall — slightly lighter walnut so books read against it */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: 'linear-gradient(180deg, #3a2210 0%, #2a180a 100%)',
          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,180,80,0.08)',
        }} />

        {/* Books row */}
        <div className="relative flex items-end justify-center gap-1 px-6 pt-8 pb-0"
          style={{ minHeight: 240, zIndex: 1 }}>

          {/* Left bookend */}
          <div style={{
            flexShrink: 0, alignSelf: 'flex-end',
            width: 14, height: 80,
            background: 'linear-gradient(90deg, #5a3020, #7a4835)',
            borderRadius: '4px 4px 0 0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.5)',
          }} />

          {BOOKS.map((book) => {
            const isPulled = pulledId === book.id
            const isRead   = readIds.has(book.id)

            return (
              <button
                key={book.id}
                onClick={() => handleBookClick(book.id)}
                title={book.title}
                style={{
                  position: 'relative',
                  width: book.width,
                  height: book.height,
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  background: 'none',
                  transform: isPulled ? 'translateY(-24px)' : 'translateY(0)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  filter: isPulled
                    ? `drop-shadow(0 16px 24px rgba(0,0,0,0.7)) drop-shadow(0 0 14px ${book.accentColor}55)`
                    : 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                  zIndex: isPulled ? 10 : 1,
                }}
              >
                {/* Spine body */}
                <div className="absolute inset-0 flex flex-col items-center justify-between py-3"
                  style={{
                    background: `linear-gradient(90deg, ${book.spineColor}cc, ${book.spineColor}ff, ${book.spineColor}cc)`,
                    borderRadius: '2px 4px 4px 2px',
                    borderRight: `1px solid ${book.spineText}22`,
                  }}>
                  <div style={{ width: '70%', height: 2, background: book.spineText, opacity: 0.25, borderRadius: 1 }} />
                  <div style={{
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    color: book.spineText,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    padding: '0 4px',
                    maxHeight: book.height - 50,
                    overflow: 'hidden',
                  }}>
                    {book.spine}
                  </div>
                  <div style={{ width: '70%', height: 2, background: book.spineText, opacity: 0.25, borderRadius: 1 }} />
                </div>

                {/* Top-light sheen */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                  background: 'linear-gradient(180deg, rgba(255,205,110,0.12) 0%, transparent 100%)',
                  borderRadius: '2px 4px 0 0',
                  pointerEvents: 'none',
                }} />

                {isRead && (
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#4a8c28', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  }}>✓</div>
                )}

                {isPulled && (
                  <div style={{
                    position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap', fontSize: 10, fontWeight: 600,
                    color: book.accentColor, letterSpacing: '0.05em',
                  }}>
                    abrir →
                  </div>
                )}
              </button>
            )
          })}

          {/* Right bookend */}
          <div style={{
            flexShrink: 0, alignSelf: 'flex-end',
            width: 14, height: 80,
            background: 'linear-gradient(90deg, #7a4835, #5a3020)',
            borderRadius: '4px 4px 0 0',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.5)',
          }} />
        </div>

        {/* Shelf plank */}
        <div style={{
          height: 20,
          background: 'linear-gradient(180deg, #8a5838 0%, #5a3520 50%, #3a2010 100%)',
          borderRadius: '0 0 6px 6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,180,80,0.25)',
          position: 'relative', zIndex: 2,
        }}>
          {[18, 42, 66].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 7, left: `${p}%`,
              width: '12%', height: 1,
              background: 'rgba(0,0,0,0.2)', borderRadius: 1,
            }} />
          ))}
        </div>
      </div>

      <p style={{ color: '#9a7040', fontSize: 11, marginTop: 36, opacity: 0.6, fontStyle: 'italic' }} className="relative z-10">
        toca un libro para sacarlo · toca de nuevo para abrirlo
      </p>
      <a href="/home" style={{ color: '#9a7040', fontSize: 11, marginTop: 10, opacity: 0.4 }}
        className="underline hover:opacity-70 transition-opacity relative z-10">
        ← Volver al calendario
      </a>

      {/* ── Open book modal ──────────────────────────────────────────────────── */}
      {openBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={closeBook}
        >
          <div
            className="animate-pop-in w-full flex overflow-hidden"
            style={{
              maxWidth: 620, minHeight: 340,
              borderRadius: 4,
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,180,80,0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left page — cover image */}
            <div className="flex-1 relative overflow-hidden" style={{ minWidth: 0, minHeight: 340 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={openBook.cover}
                alt={openBook.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Spine crease */}
            <div style={{ width: 8, background: 'linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.08), rgba(255,255,255,0.04), rgba(0,0,0,0.05))' }} />

            {/* Right page — title page style with handwritten note */}
            <div className="flex-1 flex flex-col" style={{ background: '#faf8f2', minWidth: 0, minHeight: 340, position: 'relative' }}>

              {/* Title page content — top 60% */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 16px', gap: 8 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, textAlign: 'center', color: '#1a1008', lineHeight: 1.3, letterSpacing: '0.01em' }}>
                  {openBook.title}
                </p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#3a2a10', marginTop: 4, letterSpacing: '0.03em' }}>
                  {openBook.author}
                </p>

                {/* Ornamental divider */}
                <div style={{ margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.35 }}>
                  <div style={{ width: 28, height: 1, background: '#3a2a10' }} />
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="#3a2a10">
                    <path d="M9 2 C9 2 6 5 3 5 C1 5 0 4 0 4 C0 4 1 7 3 7 C5 7 7 6 9 7 C11 6 13 7 15 7 C17 7 18 4 18 4 C18 4 17 5 15 5 C12 5 9 2 9 2Z" />
                    <circle cx="9" cy="10" r="1.5" />
                  </svg>
                  <div style={{ width: 28, height: 1, background: '#3a2a10' }} />
                </div>
              </div>

              {/* Handwritten note — bottom section */}
              <div style={{
                borderTop: '1px dashed rgba(80,50,20,0.18)',
                padding: '14px 20px 20px',
                background: 'rgba(255,248,220,0.5)',
                position: 'relative',
              }}>
                {/* Tape strip effect at top */}
                <div style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  width: 48, height: 16,
                  background: 'rgba(220,200,140,0.55)',
                  borderRadius: 2,
                }} />
                <p style={{
                  fontFamily: 'cursive',
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: '#1a0e40',
                  transform: 'rotate(-1.2deg)',
                  marginTop: 6,
                }}>
                  {memory || '…'}
                </p>
                <p style={{
                  fontFamily: 'cursive',
                  fontSize: 12,
                  color: '#1a0e40',
                  opacity: 0.6,
                  textAlign: 'right',
                  marginTop: 6,
                  transform: 'rotate(-0.8deg)',
                }}>
                  — Nico 🐸
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={closeBook}
            style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.4)', fontSize: 26, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
            className="hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
