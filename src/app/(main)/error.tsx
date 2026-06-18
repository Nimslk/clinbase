'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', maxWidth: 700, margin: '4rem auto', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#dc2626', fontSize: 18, marginBottom: 12 }}>⚠️ Ошибка страницы</h2>
      <pre style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#991b1b' }}>
        {error?.message ?? 'Неизвестная ошибка'}
        {'\n\n'}
        {error?.stack ?? ''}
      </pre>
      {error?.digest && (
        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        style={{ marginTop: 16, padding: '8px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        Попробовать снова
      </button>
    </div>
  )
}
