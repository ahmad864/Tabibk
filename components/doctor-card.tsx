'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export interface DoctorCardData {
  id: string
  name: string
  specialization: string
  rating: number
  image: string
  isActive?: boolean
  isFeatured?: boolean
}

export default function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }} className="premium-card text-center">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-accent border-4 border-primary/10">
        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center justify-center gap-2 mb-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">{doctor.name}</h3>
        {doctor.isFeatured && <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-yellow-100 text-yellow-800 border border-yellow-300">مميز</span>}
      </div>
      <p className="font-body text-sm text-muted-foreground mb-2">{doctor.specialization}</p>
      {doctor.isActive !== undefined && (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-body mb-2 ${doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {doctor.isActive ? 'نشط' : 'غير نشط'}
        </span>
      )}
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(doctor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
        ))}
        <span className="font-body text-xs text-muted-foreground mr-1">({doctor.rating})</span>
      </div>
      <Link href={`/doctors/${doctor.id}`} className="inline-block w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:bg-primary/90 transition-colors">
        احجز الآن
      </Link>
    </motion.div>
  )
}
