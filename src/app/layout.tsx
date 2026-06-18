import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: { default: 'ClinBase — Медицинская библиотека', template: '%s — ClinBase' },
  description: 'ClinBase — образовательная медицинская платформа. Учебники, клинические руководства, методические пособия и атласы для врачей, ординаторов и студентов медицинских вузов.',
  keywords: ['медицинская библиотека', 'клинические рекомендации', 'медицинские учебники', 'методические пособия', 'ординатура', 'медицинский университет', 'ClinBase', 'clinbase.ru'],
  metadataBase: new URL('https://clinbase.ru'),
  alternates: { canonical: 'https://clinbase.ru' },
  openGraph: {
    title: 'ClinBase — Образовательная медицинская платформа',
    description: 'Учебники, клинические руководства, методические пособия и атласы для врачей, ординаторов и студентов медицинских вузов. Совместный проект СПбГПМУ и ТГМУ.',
    url: 'https://clinbase.ru',
    siteName: 'ClinBase',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

// Anti-FOUC: apply saved theme before first paint
const themeScript = `(function(){try{var t=localStorage.getItem('medguide-theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((t||p)==='dark')document.documentElement.classList.add('dark');}catch(e){}})()`

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
