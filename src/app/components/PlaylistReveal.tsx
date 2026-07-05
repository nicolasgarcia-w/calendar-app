'use client'
import { useState, useEffect, useRef } from 'react'
import { markOpenedAction } from '@/app/actions/days'

const SONGS = [
  { id: 1, title: 'Ojos Color Sol',  artist: 'Calle 13',       file: '/playlist/song1.mp3', photo: '/playlist/photo1.jpeg' },
  { id: 2, title: 'Dime Que No',     artist: 'Ricardo Arjona', file: '/playlist/song2.mp3', photo: '/playlist/photo2.jpeg' },
  { id: 3, title: 'Who Knows',       artist: 'Daniel Caesar',  file: '/playlist/song3.mp3', photo: '/playlist/photo3.jpeg' },
  { id: 4, title: 'Química Mayor',   artist: 'Mon Laferte',    file: '/playlist/song4.mp3', photo: '/playlist/photo4.jpeg' },
  { id: 5, title: 'Tuki Tuki',       artist: 'Kris R',         file: '/playlist/song5.mp3', photo: '/playlist/photo5.jpeg' },
]

function fmt(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

type Props = {
  dayNumber: number
  title: string
  alreadyOpened: boolean
  notes?: string[]
  isPreview?: boolean
}

export function PlaylistReveal({ dayNumber, title, alreadyOpened, notes = [], isPreview = false }: Props) {
  const [opened,      setOpened]      = useState(alreadyOpened)
  const [opening,     setOpening]     = useState(false)
  const [index,       setIndex]       = useState(0)
  const [fading,      setFading]      = useState(false)
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration,    setDuration]    = useState(0)
  const markedRef = useRef(alreadyOpened)
  const audioRef  = useRef<HTMLAudioElement | null>(null)
  const tickRef   = useRef<NodeJS.Timeout | null>(null)

  const song = SONGS[index]
  const note = notes[index] ?? ''

  // Sync audio src when index changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.src = song.file
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [index, song.file])

  // Tick for progress
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (!isPlaying) return
    tickRef.current = setInterval(() => {
      const audio = audioRef.current
      if (!audio) return
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
    }, 250)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [isPlaying])

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 350)
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause(); setIsPlaying(false) }
    else { audio.play().catch(() => {}); setIsPlaying(true) }
  }

  function navigate(dir: -1 | 1) {
    const next = index + dir
    if (next < 0 || next >= SONGS.length) return
    setFading(true)
    setTimeout(() => {
      setIndex(next)
      setFading(false)
    }, 250)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
    setCurrentTime(audio.currentTime)
  }

  // ── Sealed ──────────────────────────────────────────────────────────────────
  if (!opened) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1c1033 100%)' }}>
        <button
          onClick={handleOpen}
          disabled={opening}
          className={['flex flex-col items-center gap-5 transition-all duration-300',
            opening ? 'scale-125 opacity-0' : 'hover:scale-105 active:scale-95'].join(' ')}
        >
          <div className="text-8xl animate-float select-none">🎵</div>
          <p className="text-purple-300 text-sm font-medium tracking-wide animate-pulse-subtle">
            Toca para escuchar
          </p>
        </button>
      </div>
    )
  }

  // ── Player ───────────────────────────────────────────────────────────────────
  const prog = duration > 0 ? currentTime / duration : 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #0f0f1a 0%, #1c1033 60%, #0f0f1a 100%)' }}>

      {/* Header */}
      <div className="mb-6 text-center animate-fade-in">
        <p className="text-xs text-purple-400 tracking-widest uppercase">Día {dayNumber} · {title}</p>
      </div>

      {/* Card */}
      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: 360,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          opacity: fading ? 0 : 1,
          transform: fading ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
      >
        {/* Photo */}
        <div className="relative w-full" style={{ paddingBottom: '100%', background: 'rgba(255,255,255,0.04)' }}>
          <img
            src={song.photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {/* Song index indicator */}
          <div className="absolute top-3 right-3 text-xs text-white font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
            {index + 1} / {SONGS.length}
          </div>
        </div>

        {/* Info + controls */}
        <div className="p-5">

          {/* Song name + heart */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-white font-bold text-lg leading-tight truncate">{song.title}</p>
              <p className="text-purple-300 text-sm mt-0.5">{song.artist}</p>
            </div>
            <span className="text-red-400 text-xl shrink-0 mt-0.5">♥</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 mb-1">
            <div
              className="h-1 rounded-full cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.12)' }}
              onClick={handleSeek}
            >
              <div className="h-full rounded-full bg-white"
                style={{ width: `${prog * 100}%`, transition: 'width 0.25s linear' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-purple-400">{fmt(currentTime)}</span>
              <span className="text-xs text-purple-400">{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-4">
            {/* Prev */}
            <button
              onClick={() => navigate(-1)}
              disabled={index === 0}
              className="text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-25"
              style={{ fontSize: 22 }}
            >
              ⏮
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.95)' }}
            >
              <span className="text-black text-xl" style={{ marginLeft: isPlaying ? 0 : 2 }}>
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>

            {/* Next */}
            <button
              onClick={() => navigate(1)}
              disabled={index === SONGS.length - 1}
              className="text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-25"
              style={{ fontSize: 22 }}
            >
              ⏭
            </button>
          </div>

          {/* Personal note */}
          {note && (
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-purple-200 text-sm text-center leading-relaxed italic">
                "{note}"
              </p>
              <p className="text-purple-500 text-xs text-center mt-2">— Nico 🐸</p>
            </div>
          )}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-6">
        {SONGS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setIndex(i); setFading(false) }, 250) }}
            className="rounded-full transition-all"
            style={{
              width:  i === index ? 20 : 6,
              height: 6,
              background: i === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      <a href="/home" className="text-xs text-purple-500 underline mt-6 hover:text-purple-300">
        ← Volver al calendario
      </a>

      {/* Single shared audio element */}
      <audio ref={audioRef} preload="none" onEnded={() => { setIsPlaying(false); setCurrentTime(0) }} />
    </div>
  )
}
