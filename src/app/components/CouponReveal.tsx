'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Coupon = { title: string; description: string }
type Props  = { dayNumber: number; title: string; alreadyOpened: boolean; coupons: Coupon[] }

const STRIPE_COLORS = ['#c43052', '#7c6bbd', '#4a9d76', '#d4813a', '#4a8cb5']
const PLACEHOLDER_TITLES = [
  'Cupón de masaje',
  'Cena especial',
  'Noche de películas',
  'Desayuno en cama',
  'Lo que tú quieras',
]

export function CouponReveal({ dayNumber, title, alreadyOpened, coupons }: Props) {
  const [opened,  setOpened]  = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 500)
  }

  // ── Sealed ──────────────────────────────────────────────────────────────────
  if (!opened) return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf6f0', padding: '0 24px' }}>
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
        <div style={{ fontSize: 80 }}>🎟️</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c43052', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px', fontWeight: 600 }}>Día {dayNumber}</p>
          <h1 style={{ color: '#1a1a1a', fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>{title}</h1>
          <p style={{ color: '#a09080', fontSize: 14, margin: 0 }}>Toca para abrir tus cupones</p>
        </div>
      </button>
    </div>
  )

  // ── Revealed ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100svh', background: '#faf6f0' }}>
      <style>{`
        @keyframes coupon-drop { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #ede5d8', background: '#fff8f2', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/home" style={{ color: '#c07050', fontSize: 12, textDecoration: 'none', opacity: 0.7 }}>← Calendario</a>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ color: '#1a1a1a', fontSize: 17, fontWeight: 800, margin: 0 }}>{title}</h1>
          <p style={{ color: '#b08060', fontSize: 11, margin: '2px 0 0', fontStyle: 'italic' }}>5 cupones · úsalos cuando quieras</p>
        </div>
        <div style={{ width: 60 }}/>
      </div>

      {/* Coupons list */}
      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        {Array.from({ length: 5 }, (_, i) => {
          const coupon      = coupons[i]
          const couponTitle = coupon?.title       || PLACEHOLDER_TITLES[i]
          const couponDesc  = coupon?.description || ''
          const color       = STRIPE_COLORS[i]

          return (
            <div
              key={i}
              style={{
                width: '100%', maxWidth: 320,
                borderRadius: 16,
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                border: `2px dashed ${color}55`,
                overflow: 'visible',
                position: 'relative',
                animation: `coupon-drop 0.45s ${i * 0.12}s ease both`,
                opacity: 0,
              }}
            >
              {/* Colored header band */}
              <div style={{
                background: color,
                borderRadius: '13px 13px 0 0',
                padding: '10px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                  Cupón {i + 1}
                </p>
                <span style={{ fontSize: 16, opacity: 0.9 }}>🎟️</span>
              </div>

              {/* Main content */}
              <div style={{ padding: '16px 20px 14px' }}>
                <h2 style={{ color: '#1a1a1a', fontSize: 16, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.35, textAlign: 'center' }}>
                  {couponTitle}
                </h2>
                {couponDesc ? (
                  <p style={{ color: '#6a5a4a', fontSize: 13, lineHeight: 1.7, margin: 0, textAlign: 'center' }}>{couponDesc}</p>
                ) : null}
              </div>

              {/* Perforated divider with notches */}
              <div style={{ position: 'relative', height: 0, margin: '0 0 0 0' }}>
                <div style={{ borderTop: `2px dashed ${color}55`, margin: '0 0' }}/>
                {/* Left notch */}
                <div style={{
                  position: 'absolute', left: -10, top: -8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#faf6f0', border: `2px dashed ${color}55`,
                }}/>
                {/* Right notch */}
                <div style={{
                  position: 'absolute', right: -10, top: -8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#faf6f0', border: `2px dashed ${color}55`,
                }}/>
              </div>

              {/* Stub */}
              <div style={{
                padding: '10px 20px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRadius: '0 0 13px 13px',
              }}>
                <span style={{ fontSize: 14 }}>❤️</span>
                <p style={{ color: color, fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                  Canjear
                </p>
                <span style={{ fontSize: 14 }}>❤️</span>
              </div>
            </div>
          )
        })}

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#c0a888', fontSize: 12, fontStyle: 'italic', margin: '4px 0 0' }}>
          Con todo mi amor 💕
        </p>
      </div>
    </div>
  )
}
