import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: { default: 'ClinBase', template: '%s — ClinBase' },
  description: 'ClinBase — профессиональная клиническая база медицинских материалов для врачей и студентов',
  keywords: ['медицина', 'методички', 'клинические рекомендации', 'врачи', 'библиотека', 'ClinBase'],
  openGraph: {
    title: 'ClinBase',
    description: 'Клиническая база медицинских материалов',
    type: 'website',
  },
}

// Anti-FOUC: apply saved theme before first paint
const themeScript = `(function(){var t=localStorage.getItem('medguide-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((t||p)==='dark')document.documentElement.classList.add('dark');})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
