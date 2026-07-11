'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const PASSWORD = 'BOSTON COMMON'

type Props = { dayNumber: number; title: string; body: string; alreadyOpened: boolean; isPreview?: boolean }

export function PasswordGateReveal({ dayNumber, title, body, alreadyOpened, isPreview = false }: Props) {
  const [input,    setInput]    = useState('')
  const [unlocked, setUnlocked] = useState(alreadyOpened && !isPreview)
  const [error,    setError]    = useState(false)
  const [opening,  setOpening]  = useState(false)
  const markedRef = useRef(alreadyOpened)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toUpperCase() !== PASSWORD) {
      setError(true); setTimeout(() => setError(false), 800); return
    }
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setUnlocked(true), 400)
  }

  // ── Unlocked ──────────────────────────────────────────────────────────────────
  if (unlocked) return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#faf8f5' }}>
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', animation: 'fade-up 0.8s ease' }}>
        <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Día {dayNumber}
        </p>
        <h1 style={{ color: '#2d2d2d', fontSize: 26, fontWeight: 800, margin: 0 }}>{title}</h1>
        <div style={{ width: 36, height: 2, background: '#c8a888', margin: '14px auto' }} />
        <p style={{ color: '#5a4a3a', fontSize: 16, lineHeight: 1.9, whiteSpace: 'pre-wrap', margin: 0 }}>{body}</p>
        <a href="/home" style={{ display: 'inline-block', marginTop: 36, color: '#b08060', fontSize: 12, textDecoration: 'underline' }}>
          ← Volver al calendario
        </a>
      </div>
    </div>
  )

  // ── Password gate ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: '#faf8f5', position: 'relative' }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); } 40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); } 80% { transform: translateX(5px); }
        }
      `}</style>
      <a href="/home" style={{ position: 'absolute', top: 16, left: 16, color: '#b08060', fontSize: 12, textDecoration: 'none', opacity: 0.7 }}>← Calendario</a>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔑</div>
        <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 4px' }}>
          Día {dayNumber}
        </p>
        <h1 style={{ color: '#2d2d2d', fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>{title}</h1>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
          Ingresa la contraseña que ganaste en el Día 9.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tu contraseña…"
            autoComplete="off"
            autoCapitalize="characters"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14, boxSizing: 'border-box',
              border: `2px solid ${error ? '#e05050' : '#d0c8be'}`,
              background: 'white', fontSize: 17, fontWeight: 700, textAlign: 'center',
              letterSpacing: '0.04em', outline: 'none', color: '#1a1a1a',
              transition: 'border-color 0.2s',
              animation: error ? 'shake 0.4s ease' : undefined,
            }}
          />
          {error && <p style={{ color: '#e05050', fontSize: 12, marginTop: 8 }}>Contraseña incorrecta. Revisa el Día 9.</p>}
          <button
            type="submit"
            disabled={opening}
            style={{
              marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 14,
              background: opening ? '#d0c8be' : 'linear-gradient(135deg, #c8a888, #a07848)',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
              cursor: opening ? 'default' : 'pointer', transition: 'all 0.2s',
            }}
          >
            {opening ? 'Abriendo…' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  )
}
