import Hero from '@/components/home/Hero'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedMaterials from '@/components/home/FeaturedMaterials'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClinBase — Клиническая база',
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <CategoryGrid />
      <FeaturedMaterials />
    </div>
  )
}
