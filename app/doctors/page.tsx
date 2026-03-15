'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import DoctorCard, { type DoctorCardData } from '@/components/doctor-card'
import { Search } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { isDoctorActive } from '@/lib/doctorStatus'

const localImages: Record<string, string> = {
  'د. أحمد محمد': '/doctors/dr-ahmad.jpg',
  'د. سارة علي': '/doctors/dr-sara.jpg',
  'د. علي حسن': '/doctors/dr-ali.jpg',
  'د. ليلى كريم': '/doctors/dr-layla.jpg',
  'د. عمر يوسف': '/doctors/dr-omar.jpg',
  'د. هاني سعد': '/doctors/dr-hani.jpg',
}

const specializations = ['الكل', 'طب قلبية', 'جهاز هضمي', 'طب أعصاب', 'طب أطفال', 'طب جلدية', 'طب عظمية', 'طب عيون', 'طب باطنية', 'طب نسائية']

export default function DoctorsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('الكل')
  const [allDoctors, setAllDoctors] = useState<DoctorCardData[]>([])

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('*').eq('is_approved', true)
    if (data && data.length > 0) {
      setAllDoctors(data.map((d: any) => ({
        id: d.id, name: d.full_name, specialization: d.specialization,
        rating: Number(d.rating) || 0,
        image: localImages[d.full_name] || d.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${d.full_name}&backgroundColor=0055A0&textColor=ffffff`,
        isActive: isDoctorActive(d.working_hours_start, d.working_hours_end, d.working_days),
        isFeatured: d.is_featured || false,
      })))
    }
  }

  useEffect(() => {
    fetchDoctors()
    const interval = setInterval(fetchDoctors, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = allDoctors.filter((doc) => {
    const matchesSearch = doc.name.includes(search) || doc.specialization.includes(search)
    const matchesFilter = filter === 'الكل' || doc.specialization === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto">
          <BackButton />
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">أطباؤنا</h1>
            <p className="font-body text-muted-foreground">ابحث عن الطبيب المناسب واحجز موعدك</p>
          </div>
          <div className="max-w-2xl mx-auto mb-10 space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن طبيب أو تخصص..." className="premium-input pr-12" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {specializations.map((spec) => (
                <button key={spec} onClick={() => setFilter(spec)} className={`px-4 py-2 rounded-xl font-body text-sm transition-all duration-200 ${filter === spec ? 'bg-primary text-primary-foreground shadow-md' : 'bg-accent text-accent-foreground hover:bg-primary/10'}`}>
                  {spec}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
          {filtered.length === 0 && <div className="text-center py-16"><p className="font-body text-muted-foreground text-lg">لم يتم العثور على أطباء</p></div>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
