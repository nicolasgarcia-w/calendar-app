'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const PASSWORD = 'BOSTON COMMON'

type PinDef = { id: number; label: string; sublabel: string; emoji: string; x: number; y: number; color: string }

// viewBox is "-150 0 550 500": Public Garden lives at x:-145→12, Boston Common at x:22→388
const PINS: PinDef[] = [
  { id: 0, label: 'Nuestro banco', sublabel: 'En el parque',       emoji: '🪑', x: 135, y: 255, color: '#4e7e3e' },
  { id: 1, label: 'El muelle',     sublabel: 'Public Garden',      emoji: '⛵', x: -52, y: 260, color: '#3a7890' },
  { id: 2, label: 'Flour Bakery',  sublabel: 'Cerca del parque',   emoji: '🥐', x: 210, y: 320, color: '#7a5530' },
]

// Boston Common trees (same coords as before)
const TREES: [number,number,number,number,boolean][] = [
  [38,58,9,0,true],[60,54,8,2,false],[85,52,10,1,true],[112,52,8,3,false],[140,54,9,0,true],
  [210,52,9,2,true],[240,52,8,0,false],[270,54,10,1,true],[302,56,8,3,false],[328,60,9,2,true],
  [28,96,9,1,false],[26,135,8,3,true],[30,175,10,0,false],[26,218,8,2,true],
  [28,262,9,1,false],[26,302,8,3,true],[30,348,10,0,false],[26,390,8,2,true],
  [115,130,9,0,true],[136,114,8,2,false],[158,108,11,1,true],[182,105,8,3,false],
  [208,108,10,0,true],[228,120,8,2,false],[244,138,9,1,true],[243,162,8,3,false],
  [238,186,10,0,true],[218,200,8,2,false],[198,206,9,1,true],[172,202,8,3,false],
  [148,192,10,0,true],[128,172,8,2,false],[114,150,9,1,true],
  [58,115,9,3,false],[80,106,8,1,true],[72,148,10,2,false],[52,185,8,0,true],[70,215,9,3,false],
  [160,250,8,0,true],[182,268,9,2,false],[212,255,8,1,true],
  [240,238,9,3,false],[262,218,8,0,true],[278,252,9,2,false],
  [148,302,8,1,true],[165,328,9,3,false],[194,316,8,0,true],
  [220,300,9,2,false],[248,285,8,1,true],[270,312,9,3,false],
  [65,360,9,0,false],[88,380,8,2,true],[110,365,10,1,false],[132,388,8,3,true],[155,372,9,0,false],
  [352,100,8,1,true],[360,138,9,3,false],[356,172,8,0,true],
  [360,208,9,2,false],[352,248,8,1,true],[358,282,9,3,false],
  [350,318,8,0,true],[356,354,9,2,false],[344,392,8,1,true],
  [52,450,8,2,false],[90,454,9,0,true],[132,452,8,3,false],[172,454,9,1,true],
  [212,452,8,2,false],[248,450,9,0,true],[278,452,8,3,false],
  [188,368,9,1,true],[205,388,8,3,false],[222,370,9,0,true],
  [245,355,8,2,false],[265,372,9,1,true],[288,352,8,3,false],[308,375,9,0,true],
]

// Public Garden trees
const GARDEN_TREES: [number,number,number,number,boolean][] = [
  // Beacon Mall (top)
  [-138,58,9,0,false],[-118,54,8,2,true],[-98,52,10,1,false],[-78,54,8,3,true],
  [-58,52,9,0,false],[-38,54,8,2,true],[-18,54,9,1,false],[2,58,8,3,true],
  // Arlington St (left)
  [-140,100,8,1,false],[-138,142,9,3,true],[-140,185,8,0,false],[-138,232,9,2,true],
  [-140,300,8,1,false],[-138,348,9,3,true],[-140,395,8,0,false],[-138,440,9,2,true],
  // Charles side (right edge of garden)
  [6,100,8,2,false],[8,145,9,0,true],[6,188,8,3,false],
  [6,310,8,2,false],[8,358,9,0,true],[6,402,8,3,false],[8,444,9,2,true],
  // Boylston (bottom)
  [-130,452,8,3,false],[-108,456,9,1,true],[-86,454,8,0,false],
  [-62,456,9,2,true],[-38,454,8,3,false],[-14,452,9,1,true],
  // Ring around lagoon (outside the water)
  [-114,212,8,0,true],[-96,200,9,2,false],[-75,196,10,1,true],[-52,195,8,3,false],
  [-30,200,9,0,true],[-14,216,8,2,false],[-10,240,9,1,true],[-10,268,8,3,false],
  [-18,290,9,0,true],[-36,305,8,2,false],[-60,310,10,1,true],[-82,304,8,3,false],
  [-102,288,9,0,true],[-116,265,8,2,false],[-116,238,9,1,true],
  // Scattered interior
  [-125,155,8,3,false],[-105,148,9,1,true],[-28,150,8,0,false],[-8,155,9,2,true],
  [-128,335,8,3,false],[-108,342,9,1,true],[-22,332,8,0,false],[-4,340,9,2,true],
]

const TREE_COLORS = ['#3d7828','#4a8c32','#568a3c','#3a6e24']

// Public Garden flowers: [x, y, petalColor]
const GARDEN_FLOWERS: [number,number,string][] = [
  // North arc above lagoon
  [-104,185,'#f070b8'],[-92,178,'#e85898'],[-78,175,'#d868b0'],
  [-64,174,'#f880c8'],[-50,176,'#e060a0'],[-36,180,'#f498c8'],[-24,186,'#d868a8'],
  // South arc below lagoon
  [-90,311,'#f8d040'],[-72,316,'#f0c030'],[-54,314,'#f8c840'],[-36,316,'#e8b828'],[-18,312,'#f8d040'],
  // Left of lagoon
  [-122,230,'#9060d8'],[-124,254,'#7850c0'],[-120,276,'#8870e0'],
  // Right of lagoon
  [-8,228,'#f08848'],[-6,252,'#e87830'],[-8,274,'#f0a060'],
  // Northern garden beds
  [-130,136,'#f070b8'],[-122,155,'#e85898'],[0,138,'#9060d8'],[4,158,'#7850c0'],
  // Southern garden beds
  [-130,352,'#f8d040'],[-124,370,'#f0c030'],[0,350,'#f08848'],[4,368,'#e87830'],
  // Bottom scatter
  [-120,444,'#e85898'],[-90,447,'#f8d040'],[-58,444,'#9060d8'],[-28,447,'#f08848'],
]

const PATHS: { d: string; w: number }[] = [
  { d: 'M 26 65 Q 185 60 336 74', w: 3.5 },
  { d: 'M 26 198 Q 68 184 112 172 Q 145 165 160 150', w: 2.8 },
  { d: 'M 26 398 Q 78 330 132 268 Q 168 228 188 195', w: 3.2 },
  { d: 'M 26 320 Q 112 308 188 312 Q 246 314 308 292', w: 3.0 },
  { d: 'M 192 228 Q 222 270 248 318 Q 265 358 272 402 Q 276 436 292 462', w: 2.5 },
  { d: 'M 330 74 Q 346 158 344 252 Q 340 342 316 432 Q 306 450 296 462', w: 2.5 },
  { d: 'M 196 462 Q 212 430 220 395 Q 225 360 220 325 Q 216 298 218 268', w: 2.2 },
  { d: 'M 216 358 Q 192 338 158 312', w: 2.0 },
  { d: 'M 218 350 Q 210 318 198 278', w: 2.0 },
  { d: 'M 222 358 Q 252 336 285 308', w: 2.0 },
  { d: 'M 220 368 Q 235 405 255 440', w: 2.0 },
  { d: 'M 214 368 Q 194 404 170 438', w: 2.0 },
  { d: 'M 218 368 Q 218 400 218 430', w: 2.0 },
  { d: 'M 354 74 Q 308 100 268 134 Q 245 160 238 188', w: 2.5 },
  { d: 'M 112 172 Q 130 208 126 250', w: 2.0 },
  { d: 'M 336 74 Q 340 60 354 72', w: 2.2 },
  { d: 'M 68 462 Q 135 448 194 450 Q 250 452 265 462', w: 2.0 },
  { d: 'M 190 65 Q 188 95 185 120', w: 2.0 },
]

// Public Garden paths (gentle curves)
const GARDEN_PATHS: { d: string; w: number }[] = [
  { d: 'M -142 65 Q -90 60 -14 68', w: 3.0 },
  { d: 'M -142 240 Q -118 236 -14 240', w: 2.5 },
  { d: 'M -142 400 Q -90 394 -14 400', w: 2.5 },
  { d: 'M -80 34 Q -76 100 -74 190', w: 2.2 },
  { d: 'M -50 310 Q -52 370 -50 460', w: 2.2 },
  { d: 'M -110 310 Q -108 370 -106 460', w: 2.0 },
  { d: 'M -20 310 Q -18 370 -16 460', w: 2.0 },
]

type Stage = 'gate' | 'map'
type Props = { dayNumber: number; title: string; notes: string[]; alreadyOpened: boolean; isPreview?: boolean }

export function BostonCommonReveal({ dayNumber, title, notes, alreadyOpened, isPreview = false }: Props) {
  const [stage,     setStage]     = useState<Stage>(alreadyOpened && !isPreview ? 'map' : 'gate')
  const [input,     setInput]     = useState('')
  const [error,     setError]     = useState(false)
  const [opening,   setOpening]   = useState(false)
  const [activePin, setActivePin] = useState<number | null>(null)
  const markedRef = useRef(alreadyOpened)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toUpperCase() !== PASSWORD) {
      setError(true); setTimeout(() => setError(false), 800); return
    }
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setStage('map'), 500)
  }

  // ── Password gate ─────────────────────────────────────────────────────────────
  if (stage === 'gate') return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: '#faf8f5', position: 'relative' }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      <a href="/home" style={{ position: 'absolute', top: 16, left: 16, color: '#b08060', fontSize: 12, textDecoration: 'none', opacity: 0.7 }}>← Calendario</a>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
        <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 4px' }}>Día {dayNumber}</p>
        <h1 style={{ color: '#2d2d2d', fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>{title}</h1>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>Ingresa la contraseña que ganaste en el Día 9.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Tu contraseña…" autoComplete="off" autoCapitalize="characters"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14, boxSizing: 'border-box',
              border: `2px solid ${error ? '#e05050' : '#d0c8be'}`,
              background: 'white', fontSize: 17, fontWeight: 700, textAlign: 'center',
              letterSpacing: '0.04em', outline: 'none', color: '#1a1a1a',
              transition: 'border-color 0.2s', animation: error ? 'shake 0.4s ease' : undefined,
            }}
          />
          {error && <p style={{ color: '#e05050', fontSize: 12, marginTop: 8 }}>Contraseña incorrecta. Revisa el Día 9.</p>}
          <button type="submit" disabled={opening} style={{
            marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 14,
            background: opening ? '#d0c8be' : 'linear-gradient(135deg, #c8a888, #a07848)',
            border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
            cursor: opening ? 'default' : 'pointer', transition: 'all 0.2s',
          }}>{opening ? 'Abriendo…' : 'Entrar →'}</button>
        </form>
      </div>
    </div>
  )

  // ── Map ────────────────────────────────────────────────────────────────────────
  const active = activePin !== null ? PINS[activePin] : null

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: '#f2ede0' }}>
      <style>{`
        @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes pop-pin  { 0%{opacity:0;transform:scale(0)}55%{transform:scale(1.18)}100%{opacity:1;transform:scale(1)} }
        .bc-pin { transition: filter 0.18s ease; transform-box: fill-box; transform-origin: center bottom; }
        .bc-pin:hover { filter: brightness(1.12) drop-shadow(0 4px 8px rgba(0,0,0,0.28)) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', borderBottom: '1px solid #ddd5c0', gap: 12, background: '#f7f2e5' }}>
        <a href="/home" style={{ color: '#8a6a40', fontSize: 12, textDecoration: 'none', opacity: 0.75, whiteSpace: 'nowrap' }}>← Calendario</a>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ color: '#2d2820', fontSize: 17, fontWeight: 800, margin: 0 }}>{title}</h1>
          <p style={{ color: '#9a7a50', fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>Toca los pines para ver tus notas</p>
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Map container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 12px 28px' }}>
        <div style={{ width: '100%', maxWidth: 460, borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 48px rgba(80,60,20,0.22)', border: '1px solid #bfad88' }}>

          {/* viewBox: -150 0 550 500 — Public Garden on left, Boston Common on right */}
          <svg viewBox="-150 0 550 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <defs>
              <filter id="bc-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" seed="12" result="n"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.91  0 0 0 0 0.86  0 0 0 0 0.74  0 0 0 0.22 0" in="n" result="c"/>
                <feBlend in="SourceGraphic" in2="c" mode="multiply"/>
              </filter>
              <radialGradient id="bc-grass" cx="42%" cy="40%" r="65%">
                <stop offset="0%"   stopColor="#9ec865"/>
                <stop offset="45%"  stopColor="#7ab848"/>
                <stop offset="100%" stopColor="#5a9030"/>
              </radialGradient>
              <radialGradient id="bc-garden-grass" cx="50%" cy="45%" r="60%">
                <stop offset="0%"   stopColor="#a8d070"/>
                <stop offset="50%"  stopColor="#88c050"/>
                <stop offset="100%" stopColor="#68a038"/>
              </radialGradient>
              <radialGradient id="bc-pond" cx="38%" cy="36%" r="62%">
                <stop offset="0%"   stopColor="#a8d8ee"/>
                <stop offset="60%"  stopColor="#68b4d0"/>
                <stop offset="100%" stopColor="#4090b0"/>
              </radialGradient>
              <radialGradient id="bc-garden-pond" cx="40%" cy="38%" r="58%">
                <stop offset="0%"   stopColor="#b8e0f5"/>
                <stop offset="55%"  stopColor="#78c8e8"/>
                <stop offset="100%" stopColor="#4aa8d0"/>
              </radialGradient>
              {/* Boston Common clip */}
              <clipPath id="bc-clip">
                <polygon points="22,38 338,30 355,44 388,90 298,462 22,462"/>
              </clipPath>
              {/* Public Garden clip */}
              <clipPath id="bc-garden-clip">
                <polygon points="-142,38 12,32 12,460 -142,460"/>
              </clipPath>
            </defs>

            {/* ── STREET BACKGROUND ──────────────────────────────────────── */}
            <rect x="-150" y="0" width="550" height="500" fill="#d8cdb0" filter="url(#bc-noise)"/>

            {/* Street bands */}
            <rect x="-150" y="0"   width="550" height="26" fill="rgba(178,165,138,0.65)"/>
            <rect x="-150" y="474" width="550" height="26" fill="rgba(178,165,138,0.65)"/>
            <rect x="-150" y="0"   width="20"  height="500" fill="rgba(178,165,138,0.65)"/>
            <rect x="380"  y="0"   width="20"  height="500" fill="rgba(178,165,138,0.65)"/>

            {/* Decorative border */}
            <rect x="-148" y="2" width="546" height="496" rx="15" fill="none" stroke="#b0986a" strokeWidth="2"/>
            <rect x="-145" y="5" width="540" height="490" rx="12" fill="none" stroke="#b0986a" strokeWidth="0.6" strokeDasharray="3,2" opacity="0.55"/>

            {/* Street labels — centered in full 550 width, center = -150+275 = 125 */}
            <text x="125" y="17"  textAnchor="middle" fill="#7a6840" fontSize="8.5" fontStyle="italic" letterSpacing="1.8">BEACON STREET</text>
            <text x="125" y="489" textAnchor="middle" fill="#7a6840" fontSize="8.5" fontStyle="italic" letterSpacing="1.8">BOYLSTON STREET</text>
            <text x="-139" y="250" textAnchor="middle" fill="#7a6840" fontSize="7.5" fontStyle="italic" transform="rotate(-90 -139 250)" letterSpacing="1">ARLINGTON ST</text>
            <text x="390"  y="280" textAnchor="middle" fill="#7a6840" fontSize="8"   fontStyle="italic" transform="rotate(90 390 280)" letterSpacing="1">TREMONT STREET</text>
            <text x="370"  y="45"  textAnchor="middle" fill="#7a6840" fontSize="6.5" fontStyle="italic" transform="rotate(38 370 45)">Park St</text>
            {/* Charles St between the parks */}
            <text x="16" y="250" textAnchor="middle" fill="#9a8a68" fontSize="5.5" fontStyle="italic" transform="rotate(-90 16 250)" letterSpacing="0.5">Charles St</text>

            {/* ── PUBLIC GARDEN ──────────────────────────────────────────── */}
            <g clipPath="url(#bc-garden-clip)">
              {/* Base grass */}
              <polygon points="-142,38 12,32 12,460 -142,460" fill="url(#bc-garden-grass)"/>

              {/* Open lawn areas */}
              <ellipse cx="-72" cy="148" rx="48" ry="38" fill="#c0e080" opacity="0.3"/>
              <ellipse cx="-70" cy="385" rx="52" ry="42" fill="#b8d870" opacity="0.32"/>

              {/* Garden label */}
              <text x="-65" y="96" textAnchor="middle" fill="#2d5820" fontSize="8" fontStyle="italic" letterSpacing="0.4" opacity="0.72">Public Garden</text>

              {/* Garden paths */}
              {GARDEN_PATHS.map((p, i) => (
                <path key={i} d={p.d} stroke="#c4a840" strokeWidth={p.w} fill="none" strokeLinecap="round" opacity="0.55"/>
              ))}
              {GARDEN_PATHS.map((p, i) => (
                <path key={`gs${i}`} d={p.d} stroke="rgba(70,45,8,0.1)" strokeWidth={p.w + 2} fill="none" strokeLinecap="round"/>
              ))}

              {/* ── LAGOON ───────────────────────────────────────────────── */}
              {/* Lagoon base */}
              <path
                d="M -108 252 Q -104 218 -82 206 Q -60 194 -36 208 Q -16 220 -14 248 Q -12 275 -30 290 Q -52 302 -76 290 Q -100 276 -108 252 Z"
                fill="url(#bc-garden-pond)" stroke="#3880a8" strokeWidth="1.2"
              />
              {/* Inner shimmer */}
              <ellipse cx="-64" cy="242" rx="30" ry="17" fill="rgba(210,242,255,0.42)"/>
              {/* Shimmer lines */}
              <path d="M -90 258 Q -65 254 -40 258" stroke="rgba(255,255,255,0.48)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M -80 270 Q -58 266 -35 270" stroke="rgba(255,255,255,0.3)"  strokeWidth="1"   fill="none" strokeLinecap="round"/>
              {/* Depth */}
              <ellipse cx="-58" cy="258" rx="22" ry="13" fill="rgba(20,80,120,0.14)"/>

              {/* ── BRIDGE ───────────────────────────────────────────────── */}
              {/* Arch shadow visible from above */}
              <path d="M -106 231 Q -60 220 -14 231" stroke="rgba(70,45,10,0.18)" strokeWidth="10" fill="none" strokeLinecap="round"/>
              {/* Stone abutments on each shore */}
              <rect x="-115" y="223" width="11" height="16" rx="2" fill="#a88850" stroke="#8a6830" strokeWidth="0.8"/>
              <rect x="-10"  y="223" width="11" height="16" rx="2" fill="#a88850" stroke="#8a6830" strokeWidth="0.8"/>
              {/* Bridge deck */}
              <rect x="-104" y="225" width="90" height="11" fill="#c8a860" rx="1.5"/>
              {/* Deck center seam */}
              <line x1="-104" y1="230.5" x2="-14" y2="230.5" stroke="#a88840" strokeWidth="0.8" opacity="0.45"/>
              {/* Top railing */}
              <line x1="-116" y1="225" x2="-9" y2="225" stroke="#4e3412" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Bottom railing */}
              <line x1="-116" y1="236" x2="-9" y2="236" stroke="#4e3412" strokeWidth="2.2" strokeLinecap="round"/>
              {/* Baluster posts */}
              {Array.from({length:13},(_,i)=>{
                const bx = -113 + i * (104/12)
                return <line key={i} x1={bx} y1="225" x2={bx} y2="236" stroke="#5a3e18" strokeWidth="1.2" opacity="0.7"/>
              })}
              {/* Corner pillar caps */}
              <circle cx="-116" cy="225" r="2.8" fill="#6a4820"/>
              <circle cx="-116" cy="236" r="2.8" fill="#6a4820"/>
              <circle cx="-9"   cy="225" r="2.8" fill="#6a4820"/>
              <circle cx="-9"   cy="236" r="2.8" fill="#6a4820"/>
              {/* Deck highlight (top lit edge) */}
              <line x1="-104" y1="225.5" x2="-14" y2="225.5" stroke="rgba(255,240,200,0.5)" strokeWidth="1"/>

              {/* Swan boat — iconic Public Garden feature */}
              <g>
                {/* Body */}
                <ellipse cx="-66" cy="264" rx="22" ry="9" fill="rgba(255,255,255,0.92)" stroke="rgba(200,225,245,0.55)" strokeWidth="0.8"/>
                {/* Neck */}
                <path d="M -48 258 Q -40 244 -42 236" stroke="rgba(255,255,255,0.92)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                {/* Head */}
                <circle cx="-43" cy="234" r="5.5" fill="rgba(255,255,255,0.94)"/>
                {/* Beak */}
                <path d="M -38 234 L -33 236" stroke="#e8a840" strokeWidth="2" strokeLinecap="round"/>
                {/* Eye */}
                <circle cx="-45" cy="232" r="1.2" fill="#3a3028"/>
                {/* Water ripple */}
                <ellipse cx="-66" cy="267" rx="26" ry="4.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1"/>
              </g>

              {/* Ducks in lagoon */}
              <g transform="translate(-35, 248)" opacity="0.72">
                <ellipse cx="0" cy="0" rx="7" ry="4" fill="white"/>
                <circle cx="5" cy="-2" r="3.5" fill="white"/>
                <path d="M 7 -2 L 10 -1" stroke="#e0a040" strokeWidth="1.5" strokeLinecap="round"/>
              </g>
              <g transform="translate(-88, 240)" opacity="0.62">
                <ellipse cx="0" cy="0" rx="5.5" ry="3.5" fill="white"/>
                <circle cx="4" cy="-1.5" r="3" fill="white"/>
                <path d="M 6 -1.5 L 8.5 -0.5" stroke="#e0a040" strokeWidth="1.2" strokeLinecap="round"/>
              </g>

              {/* ── DOCK / MUELLE ───────────────────────────────────────── */}
              {/* Two piles going into the water */}
              <line x1="-56" y1="272" x2="-56" y2="296" stroke="#5a3818" strokeWidth="2.8" strokeLinecap="round" opacity="0.82"/>
              <line x1="-48" y1="272" x2="-48" y2="296" stroke="#5a3818" strokeWidth="2.8" strokeLinecap="round" opacity="0.82"/>
              {/* Gangway from shore — narrows as it approaches dock */}
              <path d="M -60 299 L -44 299 L -46 278 L -58 278 Z" fill="#c09458" opacity="0.88"/>
              {/* Dock deck planks */}
              <line x1="-58" y1="282" x2="-46" y2="282" stroke="#7a5028" strokeWidth="1.1" opacity="0.6"/>
              <line x1="-58" y1="286" x2="-46" y2="286" stroke="#7a5028" strokeWidth="1.1" opacity="0.6"/>
              <line x1="-58" y1="290" x2="-46" y2="290" stroke="#7a5028" strokeWidth="1.1" opacity="0.6"/>
              <line x1="-59" y1="294" x2="-45" y2="294" stroke="#7a5028" strokeWidth="1.1" opacity="0.6"/>
              {/* Dock highlight (top edge of planks) */}
              <line x1="-58" y1="278" x2="-46" y2="278" stroke="#d8ae78" strokeWidth="1.2" opacity="0.7"/>
              {/* Side rails */}
              <line x1="-60" y1="278" x2="-60" y2="299" stroke="#6a4020" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="-44" y1="278" x2="-44" y2="299" stroke="#6a4020" strokeWidth="1.6" strokeLinecap="round"/>
              {/* End post caps */}
              <circle cx="-60" cy="278" r="2.2" fill="#5a3818"/>
              <circle cx="-44" cy="278" r="2.2" fill="#5a3818"/>
              {/* Water shadow beneath dock */}
              <rect x="-58" y="278" width="12" height="10" fill="rgba(20,70,115,0.18)" rx="1"/>
              {/* Mooring rope hint */}
              <path d="M -52 278 Q -58 272 -62 268" stroke="#8a6838" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="2,2" opacity="0.6"/>

              {/* ── FLOWERS ──────────────────────────────────────────────── */}
              {GARDEN_FLOWERS.map(([fx, fy, fc], i) => (
                <g key={i}>
                  <circle cx={fx}   cy={fy - 3.2} r="2.8" fill={fc} opacity="0.84"/>
                  <circle cx={fx + 3.2} cy={fy + 1.5}  r="2.8" fill={fc} opacity="0.84"/>
                  <circle cx={fx - 3.2} cy={fy + 1.5}  r="2.8" fill={fc} opacity="0.84"/>
                  <circle cx={fx}   cy={fy}       r="2"   fill="#f8e840" opacity="0.96"/>
                </g>
              ))}

              {/* ── GARDEN TREES ─────────────────────────────────────────── */}
              {GARDEN_TREES.map(([x, y, r, ci, buddy], i) => (
                <g key={i}>
                  <ellipse cx={x + 2.5} cy={y + 3} rx={r * 0.88} ry={r * 0.42} fill="rgba(0,0,0,0.10)"/>
                  <circle cx={x} cy={y} r={r} fill={TREE_COLORS[ci]}/>
                  {buddy && <circle cx={x + r * 0.6} cy={y - r * 0.28} r={r * 0.68} fill={TREE_COLORS[(ci + 1) % 4]}/>}
                  <circle cx={x - r * 0.32} cy={y - r * 0.38} r={r * 0.36} fill="rgba(255,255,255,0.14)"/>
                </g>
              ))}
            </g>

            {/* ── BOSTON COMMON ─────────────────────────────────────────── */}
            <g clipPath="url(#bc-clip)">
              <polygon points="22,38 338,30 355,44 388,90 298,462 22,462" fill="url(#bc-grass)"/>

              {/* Open meadow zones */}
              <ellipse cx="98"  cy="172" rx="72" ry="70" fill="#b4d878" opacity="0.38"/>
              <ellipse cx="172" cy="310" rx="78" ry="68" fill="#a8d070" opacity="0.32"/>
              <ellipse cx="105" cy="400" rx="58" ry="50" fill="#b8d878" opacity="0.35"/>
              <ellipse cx="88"  cy="408" rx="28" ry="22" fill="#c8b070" opacity="0.35"/>

              {/* Paths */}
              {PATHS.map((p, i) => (
                <path key={i} d={p.d} stroke="#c8a848" strokeWidth={p.w} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              ))}
              {PATHS.map((p, i) => (
                <path key={`sh${i}`} d={p.d} stroke="rgba(80,55,10,0.12)" strokeWidth={p.w + 2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              ))}

              {/* Parkman Bandstand */}
              <circle cx="218" cy="358" r="16" fill="none" stroke="#c8a848" strokeWidth="1.8" opacity="0.5"/>
              <circle cx="218" cy="358" r="5"  fill="#c8a848" opacity="0.38"/>

              {/* Frog Pond */}
              <path
                d="M 120 155 Q 126 126 150 118 Q 172 110 198 113 Q 224 116 240 132 Q 252 148 248 168 Q 244 188 228 198 Q 208 210 185 212 Q 160 214 140 200 Q 122 188 116 170 Q 110 156 120 155 Z"
                fill="url(#bc-pond)" stroke="#3880a0" strokeWidth="1.2"
              />
              <ellipse cx="178" cy="152" rx="32" ry="18" fill="rgba(210,240,255,0.38)"/>
              <path d="M 145 162 Q 168 158 190 162" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M 158 174 Q 182 170 205 174" stroke="rgba(255,255,255,0.3)"  strokeWidth="1"   fill="none" strokeLinecap="round"/>
              <ellipse cx="195" cy="168" rx="18" ry="11" fill="rgba(30,90,120,0.18)"/>
              <text x="182" y="166" textAnchor="middle" fill="#1a5878" fontSize="7.5" fontStyle="italic" letterSpacing="0.4" opacity="0.85">Frog Pond</text>

              {/* Dock */}
              <path d="M 184 210 Q 183 222 186 230 Q 190 238 188 245 Q 185 250 181 244 Q 178 236 180 226 Q 181 216 184 210 Z" fill="#5a98b8" opacity="0.5"/>
              <rect x="179" y="221" width="14" height="7" rx="1.5" fill="#7a5535" opacity="0.85"/>
              <line x1="180" y1="218" x2="180" y2="228" stroke="#4e3018" strokeWidth="1.8" opacity="0.8"/>
              <line x1="193" y1="218" x2="193" y2="228" stroke="#4e3018" strokeWidth="1.8" opacity="0.8"/>

              {/* Small sailboat on Frog Pond */}
              <g transform="translate(158,150)">
                <path d="M -9 5 Q 0 9 9 5" stroke="#4e3018" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <line x1="0" y1="5" x2="0" y2="-9" stroke="#4e3018" strokeWidth="1" opacity="0.8"/>
                <path d="M 0 -9 L 0 5 L -7 0 Z" fill="rgba(248,240,220,0.9)" stroke="#c8a060" strokeWidth="0.5"/>
              </g>

              {/* Ducks on Frog Pond */}
              <g transform="translate(205,145)" opacity="0.75">
                <ellipse cx="0" cy="0" rx="7" ry="4" fill="white"/>
                <circle cx="5.5" cy="-2" r="3.5" fill="white"/>
                <path d="M 7.5 -2 L 10.5 -0.5" stroke="#e0a040" strokeWidth="1.5" strokeLinecap="round"/>
              </g>

              {/* Boston Common trees */}
              {TREES.map(([x, y, r, ci, buddy], i) => (
                <g key={i}>
                  <ellipse cx={x + 2.5} cy={y + 3} rx={r * 0.88} ry={r * 0.42} fill="rgba(0,0,0,0.12)"/>
                  <circle cx={x} cy={y} r={r} fill={TREE_COLORS[ci]}/>
                  {buddy && <circle cx={x + r * 0.6} cy={y - r * 0.28} r={r * 0.68} fill={TREE_COLORS[(ci + 1) % 4]}/>}
                  <circle cx={x - r * 0.32} cy={y - r * 0.38} r={r * 0.36} fill="rgba(255,255,255,0.13)"/>
                </g>
              ))}

              {/* Flower dots in meadow */}
              {[[80,228],[95,245],[65,240],[75,262],[108,238]].map(([fx,fy],i) => (
                <g key={i}>
                  <circle cx={fx} cy={fy} r="3" fill="#f0d060" opacity="0.55"/>
                  <circle cx={fx} cy={fy} r="1.2" fill="#e08030" opacity="0.7"/>
                </g>
              ))}

              {/* Soldiers & Sailors Monument */}
              <g transform="translate(145,255)" opacity="0.38">
                <circle cx="0" cy="0" r="6" fill="none" stroke="#7a6838" strokeWidth="1.2"/>
                <line x1="-4" y1="0" x2="4" y2="0" stroke="#7a6838" strokeWidth="1"/>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#7a6838" strokeWidth="1"/>
              </g>
            </g>

            {/* ── ABOVE CLIP ─────────────────────────────────────────────── */}
            {/* Park Street T station */}
            <g transform="translate(370,82)">
              <circle cx="0" cy="0" r="9" fill="#1a5aa8" opacity="0.88"/>
              <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">T</text>
            </g>

            {/* Compass rose */}
            <g transform="translate(354,448)">
              <circle cx="0" cy="0" r="16" fill="rgba(245,238,220,0.9)" stroke="#b0986a" strokeWidth="1.2"/>
              <path d="M 0 -10 L 2.5 -2 L 0 0 L -2.5 -2 Z" fill="#8a6030"/>
              <path d="M 0 10 L 2.5 2 L 0 0 L -2.5 2 Z" fill="#c8b888" opacity="0.6"/>
              <text x="0" y="-11" textAnchor="middle" fill="#5a4020" fontSize="6.5" fontWeight="bold" dominantBaseline="auto">N</text>
              <text x="0"  y="17" textAnchor="middle" fill="#5a4020" fontSize="5.5">S</text>
              <text x="-11" y="3" textAnchor="middle" fill="#5a4020" fontSize="5.5">O</text>
              <text x="11"  y="3" textAnchor="middle" fill="#5a4020" fontSize="5.5">E</text>
            </g>

            {/* ── MEMORY PINS ──────────────────────────────────────────── */}
            {PINS.map((pin, i) => (
              <g
                key={pin.id}
                className="bc-pin"
                onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                style={{
                  cursor: 'pointer',
                  filter: activePin === pin.id
                    ? `drop-shadow(0 0 7px ${pin.color}88)`
                    : 'drop-shadow(0 2px 4px rgba(0,0,0,0.22))',
                  animation: `pop-pin 0.55s ${i * 0.1}s ease both`,
                }}
              >
                <ellipse cx={pin.x} cy={pin.y + 21} rx="6" ry="2.8" fill="rgba(0,0,0,0.18)"/>
                <circle cx={pin.x} cy={pin.y - 8} r="12" fill={pin.color} stroke="rgba(255,255,255,0.32)" strokeWidth="1.8"/>
                <polygon
                  points={`${pin.x},${pin.y + 16} ${pin.x - 7},${pin.y + 4} ${pin.x + 7},${pin.y + 4}`}
                  fill={pin.color}
                />
                <circle cx={pin.x - 3.5} cy={pin.y - 12} r="3.8" fill="rgba(255,255,255,0.25)"/>
                <text x={pin.x} y={pin.y - 5} textAnchor="middle" dominantBaseline="middle" fontSize="10">
                  {pin.emoji}
                </text>
                <text
                  x={pin.x} y={pin.y + 30}
                  textAnchor="middle" fontSize="7"
                  fill={pin.color} fontWeight="bold" fontStyle="italic"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.9))' }}
                >
                  {pin.id === 0 ? 'Banco' : pin.id === 1 ? 'Muelle' : 'Flour'}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Active pin bottom sheet */}
      {active && (
        <>
          <div onClick={() => setActivePin(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 10, animation: 'fade-in 0.2s ease' }}/>
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
            background: '#f9f4ea', borderRadius: '22px 22px 0 0',
            padding: '8px 24px 44px',
            boxShadow: '0 -6px 40px rgba(60,40,10,0.16)',
            animation: 'slide-up 0.3s ease',
          }}>
            <div style={{ width: 40, height: 4, background: '#ddd0b8', borderRadius: 2, margin: '12px auto 20px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: active.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
              }}>
                {active.emoji}
              </div>
              <div>
                <h2 style={{ color: '#2d2820', fontSize: 19, fontWeight: 800, margin: 0 }}>{active.label}</h2>
                <p style={{ color: '#9a7a50', fontSize: 12, margin: '3px 0 0' }}>{active.sublabel}</p>
              </div>
            </div>
            <div style={{ borderLeft: `3px solid ${active.color}`, paddingLeft: 14 }}>
              {notes[active.id] ? (
                <p style={{ color: '#5a4a3a', fontSize: 15, lineHeight: 1.85, margin: 0, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>"{notes[active.id]}"</p>
              ) : (
                <p style={{ color: '#c0a888', fontSize: 14, margin: 0, fontStyle: 'italic' }}>(Nota por agregar…)</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
