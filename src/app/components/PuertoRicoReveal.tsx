'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Props = { dayNumber: number; title: string; alreadyOpened: boolean; isPreview?: boolean }

// Simplified but recognizable Puerto Rico outline
// viewBox: "0 0 500 300" — island centered
const PR_OUTLINE = `
  M 62,92
  L 68,62  L 80,44  L 100,32  L 132,22  L 175,16
  L 225,13  L 280,14  L 330,18  L 378,26  L 418,40
  L 444,58  L 452,82  L 450,112
  L 446,142  L 432,165  L 408,180
  L 368,190  L 310,195  L 248,196
  L 185,194  L 128,188  L 88,174
  L 66,152  L 56,126  L 58,108
  Z
`.trim()

// Small islands (Vieques, Culebra, Mona)
const SMALL_ISLANDS = [
  // Vieques
  { d: 'M 464,178 L 472,170 L 492,172 L 496,182 L 484,188 L 468,186 Z', label: 'Vieques' },
  // Culebra
  { d: 'M 470,148 L 478,144 L 488,146 L 490,154 L 478,158 L 468,155 Z', label: 'Culebra' },
]

// Decorative palm trees [x, y, scale]
const PALMS: [number, number, number][] = [
  [95, 115, 1],
  [130, 85, 0.85],
  [200, 60, 0.9],
  [310, 55, 0.95],
  [390, 80, 0.85],
  [420, 130, 1],
  [380, 165, 0.8],
  [250, 175, 0.9],
  [150, 168, 0.85],
]

function Palm({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* trunk */}
      <line x1="0" y1="0" x2="-3" y2="-22" stroke="#7a5c2a" strokeWidth="2.5" strokeLinecap="round"/>
      {/* fronds */}
      {[[-28,-8],[-22,-18],[-10,-24],[6,-24],[20,-18],[24,-8]].map(([dx,dy],i) => (
        <line key={i} x1="-3" y1="-22" x2={dx} y2={dy} stroke="#3d8a3a" strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
      ))}
      {/* coconuts */}
      <circle cx="-3" cy="-22" r="3" fill="#b8860b" opacity="0.7"/>
    </g>
  )
}

export function PuertoRicoReveal({ dayNumber, title, alreadyOpened, isPreview }: Props) {
  const [opened,  setOpened]  = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 500)
  }

  // ── Sealed ───────────────────────────────────────────────────────────────────
  if (!opened) return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0a4a6e 0%, #0e7490 50%, #0891b2 100%)', padding: '0 24px' }}>
      <button
        onClick={handleOpen}
        disabled={opening}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          background: 'none', border: 'none', cursor: opening ? 'default' : 'pointer',
          transition: 'all 0.4s ease',
          transform: opening ? 'scale(1.15)' : 'scale(1)',
          opacity: opening ? 0 : 1,
        }}
      >
        <div style={{ fontSize: 80 }}>🇵🇷</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px', fontWeight: 600 }}>Día {dayNumber}</p>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 10px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>Toca para abrir</p>
        </div>
      </button>
    </div>
  )

  // ── Revealed ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100svh', background: 'linear-gradient(180deg, #0a4a6e 0%, #0e6a8a 40%, #0891b2 100%)' }}>

      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(8px)',
      }}>
        <a href="/home" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, textDecoration: 'none' }}>← Calendario</a>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '2px 0 0', letterSpacing: '0.08em' }}>🇵🇷 Puerto Rico</p>
        </div>
        <div style={{ width: 60 }}/>
      </div>

      {/* Wave decoration */}
      <div style={{ overflow: 'hidden', lineHeight: 0, marginTop: -1 }}>
        <svg viewBox="0 0 500 30" preserveAspectRatio="none" style={{ width: '100%', height: 30, display: 'block' }}>
          <path d="M0,20 Q125,0 250,15 Q375,30 500,12 L500,30 L0,30 Z" fill="rgba(255,255,255,0.08)"/>
        </svg>
      </div>

      {/* Map container */}
      <div style={{ padding: '16px 8px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Ocean + island SVG */}
        <div style={{
          width: '100%', maxWidth: 560,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          border: '2px solid rgba(255,255,255,0.15)',
        }}>
          <svg
            viewBox="0 0 520 240"
            style={{ width: '100%', display: 'block' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Ocean gradient */}
              <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a4a6e"/>
                <stop offset="100%" stopColor="#0e90b8"/>
              </linearGradient>
              {/* Island gradient */}
              <linearGradient id="island" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d8a45"/>
                <stop offset="60%" stopColor="#3aad58"/>
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.7"/>
              </linearGradient>
              {/* Glow filter */}
              <filter id="isle-glow">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#22c55e" floodOpacity="0.25"/>
              </filter>
            </defs>

            {/* Ocean background */}
            <rect width="520" height="240" fill="url(#ocean)"/>

            {/* Subtle wave lines */}
            {[40,80,120,160,200].map(y => (
              <path key={y} d={`M0,${y} Q130,${y-6} 260,${y} Q390,${y+6} 520,${y}`}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"/>
            ))}

            {/* Small islands */}
            {SMALL_ISLANDS.map((isl, i) => (
              <g key={i}>
                <path d={isl.d} fill="#3aad58" stroke="#2d8a45" strokeWidth="1" filter="url(#isle-glow)"/>
                <text x={parseInt(isl.d.split('M ')[1].split(',')[0]) + 8}
                      y={parseInt(isl.d.split(',')[1].split(' ')[0]) - 4}
                      fontSize="7" fill="rgba(255,255,255,0.65)" fontFamily="sans-serif">{isl.label}</text>
              </g>
            ))}

            {/* Main island outline */}
            <path
              d={PR_OUTLINE}
              fill="url(#island)"
              stroke="#1f6b33"
              strokeWidth="1.5"
              filter="url(#isle-glow)"
            />

            {/* Coastal highlight */}
            <path
              d={PR_OUTLINE}
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
            />

            {/* Palm trees on island */}
            {PALMS.map(([x, y, s], i) => <Palm key={i} x={x} y={y} scale={s}/>)}

            {/* Caribbean Sea label */}
            <text x="255" y="228" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)"
              fontFamily="Georgia, serif" fontStyle="italic" letterSpacing="1">Mar Caribe</text>

            {/* Atlantic label */}
            <text x="255" y="14" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)"
              fontFamily="Georgia, serif" fontStyle="italic" letterSpacing="1">Océano Atlántico</text>

            {/* Compass rose */}
            <g transform="translate(480,28)">
              <circle r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
              <text textAnchor="middle" y="-15" fontSize="7" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif" fontWeight="bold">N</text>
              <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
              <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8"/>
              <polygon points="0,-10 -2.5,-4 0,-6 2.5,-4" fill="rgba(255,255,255,0.7)"/>
            </g>

            {/* San Juan label */}
            <g>
              <circle cx="178" cy="33" r="3.5" fill="#f59e0b" stroke="white" strokeWidth="1"/>
              <text x="185" y="30" fontSize="8.5" fill="white" fontFamily="sans-serif" fontWeight="600">San Juan</text>
            </g>
          </svg>
        </div>

        {/* Flag strip */}
        <div style={{ marginTop: 24, display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', width: '100%', maxWidth: 320, height: 12 }}>
          {['#002868','#002868','#bf0a30','#002868','#bf0a30'].map((c,i) => (
            <div key={i} style={{ flex: 1, background: c }}/>
          ))}
        </div>

        {/* Footer */}
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontStyle: 'italic', marginTop: 20, textAlign: 'center', letterSpacing: '0.04em' }}>
          La isla del encanto 🌺
        </p>
      </div>
    </div>
  )
}
