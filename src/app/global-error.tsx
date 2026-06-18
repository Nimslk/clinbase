'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, background: '#f9fafb', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 8 }}>Ошибка приложения</h2>
          <pre style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, fontSize: 13, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#991b1b' }}>
            {error?.message ?? 'Неизвестная ошибка'}
            {error?.stack ? '\n\n' + error.stack : ''}
          </pre>
          {error?.digest && (
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: '8px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  )
}
