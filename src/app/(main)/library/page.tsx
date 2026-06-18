import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import LibraryContent from '@/components/library/LibraryContent'

export const metadata: Metadata = { title: 'Библиотека' }

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; page?: string }
}) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Библиотека материалов</h1>
        <p className="text-gray-500">Методические пособия, клинические рекомендации и учебные материалы</p>
      </div>
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <div className="flex gap-8">
      <div className="w-64 shrink-0 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
