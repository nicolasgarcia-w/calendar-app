'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type CardType = 'title' | 'level' | 'question' | 'wildcard'

interface Card {
  type: CardType
  level?: number
  levelName?: string
  text?: string
  wildcardText?: string
}

const CRIMSON = '#7B1113'

const DECK: Card[] = [
  // ── Title ────────────────────────────────────────────────────────────────────
  { type: 'title' },

  // ── Level 1 ──────────────────────────────────────────────────────────────────
  { type: 'level', level: 1, levelName: 'PERCEPTION' },
  { type: 'question', level: 1, text: 'How important do you think birthdays and holidays are to me? Explain.' },
  { type: 'question', level: 1, text: 'Who do you think was more nervous on our first date? Explain.' },
  { type: 'question', level: 1, text: 'What do you think my perfect date night would be?' },
  { type: 'question', level: 1, text: 'What was the first thing you noticed about me?' },
  { type: 'question', level: 1, text: 'What assumption did you make about me that turned out to be false?' },
  { type: 'question', level: 1, text: 'On a scale of 1-10, how open do you feel I am with you? Explain.' },

  // ── Level 2 ──────────────────────────────────────────────────────────────────
  { type: 'level', level: 2, levelName: 'CONNECTION' },
  { type: 'question', level: 2, text: 'What would a day of completely spoiling me look like?' },
  { type: 'question', level: 2, text: 'The hardest thing for me to reveal about myself to you was _________.' },
  { type: 'question', level: 2, text: 'How does one earn your trust? Have I earned it? How can I earn more?' },
  { type: 'question', level: 2, text: 'What has this relationship taught you about yourself?' },
  { type: 'question', level: 2, text: "What's the most romantic thing I've done for you recently?" },
  { type: 'question', level: 2, text: "What's one small way I can be a better partner?" },
  { type: 'question', level: 2, text: "What's the most attractive thing I do without realizing it?" },
  { type: 'question', level: 2, text: 'What did our worst argument teach you?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Write down one small way you can be better in this relationship. Both players. Compare.' },
  { type: 'question', level: 2, text: "What are you currently working through that I don't see, if anything?" },
  { type: 'question', level: 2, text: 'What song best describes our relationship?' },
  { type: 'question', level: 2, text: 'Do you think my job affects me positively or negatively? How does it affect us?' },
  { type: 'question', level: 2, text: 'What have you been extra sensitive to lately?' },
  { type: 'question', level: 2, text: 'What feelings are hard for you to communicate to me? How can I make it easier?' },
  { type: 'question', level: 2, text: 'What immediately attracted you to me? What attracted you more over time?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'On a scale of 1-10 write down the importance of having kids to you. Compare and explain.' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Write down the top 3 things your partner does that makes you feel most loved. Both players. Compare.' },
  { type: 'question', level: 2, text: "What's the best gift I've given you? Material and immaterial." },
  { type: 'question', level: 2, text: 'What about you feels hardest to love?' },
  { type: 'question', level: 2, text: 'What do you wish we did more of?' },
  { type: 'question', level: 2, text: 'What made you fall in love with me?' },
  { type: 'question', level: 2, text: "What's the most important lesson a past relationship has taught you?" },
  { type: 'question', level: 2, text: 'Finish the sentence: Thank you for accepting ____________.' },
  { type: 'question', level: 2, text: 'Are there any insecurities from previous relationships that you carried into this one? If so, what are they?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Write a love song for your partner. 1 minute. Perform for each other.' },
  { type: 'question', level: 2, text: 'What recent experience made you feel closer to me?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Write down the title you would give this chapter of our relationship. Compare.' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Write a short guide of how to love your partner well. 30 seconds. Compare.' },
  { type: 'question', level: 2, text: 'How do our strengths and weaknesses complement each other?' },
  { type: 'question', level: 2, text: 'What have I helped you appreciate about yourself?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: 'Draw one of your favorite memories from our relationship. 30 seconds. Compare.' },
  { type: 'question', level: 2, text: 'How do I show that I love you without telling you?' },
  { type: 'question', level: 2, text: 'When was the last time I hurt you, perhaps unintentionally?' },
  { type: 'question', level: 2, text: 'How have you seen me grow in this relationship?' },
  { type: 'question', level: 2, text: 'Have I helped you change your mind about anything?' },
  { type: 'wildcard', level: 2, text: 'WILDCARD', wildcardText: "Ask your partner something you've never asked them before." },
  { type: 'question', level: 2, text: 'How does our age difference, or lack thereof, affect us? If at all?' },
  { type: 'question', level: 2, text: 'What fear do you think holds me back the most?' },
  { type: 'question', level: 2, text: "What's one small way we can improve our sex life?" },

  // ── Level 3 ──────────────────────────────────────────────────────────────────
  { type: 'level', level: 3, levelName: 'REFLECTION' },
  { type: 'question', level: 3, text: 'What answer of mine surprised you the most throughout the game, if any?' },
  { type: 'question', level: 3, text: "Is there anything you still don't know about me that you wish you did?" },
  { type: 'wildcard', level: 3, text: 'WILDCARD', wildcardText: "Write down the top 3 things you're most grateful for in your partner. 30 seconds. Compare." },
  { type: 'question', level: 3, text: 'What goal would feel best for you to accomplish this year?' },
  { type: 'wildcard', level: 3, text: 'WILDCARD', wildcardText: 'Write down your intention for our relationship. Compare.' },
  { type: 'question', level: 3, text: "What don't I give myself enough credit for?" },
  { type: 'question', level: 3, text: 'What about our relationship are you proudest of?' },
  { type: 'question', level: 3, text: 'What did this conversation teach you about our relationship? What did it teach you about yourself?' },
  { type: 'question', level: 3, text: 'Thank you for helping me realize __________ about myself.' },
]

const TOTAL = DECK.length

type Props = { dayNumber: number; title: string; alreadyOpened: boolean }

export function WNRSReveal({ dayNumber, title, alreadyOpened }: Props) {
  const [opened, setOpened] = useState(alreadyOpened)
  const [opening, setOpening] = useState(false)
  const [index, setIndex] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)
  const markedRef = useRef(alreadyOpened)

  useEffect(() => {
    const saved = localStorage.getItem(`wnrs-day${dayNumber}`)
    if (saved) setIndex(Number(saved))
  }, [dayNumber])

  useEffect(() => {
    localStorage.setItem(`wnrs-day${dayNumber}`, String(index))
  }, [index, dayNumber])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  function go(dir: 'left' | 'right') {
    const next = dir === 'right' ? index + 1 : index - 1
    if (next < 0 || next >= TOTAL) return
    setAnimDir(dir)
    setTimeout(() => { setIndex(next); setAnimDir(null) }, 200)
  }

  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ backgroundColor: '#fdf2f2' }}>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['relative flex flex-col items-center gap-5 transition-all duration-350', opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div
            className="rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ width: 400, height: 270, backgroundColor: CRIMSON }}
          >
            <p className="text-white font-black text-center text-sm tracking-widest uppercase px-4 leading-relaxed">
              WE'RE NOT<br />REALLY<br />STRANGERS
            </p>
          </div>
          <p className="text-sm font-medium tracking-wide animate-pulse-subtle" style={{ color: CRIMSON }}>
            Toca para abrir
          </p>
        </button>
      </div>
    )
  }

  const card = DECK[index]
  const isRed = card.type === 'title' || card.type === 'level' || card.type === 'wildcard'
  const bg = isRed ? CRIMSON : '#ffffff'
  const textColor = isRed ? '#ffffff' : CRIMSON
  const brandColor = isRed ? 'rgba(255,255,255,0.4)' : 'rgba(123,17,19,0.3)'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: isRed ? '#f9e8e8' : '#fdf2f2', transition: 'background-color 0.3s' }}
    >
      {/* Progress */}
      <p className="text-xs mb-4 font-medium tracking-widest" style={{ color: CRIMSON, opacity: 0.5 }}>
        {index + 1} / {TOTAL}
      </p>

      {/* Card */}
      <div
        className="rounded-2xl shadow-2xl flex flex-col justify-center items-center p-7 select-none relative"
        style={{
          backgroundColor: bg,
          width: 400,
          height: 270,
          opacity: animDir ? 0 : 1,
          transform: animDir === 'right' ? 'translateX(-30px)' : animDir === 'left' ? 'translateX(30px)' : 'translateX(0)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
      >
        {/* Card content */}
        <div className="flex flex-col items-center justify-center gap-4">
          {card.type === 'title' && (
            <>
              <p className="font-black text-center text-2xl tracking-widest uppercase leading-tight" style={{ color: textColor }}>
                WE'RE NOT<br />REALLY<br />STRANGERS
              </p>
              <div className="w-12 h-0.5 my-2" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
              <p className="font-bold text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                COUPLES EDITION
              </p>
              <p className="font-medium text-center text-xs tracking-wide mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Desliza para comenzar →
              </p>
            </>
          )}

          {card.type === 'level' && (
            <>
              <p className="font-black text-center text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
                LEVEL {card.level}
              </p>
              <p className="font-black text-center text-4xl tracking-widest uppercase leading-tight" style={{ color: textColor }}>
                {card.levelName}
              </p>
            </>
          )}

          {card.type === 'question' && (
            <p className="font-bold text-center text-lg leading-snug uppercase" style={{ color: textColor }}>
              {card.text}
            </p>
          )}

          {card.type === 'wildcard' && (
            <>
              <p className="font-black text-center text-xl tracking-widest uppercase mb-4" style={{ color: textColor }}>
                WILDCARD
              </p>
              <p className="font-bold text-center text-base leading-snug uppercase" style={{ color: textColor }}>
                {card.wildcardText}
              </p>
            </>
          )}
        </div>

        {/* Brand */}
        <p className="absolute bottom-3 left-0 right-0 text-center text-[9px] font-bold tracking-widest uppercase" style={{ color: brandColor }}>
          WE'RE NOT REALLY STRANGERS
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={() => go('left')}
          disabled={index === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all disabled:opacity-20 active:scale-90"
          style={{ backgroundColor: CRIMSON, color: 'white' }}
        >
          ←
        </button>
        <button
          onClick={() => go('right')}
          disabled={index === TOTAL - 1}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all disabled:opacity-20 active:scale-90"
          style={{ backgroundColor: CRIMSON, color: 'white' }}
        >
          →
        </button>
      </div>

      <a href="/home" className="text-xs mt-6 underline underline-offset-2 transition-colors" style={{ color: `${CRIMSON}66` }}>
        ← Volver al calendario
      </a>
    </div>
  )
}
