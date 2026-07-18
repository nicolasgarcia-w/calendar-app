'use client'
import { useState, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Question = { text: string; nicoAnswer: string; nicoGuess: string }
type Props    = { dayNumber: number; title: string; alreadyOpened: boolean; questions: Question[]; isPreview?: boolean }

type Phase = 'sealed' | 'asking' | 'revealing' | 'done'

// Camille's inputs per question
type CamiInputs = { camiGuess: string; camiAnswer: string }


const NICO_COLOR = '#3a7bd5'
const CAMI_COLOR = '#d53a7b'

export function CouplesQuizReveal({ dayNumber, title, alreadyOpened, questions, isPreview }: Props) {
  const [phase,      setPhase]      = useState<Phase>('sealed')
  const [opening,    setOpening]    = useState(false)
  const [current,    setCurrent]    = useState(0)
  const [camiGuess,  setCamiGuess]  = useState('')   // her guess at Nico's answer
  const [camiAnswer, setCamiAnswer] = useState('')   // her real answer
  const [allInputs,  setAllInputs]  = useState<CamiInputs[]>([])
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setPhase('asking'), 500)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!camiGuess.trim() || !camiAnswer.trim()) return
    setAllInputs(prev => [...prev, { camiGuess: camiGuess.trim(), camiAnswer: camiAnswer.trim() }])
    setPhase('revealing')
  }

  function handleNext() {
    setCamiGuess('')
    setCamiAnswer('')
    if (current + 1 >= questions.length) {
      setPhase('done')
    } else {
      setCurrent(c => c + 1)
      setPhase('asking')
    }
  }

  // ── Sealed ───────────────────────────────────────────────────────────────────
  if (phase === 'sealed') return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #fff0f5, #f0f5ff)', padding: '0 24px' }}>
      <button
        onClick={handleOpen}
        disabled={opening}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          background: 'none', border: 'none', cursor: opening ? 'default' : 'pointer',
          transition: 'all 0.4s ease',
          transform: opening ? 'scale(1.12)' : 'scale(1)',
          opacity: opening ? 0 : 1,
        }}
      >
        <div style={{ fontSize: 80 }}>💕</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c060a0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px', fontWeight: 600 }}>Día {dayNumber}</p>
          <h1 style={{ color: '#1a1a2e', fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>{title}</h1>
          <p style={{ color: '#9080a0', fontSize: 14, margin: 0 }}>¿Cuánto nos conocemos?</p>
        </div>
      </button>
    </div>
  )

  // ── Asking ────────────────────────────────────────────────────────────────────
  if (phase === 'asking' && questions.length > 0) {
    const q = questions[current]
    return (
      <div style={{ minHeight: '100svh', background: 'linear-gradient(145deg, #fff0f5, #f0f5ff)', display: 'flex', flexDirection: 'column' }}>
        <style>{`@keyframes slide-up { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>

        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center' }}>
          <a href="/home" style={{ color: '#b090b0', fontSize: 12, textDecoration: 'none' }}>← Calendario</a>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ color: '#9080a0', fontSize: 12 }}>{current + 1} / {questions.length}</span>
          </div>
        </div>

        <div style={{ height: 4, background: '#e8ddf0', margin: '0 20px', borderRadius: 2 }}>
          <div style={{ height: '100%', background: `linear-gradient(to right, ${CAMI_COLOR}, ${NICO_COLOR})`, width: `${(current / questions.length) * 100}%`, transition: 'width 0.4s ease', borderRadius: 2 }}/>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', animation: 'slide-up 0.35s ease both' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            <h2 style={{ color: '#1a1a2e', fontSize: 21, fontWeight: 800, margin: '0 0 28px', lineHeight: 1.35, textAlign: 'center' }}>{q.text}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Her guess at Nico's answer */}
              <div>
                <label style={{ display: 'block', color: NICO_COLOR, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                  ¿Qué respondí?
                </label>
                <input
                  autoFocus
                  value={camiGuess}
                  onChange={e => setCamiGuess(e.target.value)}
                  placeholder="Tu suposición..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 16px', fontSize: 15,
                    border: `2px solid ${NICO_COLOR}33`,
                    borderRadius: 12, outline: 'none',
                    background: 'white', color: '#1a1a2e',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = NICO_COLOR }}
                  onBlur={e  => { e.target.style.borderColor = `${NICO_COLOR}33` }}
                />
              </div>

              {/* Her real answer */}
              <div>
                <label style={{ display: 'block', color: CAMI_COLOR, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Tu respuesta real
                </label>
                <input
                  value={camiAnswer}
                  onChange={e => setCamiAnswer(e.target.value)}
                  placeholder="Tu respuesta..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 16px', fontSize: 15,
                    border: `2px solid ${CAMI_COLOR}33`,
                    borderRadius: 12, outline: 'none',
                    background: 'white', color: '#1a1a2e',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = CAMI_COLOR }}
                  onBlur={e  => { e.target.style.borderColor = `${CAMI_COLOR}33` }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '14px', borderRadius: 12, border: 'none',
                  background: `linear-gradient(to right, ${CAMI_COLOR}, ${NICO_COLOR})`,
                  color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                Revelar →
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Revealing ─────────────────────────────────────────────────────────────────
  if (phase === 'revealing' && questions.length > 0) {
    const q         = questions[current]
    const inputs    = allInputs[allInputs.length - 1]
    return (
      <div style={{ minHeight: '100svh', background: 'linear-gradient(145deg, #fff0f5, #f0f5ff)', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          @keyframes fade-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        `}</style>

        <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center' }}>
          <a href="/home" style={{ color: '#b090b0', fontSize: 12, textDecoration: 'none' }}>← Calendario</a>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ color: '#9080a0', fontSize: 12 }}>{current + 1} / {questions.length}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 32px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>

            <p style={{ color: '#6a5a7a', fontSize: 13, textAlign: 'center', margin: '0 0 20px', fontStyle: 'italic' }}>{q.text}</p>

            {/* Nico's answer */}
            <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `2px solid ${NICO_COLOR}22`, animation: 'fade-up 0.3s ease both' }}>
              <p style={{ color: NICO_COLOR, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Mi respuesta
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#9080a0', fontSize: 10, margin: '0 0 3px' }}>Tú creías que era...</p>
                  <p style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, margin: 0 }}>{inputs.camiGuess}</p>
                </div>
                <div style={{ width: 1, background: '#e8ddf0' }}/>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#9080a0', fontSize: 10, margin: '0 0 3px' }}>Mi respuesta real</p>
                  <p style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, margin: 0 }}>{q.nicoAnswer}</p>
                </div>
              </div>
            </div>

            {/* Camille's answer */}
            <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 20, border: `2px solid ${CAMI_COLOR}22`, animation: 'fade-up 0.3s 0.1s ease both', opacity: 0 }}>
              <p style={{ color: CAMI_COLOR, fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Tu respuesta
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#9080a0', fontSize: 10, margin: '0 0 3px' }}>Yo creía que eras...</p>
                  <p style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, margin: 0 }}>{q.nicoGuess}</p>
                </div>
                <div style={{ width: 1, background: '#e8ddf0' }}/>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#9080a0', fontSize: 10, margin: '0 0 3px' }}>Tu respuesta real</p>
                  <p style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, margin: 0 }}>{inputs.camiAnswer}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: `linear-gradient(to right, ${CAMI_COLOR}, ${NICO_COLOR})`,
                color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {current + 1 >= questions.length ? 'Ver resultados →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100svh', background: 'linear-gradient(145deg, #fff0f5, #f0f5ff)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 48px', overflowY: 'auto' }}>
        <style>{`@keyframes pop-in { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }`}</style>

        <div style={{ width: '100%', maxWidth: 420, animation: 'pop-in 0.4s ease both' }}>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 56 }}>💕</div>
            <h1 style={{ color: '#1a1a2e', fontSize: 22, fontWeight: 800, margin: '12px 0 4px' }}>Así nos conocemos</h1>
          </div>

          {/* Breakdown per question */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {questions.map((q, i) => {
              const inp = allInputs[i]
              if (!inp) return null
              return (
                <div key={i} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', border: '1px solid #ede8f5' }}>
                  <p style={{ color: '#6a5a7a', fontSize: 12, margin: '0 0 8px', fontStyle: 'italic' }}>{q.text}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, background: '#f5f0ff', borderRadius: 8, padding: '8px 10px' }}>
                      <p style={{ color: NICO_COLOR, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px' }}>Yo respondí</p>
                      <p style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{q.nicoAnswer}</p>
                      <p style={{ color: '#9080a0', fontSize: 11, margin: 0 }}>Tú creías: <em>{inp.camiGuess}</em></p>
                    </div>
                    <div style={{ flex: 1, background: '#fff0f5', borderRadius: 8, padding: '8px 10px' }}>
                      <p style={{ color: CAMI_COLOR, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px' }}>Tú respondiste</p>
                      <p style={{ color: '#1a1a2e', fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{inp.camiAnswer}</p>
                      <p style={{ color: '#9080a0', fontSize: 11, margin: 0 }}>Yo creía: <em>{q.nicoGuess}</em></p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <a href="/home" style={{ display: 'block', padding: '14px', borderRadius: 12, background: `linear-gradient(to right, ${CAMI_COLOR}, ${NICO_COLOR})`, color: 'white', fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            Volver al calendario
          </a>
        </div>
      </div>
    )
  }

  return null
}
