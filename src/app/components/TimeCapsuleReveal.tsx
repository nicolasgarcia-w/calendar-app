'use client'
import { useState, useRef, useEffect } from 'react'
import { markOpenedAction } from '@/app/actions/days'
import { sealCapsuleAction } from '@/app/actions/capsule'

const YEAR_OPTIONS = [1, 2, 3, 4, 5, 10]

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left:    (i * 37 + 13) % 100,
  top:     (i * 53 + 7)  % 100,
  size:    1 + (i % 3),
  opacity: 0.3 + (i % 5) * 0.08,
  twinkle: 1.5 + (i * 0.17) % 2.5,
  delay:   (i * 0.13) % 3,
}))

type Stage = 'sealed' | 'intro1' | 'intro2' | 'form' | 'launching' | 'done'

type Props = {
  dayNumber: number
  title: string
  alreadyOpened: boolean
  isPreview?: boolean
}

function Starfield({ warp = false }: { warp?: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #1a1040 0%, #0a0818 60%, #060410 100%)', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <style>{`
        @keyframes twinkle { from { opacity: 0.15; } to { opacity: 0.9; } }
        @keyframes warp-star {
          0%   { transform: translate(0,0) scale(1); opacity: 0.6; }
          100% { transform: translate(var(--dx), var(--dy)) scale(3); opacity: 0; }
        }
        @keyframes launch-capsule {
          0%   { transform: translateY(0)    scale(1);   opacity: 1; }
          20%  { transform: translateY(-20px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-110vh) scale(0.3); opacity: 0; }
        }
        @keyframes flame {
          0%,100% { height: 18px; opacity: 0.8; }
          50%      { height: 28px; opacity: 1;   }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: warp ? s.size * 4 : s.size,
          borderRadius: warp ? 2 : '50%',
          background: 'white',
          opacity: s.opacity,
          transformOrigin: '50% 50%',
          ...(warp ? {
            '--dx': `${(s.left - 50) * 6}px`,
            '--dy': `${(s.top  - 50) * 6}px`,
            animation: `warp-star 0.8s ${s.delay * 0.1}s ease-in forwards`,
          } as React.CSSProperties : {
            animation: `twinkle ${s.twinkle}s ${s.delay}s ease-in-out infinite alternate`,
          }),
        }} />
      ))}
    </div>
  )
}

export function TimeCapsuleReveal({ dayNumber, title, alreadyOpened, isPreview = false }: Props) {
  const [stage,      setStage]      = useState<Stage>(alreadyOpened ? 'intro1' : 'sealed')
  const [opening,    setOpening]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')
  const [sendDate,   setSendDate]   = useState('')
  const [years,      setYears]      = useState(1)
  const [sealCount,  setSealCount]  = useState(0)
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setStage('intro1'), 500)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await sealCapsuleAction(fd)
    if ('error' in result) {
      setError(result.error ?? 'Error desconocido.')
      setSubmitting(false)
      return
    }
    const d = new Date(result.sendAt)
    setSendDate(d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }))
    setStage('launching')
    setTimeout(() => { setStage('done'); setSealCount(c => c + 1) }, 2000)
  }

  // ── Sealed ────────────────────────────────────────────────────────────────────
  if (stage === 'sealed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <Starfield />
        <button
          onClick={handleOpen}
          disabled={opening}
          className="relative z-10 flex flex-col items-center gap-6"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'all 0.5s ease',
            opacity: opening ? 0 : 1,
            transform: opening ? 'scale(1.4) translateY(-30px)' : 'scale(1)',
          }}
        >
          <div style={{ fontSize: 90, filter: 'drop-shadow(0 0 30px rgba(160,100,255,0.7))' }}>🫙</div>
          <p style={{ color: '#c4a8f8', fontSize: 13, letterSpacing: '0.1em', opacity: 0.8 }}>
            Toca para abrir
          </p>
        </button>
      </div>
    )
  }

  // ── Intro 1 ───────────────────────────────────────────────────────────────────
  if (stage === 'intro1') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <Starfield />
        <div className="relative z-10 text-center flex flex-col items-center gap-8" style={{ maxWidth: 360, animation: 'fade-in-up 0.8s ease forwards' }}>
          <div style={{ fontSize: 48 }}>🌌</div>
          <p style={{ color: '#e8d8ff', fontSize: 16, lineHeight: 1.9, fontStyle: 'italic' }}>
            Tú y yo vamos a estar juntos por muchos años. Habrá sentimientos, momentos, y experiencias que con el tiempo iremos recordando y en los que estaremos pensando.
          </p>
          <button
            onClick={() => setStage('intro2')}
            style={{
              padding: '12px 32px', borderRadius: 24,
              background: 'rgba(160,100,255,0.2)',
              border: '1px solid rgba(160,100,255,0.4)',
              color: '#c4a8f8', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.05em',
            }}
            className="hover:opacity-80"
          >
            Siguiente →
          </button>
        </div>
      </div>
    )
  }

  // ── Intro 2 ───────────────────────────────────────────────────────────────────
  if (stage === 'intro2') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <Starfield />
        <div className="relative z-10 text-center flex flex-col items-center gap-8" style={{ maxWidth: 380, animation: 'fade-in-up 0.8s ease forwards' }}>
          <div style={{ fontSize: 48 }}>✉️</div>
          <p style={{ color: '#e8d8ff', fontSize: 16, lineHeight: 1.9, fontStyle: 'italic' }}>
            ¿Y si de repente tú y yo pudiéramos recibir un mensaje de nuestras versiones más jóvenes? Todos esos años en el futuro.
          </p>
          <button
            onClick={() => setStage('form')}
            style={{
              padding: '12px 32px', borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(160,100,255,0.35), rgba(100,60,200,0.35))',
              border: '1px solid rgba(160,100,255,0.5)',
              color: '#e8d8ff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em',
            }}
            className="hover:opacity-80"
          >
            Escribir la cápsula ✨
          </button>
        </div>
      </div>
    )
  }

  // ── Launching ─────────────────────────────────────────────────────────────────
  if (stage === 'launching') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <Starfield warp />
        <div className="relative z-10 flex flex-col items-center" style={{ animation: 'launch-capsule 1.8s ease-in forwards' }}>
          {/* Flame */}
          <div style={{
            width: 18, height: 22,
            background: 'linear-gradient(180deg, #ff8c00, #ff4500, transparent)',
            borderRadius: '0 0 50% 50%',
            animation: 'flame 0.15s ease-in-out infinite',
            marginBottom: -4,
            filter: 'blur(2px)',
          }} />
          <div style={{ fontSize: 72, filter: 'drop-shadow(0 0 30px rgba(255,140,0,0.8))' }}>🫙</div>
        </div>
      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <Starfield />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center animate-pop-in" style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 64, filter: 'drop-shadow(0 0 20px rgba(160,100,255,0.7))' }}>🚀</div>
          <div>
            <h2 style={{ color: '#e8d8ff', fontSize: 20, fontWeight: 700 }}>
              {sealCount > 1 ? `¡${sealCount} cápsulas enviadas!` : '¡Cápsula en camino!'}
            </h2>
            <p style={{ color: '#a888e8', fontSize: 13, marginTop: 8, lineHeight: 1.8 }}>
              Viajando hacia el <strong style={{ color: '#d4b8ff' }}>{sendDate}</strong>.
            </p>
          </div>

          <div style={{
            background: 'rgba(160,100,255,0.08)',
            border: '1px solid rgba(160,100,255,0.2)',
            borderRadius: 14, padding: '14px 20px',
          }}>
            <p style={{ color: '#c4a8f8', fontSize: 12, opacity: 0.75, fontStyle: 'italic' }}>
              "El tiempo es la única moneda de tu vida."
            </p>
          </div>

          {/* Write more */}
          <button
            onClick={() => { setYears(1); setStage('form') }}
            style={{
              padding: '12px 28px', borderRadius: 24,
              background: 'rgba(160,100,255,0.18)',
              border: '1px solid rgba(160,100,255,0.35)',
              color: '#c4a8f8', fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="hover:opacity-80"
          >
            Escribir otra cápsula 🫙
          </button>

          <a href="/home" style={{ color: '#6040a0', fontSize: 11, opacity: 0.5, marginTop: 4 }} className="underline hover:opacity-70">
            ← Volver al calendario
          </a>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 relative overflow-hidden animate-fade-in">
      <Starfield />

      <div className="relative z-10 w-full" style={{ maxWidth: 420 }}>
        <div className="text-center mb-8">
          <p style={{ color: '#8060c0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7 }}>
            Día {dayNumber}
          </p>
          <h1 style={{ color: '#e8d8ff', fontSize: 22, fontWeight: 700, marginTop: 4 }}>{title}</h1>
          <div style={{ width: 36, height: 1, background: '#8060c0', margin: '10px auto', opacity: 0.4 }} />
          <p style={{ color: '#a888e8', fontSize: 13, opacity: 0.8, fontStyle: 'italic' }}>
            Escríbele algo a tu yo del futuro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div>
            <label style={{ color: '#c4a8f8', fontSize: 12, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Tu mensaje
            </label>
            <textarea
              name="message"
              required
              rows={7}
              placeholder="Querida yo del futuro…"
              style={{
                width: '100%', borderRadius: 12, border: '1px solid rgba(160,100,255,0.25)',
                background: 'rgba(30,15,60,0.7)', backdropFilter: 'blur(8px)',
                color: '#e8d8ff', fontSize: 14, padding: '12px 14px', resize: 'none',
                outline: 'none', lineHeight: 1.7, boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#c4a8f8', fontSize: 12, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Email donde recibirla
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu@email.com"
              style={{
                width: '100%', borderRadius: 12, border: '1px solid rgba(160,100,255,0.25)',
                background: 'rgba(30,15,60,0.7)', backdropFilter: 'blur(8px)',
                color: '#e8d8ff', fontSize: 14, padding: '12px 14px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#c4a8f8', fontSize: 12, letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
              Abrirla en…
            </label>
            <div className="flex gap-2 flex-wrap">
              {YEAR_OPTIONS.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  style={{
                    padding: '8px 16px', borderRadius: 20,
                    border: `1px solid ${years === y ? 'rgba(160,100,255,0.8)' : 'rgba(160,100,255,0.2)'}`,
                    background: years === y ? 'rgba(160,100,255,0.25)' : 'rgba(30,15,60,0.5)',
                    color: years === y ? '#e8d8ff' : '#a888e8',
                    fontSize: 13, fontWeight: years === y ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {y} {y === 1 ? 'año' : 'años'}
                </button>
              ))}
            </div>
            <input type="hidden" name="years" value={years} />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8, padding: '14px 0', borderRadius: 14,
              background: submitting ? 'rgba(120,60,220,0.3)' : 'linear-gradient(135deg, #8040d0, #6030b0)',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              boxShadow: '0 4px 24px rgba(120,60,220,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Sellando…' : 'Sellar y enviar al espacio 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
