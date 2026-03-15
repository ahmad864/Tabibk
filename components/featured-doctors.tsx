'use client'

import { useEffect, useState } from 'react'
import DoctorCard, { type DoctorCardData } from './doctor-card'
import { supabase } from '@/integrations/supabase/client'
import { isDoctorActive } from '@/lib/doctorStatus'
import { getFeaturedCardData } from '@/lib/demoDoctors'

const localImages: Record<string, string> = {
  'د. أحمد محمد': '/doctors/dr-ahmad.jpg',
  'د. سارة علي': '/doctors/dr-sara.jpg',
  'د. علي حسن': '/doctors/dr-ali.jpg',
  'د. ليلى كريم': '/doctors/dr-layla.jpg',
  'د. عمر يوسف': '/doctors/dr-omar.jpg',
  'د. هاني سعد': '/doctors/dr-hani.jpg',
}

export default function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<DoctorCardData[]>([])

  useEffect(() => {
    const loadDoctors = async () => {
      // أولاً: حمّل الأطباء التجريبيين المميزين
      const demoFeatured = getFeaturedCardData()

      // ثانياً: حمّل الأطباء المميزين من Supabase
      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .limit(6)

      let supabaseDoctors: DoctorCardData[] = []
      if (data && data.length > 0) {
        supabaseDoctors = data.map((d: any) => ({
          id: d.id,
          name: d.full_name,
          specialization: d.specialization,
          rating: Number(d.rating) || 0,
          image: localImages[d.full_name] || d.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${d.full_name}&backgroundColor=0055A0&textColor=ffffff`,
          isActive: isDoctorActive(d.working_hours_start, d.working_hours_end, d.working_days),
          isFeatured: true,
        }))
      }

      // دمج: الأطباء التجريبيون + Supabase (بدون تكرار)
      const supabaseIds = new Set(supabaseDoctors.map((d) => d.id))
      const merged = [
        ...supabaseDoctors,
        ...demoFeatured.filter((d) => !supabaseIds.has(d.id)),
      ].slice(0, 6)

      setDoctors(merged)
    }

    loadDoctors()
    const interval = setInterval(loadDoctors, 60000)
    return () => clearInterval(interval)
  }, [])

  if (doctors.length === 0) return null

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">أطباء مميزون</h2>
          <p className="font-body text-muted-foreground">نخبة من أفضل الأطباء المتخصصين</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      </div>
    </section>
  )
}
