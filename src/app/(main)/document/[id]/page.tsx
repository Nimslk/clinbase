import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { readMaterials } from '@/lib/storage'
import { getSession } from '@/lib/auth'
import DocumentViewer from '@/components/viewer/DocumentViewer'
import DocumentSidebar from '@/components/viewer/DocumentSidebar'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const material = readMaterials().find((m) => m.id === params.id)
  if (!material) return { title: 'Не найдено' }
  return { title: material.title }
}

export default async function DocumentPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const material = readMaterials().find((m) => m.id === params.id)
  if (!material) notFound()

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-hidden">
        <DocumentViewer material={material} />
      </div>
      <DocumentSidebar material={material} />
    </div>
  )
}
