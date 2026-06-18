'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function safeStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch {}
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    try {
      const saved    = safeStorage('medguide-theme') as Theme | null
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      const initial  = saved ?? preferred
      setTheme(initial)
      document.documentElement.classList.toggle('dark', initial === 'dark')
    } catch {}
  }, [])

  const toggle = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      safeStorageSet('medguide-theme', next)
      try { document.documentElement.classList.toggle('dark', next === 'dark') } catch {}
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
