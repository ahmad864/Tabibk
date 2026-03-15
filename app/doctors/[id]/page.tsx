'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/auth-context'
import BookingModal from '@/components/booking-modal'
import AuthModal from '@/components/auth-modal'
import { isDoctorActive } from '@/lib/doctorStatus'
import { DEMO_DOCTORS } from '@/lib/demoDoctors'
import { Star, MapPin, Phone, Clock, Activity, Stethoscope } from 'lucide-react'

const formatTime12 = (t: string | null): string => {
  if (!t) return ''
  const parts = t.split(':')
  let h = parseInt(parts[0])
  const m = parts[1] || '00'
  const period = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}

export default function DoctorProfilePage() {
  const { id } = useParams()
  const { user, isDoctor } = useAuth()
  const [doctor, setDoctor] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeNow, setActiveNow] = useState(false)

  useEffect(() => { fetchDoctor() }, [id])

  useEffect(() => {
    if (!doctor) return
    const check = () => setActiveNow(isDoctorActive(doctor.working_hours_start, doctor.working_hours_end, doctor.working_days))
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [doctor])

  const fetchDoctor = async () => {
    // أولاً: ابحث في الأطباء التجريبيين
    const demoDoc = DEMO_DOCTORS.find((d) => d.id === id)
    if (demoDoc) {
      setDoctor(demoDoc)
      setActiveNow(isDoctorActive(demoDoc.working_hours_start, demoDoc.working_hours_end, demoDoc.working_days))
      setLoading(false)
      return
    }

    // ثانياً: ابحث في Supabase
    const { data } = await supabase.from('doctors').select('*').eq('id', id).single()
    setDoctor(data)
    if (data) {
      setActiveNow(isDoctorActive(data.working_hours_start, data.working_hours_end, data.working_days))
      const { data: revData } = await supabase.from('reviews').select('*').eq('doctor_id', data.id).order('created_at', { ascending: false })
      setReviews(revData || [])
    }
    setLoading(false)
  }

  const handleBookClick = () => {
    if (!user) { setAuthOpen(true); return }
    if (isDoctor) return
    setBookingOpen(true)
  }

  const submitReview = async () => {
    if (!user || !doctor) return
    setSubmittingReview(true)
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single()
    await supabase.from('reviews').insert({
      doctor_id: doctor.id, patient_id: user.id,
      patient_name: profile?.full_name || 'مريض', rating: newRating, comment: newComment,
    })
    setNewComment(''); setNewRating(5); setSubmittingReview(false)
    fetchDoctor()
  }

  if (loading) return <div className="min-h-screen"><Navbar /><div className="section-padding text-center text-muted-foreground">جاري التحميل...</div></div>
  if (!doctor) return <div className="min-h-screen"><Navbar /><div className="section-padding text-center text-muted-foreground">لم يتم العثور على الطبيب</div></div>

  const doctorImage = doctor.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${doctor.full_name}&backgroundColor=0055A0&textColor=ffffff`

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto max-w-3xl">
          <BackButton />
          <div className="premium-card mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-accent border-4 border-primary/10">
                <img src={doctorImage} alt={doctor.full_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-heading text-2xl font-bold text-foreground">{doctor.full_name}</h1>
                  {doctor.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-yellow-100 text-yellow-800 border border-yellow-300">مميز</span>}
                </div>
                <p className="font-body text-primary flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <Stethoscope className="w-4 h-4" /> {doctor.specialization}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(doctor.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                  ))}
                  <span className="font-body text-sm text-muted-foreground mr-2">({doctor.rating_count || 0} تقييم)</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-body ${activeNow ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <Activity className="w-3 h-3 inline ml-1" />{activeNow ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {doctor.bio && (
              <div className="premium-card md:col-span-2">
                <h3 className="font-heading font-semibold mb-2">النبذة التعريفية</h3>
                <p className="font-body text-muted-foreground text-sm">{doctor.bio}</p>
              </div>
            )}
            {doctor.phone && (
              <div className="premium-card flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-body text-sm">{doctor.phone}</span>
              </div>
            )}
            {(doctor.city || doctor.clinic_address) && (
              <div className="premium-card flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-body text-sm">{[doctor.city, doctor.clinic_address].filter(Boolean).join(' - ')}</span>
              </div>
            )}
            {doctor.working_hours_start && (
              <div className="premium-card flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-body text-sm">{formatTime12(doctor.working_hours_start)} - {formatTime12(doctor.working_hours_end)}</span>
              </div>
            )}
            {doctor.diseases_treated?.length > 0 && (
              <div className="premium-card md:col-span-2">
                <h3 className="font-heading font-semibold mb-2">الأمراض المعالجة</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.diseases_treated.map((d: string) => (
                    <span key={d} className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-body">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleBookClick} disabled={isDoctor}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-heading text-lg font-bold hover:bg-primary/90 transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed">
            {isDoctor ? 'الأطباء لا يمكنهم حجز مواعيد' : 'احجز الآن'}
          </button>

          <div className="mb-8">
            <h2 className="font-heading text-xl font-bold mb-4">التقييمات ({reviews.length})</h2>
            {user && (
              <div className="premium-card mb-4">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setNewRating(i + 1)}>
                      <Star className={`w-6 h-6 ${i < newRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                    </button>
                  ))}
                </div>
                <textarea className="premium-input mb-3 min-h-[60px]" placeholder="اكتب تعليقك..."
                  value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button onClick={submitReview} disabled={submittingReview}
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground font-body py-8">لا توجد تقييمات بعد</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="premium-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-heading font-semibold text-sm">{rev.patient_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="font-body text-sm text-muted-foreground">{rev.comment}</p>}
                    <p className="font-body text-xs text-muted-foreground mt-1">{new Date(rev.created_at).toLocaleDateString('ar-SY')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} doctor={doctor} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultRole="patient" defaultMode="login" />
    </div>
  )
}
