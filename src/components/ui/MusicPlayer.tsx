'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'

const VIDEO_ID = 'qwosU7e9mqc'

declare global {
  interface Window {
    YT: { Player: new (...args: any[]) => any }
    onYouTubeIframeAPIReady: () => void
  }
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [ready, setReady]     = useState(false)
  const playerRef = useRef<any>(null)
  const divId     = 'yt-bg-player'

  useEffect(() => {
    const init = () => {
      try {
        if (playerRef.current) return
        playerRef.current = new window.YT.Player(divId, {
          videoId: VIDEO_ID,
          playerVars: {
            loop: 1, playlist: VIDEO_ID,
            controls: 0, disablekb: 1, modestbranding: 1, rel: 0,
          },
          events: { onReady: () => setReady(true) },
        })
      } catch {
        // YouTube API unavailable (ad-blocker, network error, etc.)
      }
    }

    try {
      if (window.YT?.Player) {
        init()
      } else {
        window.onYouTubeIframeAPIReady = init
        if (!document.getElementById('yt-api-script')) {
          const tag = document.createElement('script')
          tag.id  = 'yt-api-script'
          tag.src = 'https://www.youtube.com/iframe_api'
          document.head.appendChild(tag)
        }
      }
    } catch {
      // Fail silently
    }
  }, [])

  const toggle = () => {
    if (!playerRef.current || !ready) return
    try {
      if (playing) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
      setPlaying((v) => !v)
    } catch {
      // Player method unavailable
    }
  }

  return (
    <>
      <div id={divId} className="sr-only pointer-events-none" style={{ width: 1, height: 1, position: 'absolute' }} />

      <button
        onClick={toggle}
        title={playing ? 'Выключить музыку' : 'Включить музыку'}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none"
        style={{ width: 52, height: 52 }}
      >
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
