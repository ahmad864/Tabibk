'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-body text-sm mb-4">
      <ArrowRight className="w-4 h-4" /> رجوع
    </button>
  )
}
