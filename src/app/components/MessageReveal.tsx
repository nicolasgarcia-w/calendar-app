'use client'
import { useState } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Props = {
  dayNumber: number
  title: string
  body: string
  alreadyOpened: boolean
}

export function MessageReveal({ dayNumber, title, body, alreadyOpened }: Props) {
  const [opened, setOpened] = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)

  async function handleOpen() {
    setOpening(true)
    if (!alreadyOpened) await markOpenedAction(dayNumber)
    setTimeout(() => setOpened(true), 350)
  }

  const paragraphs = body.split('\n').filter((p) => p.trim() !== '')

  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 px-6">
        {/* Decorative petals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {['top-8 left-6', 'top-16 right-10', 'bottom-24 left-12', 'bottom-16 right-8', 'top-1/3 left-4', 'top-1/2 right-6'].map((pos, i) => (
            <span key={i} className={`absolute text-rose-200 text-2xl opacity-60 ${pos}`}>🌸</span>
          ))}
        </div>

        <button
          onClick={handleOpen}
          disabled={opening}
          className={[
            'relative flex flex-col items-center gap-5 transition-all duration-350',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95',
          ].join(' ')}
        >
          <div className="text-9xl drop-shadow-sm select-none">💌</div>
          <p className="text-rose-500 text-sm font-medium tracking-wide animate-pulse-subtle">
            Toca para abrir
          </p>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 px-5 py-12 animate-fade-in">
      {/* Decorative petals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        {['top-6 left-4', 'top-12 right-8', 'bottom-20 left-10', 'bottom-12 right-6'].map((pos, i) => (
          <span key={i} className={`absolute text-rose-200 text-xl opacity-40 ${pos}`}>🌸</span>
        ))}
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Day label */}
        <p className="text-center text-rose-300 text-xs font-semibold mb-2 tracking-widest uppercase">
          Día {dayNumber}
        </p>

        {/* Title */}
        <h1 className="text-center text-2xl font-semibold text-rose-800 mb-8 leading-snug px-2">
          {title}
        </h1>

        {/* Message card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-7 space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-slate-700 leading-relaxed text-base">
              {p}
            </p>
          ))}

          {/* Signature */}
          <div className="pt-5 border-t border-rose-100 flex items-center justify-end gap-2">
            <p className="text-rose-500 font-medium italic">De tu Coqui</p>
            <span className="text-lg">🐸</span>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/home" className="text-sm text-rose-400 hover:text-rose-600 underline underline-offset-2">
            ← Volver al calendario
          </a>
        </div>
      </div>
    </div>
  )
}
