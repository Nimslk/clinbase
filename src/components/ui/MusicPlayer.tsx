'use client'
import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

const VIDEO_ID = 'qwosU7e9mqc'

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const toggle = () => {
    if (!playing) {
      // start: load iframe
      setPlaying(true)
    } else {
      // stop: unload iframe
      setPlaying(false)
    }
  }

  const src = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&loop=1&playlist=${VIDEO_ID}&controls=0&disablekb=1&modestbranding=1&rel=0`

  return (
    <>
      {/* Hidden iframe */}
      {playing && (
        <iframe
          ref={iframeRef}
          src={src}
          allow="autoplay; encrypted-media"
          className="sr-only pointer-events-none"
          title="music"
          width="1"
          height="1"
        />
      )}

      {/* Floating button */}
      <button
        onClick={toggle}
        title={playing ? 'Выключить музыку' : 'Включить музыку'}
        className="fixed bottom-6 left-6 z-50 w-13 h-13 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none"
        style={{ width: 52, height: 52 }}
      >
        {/* Animated ring when playing */}
        {playing && (
          <span className="absolute inset-0 rounded-full bg-medical-400 opacity-25 animate-ping" />
        )}

        <span className={`relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
          playing
            ? 'bg-gradient-to-br from-medical-500 to-medical-700 shadow-medical-500/40 shadow-lg'
            : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-medical-300 hover:text-medical-500'
        }`}>
          {playing
            ? <Pause className="w-5 h-5 text-white" />
            : <Play  className="w-5 h-5 ml-0.5" />
          }
        </span>
      </button>
    </>
  )
}
