'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Calendar, Clock, Check, X, Settings, Camera, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default function DoctorDashboard() {
  const { user, isDoctor, doctorData, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'appointments' | 'settings'>('appointments')

  const [showSlotModal, setShowSlotModal] = useState(false)
  const [slotDay, setSlotDay] = useState(0)
  const [newSlotTime, setNewSlotTime] = useState('09:00')
  const [existingSlots, setExistingSlots] = useState<{ id: string; day_of_week: number; slot_time: string }[]>([])
  const [pendingSlots, setPendingSlots] = useState<string[]>([])
  const [savingSlots, setSavingSlots] = useState(false)

  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [clinicAddress, setClinicAddress] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [workStartTime, setWorkStartTime] = useState('8:00')
  const [workStartPeriod, setWorkStartPeriod] = useState<'AM' | 'PM'>('AM')
  const [workEndTime, setWorkEndTime] = useState('4:00')
  const [workEndPeriod, setWorkEndPeriod] = useState<'PM' | 'AM'>('PM')
  const [workingDays, setWorkingDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [diseasesTreated, setDiseasesTreated] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!authLoading && !isDoctor) { router.push('/'); return }
    if (doctorData) {
      setBio(doctorData.bio || '')
      setCity(doctorData.city || '')
      setClinicAddress(doctorData.clinic_address || '')
      setSpecialization(doctorData.specialization || '')
      const parseTime12 = (t: string | null, fallbackH: number, fallbackP: 'AM' | 'PM') => {
        if (!t) return { time: `${fallbackH}:00`, period: fallbackP }
        const parts = t.split(':')
        let h = parseInt(parts[0])
        const m = parts[1] || '00'
        const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
        if (h === 0) h = 12
        else if (h > 12) h -= 12
        return { time: `${h}:${m}`, period }
      }
      const start12 = parseTime12(doctorData.working_hours_start, 8, 'AM')
      const end12 = parseTime12(doctorData.working_hours_end, 4, 'PM')
      setWorkStartTime(start12.time)
      setWorkStartPeriod(start12.period)
      setWorkEndTime(end12.time)
      setWorkEndPeriod(end12.period)
      setWorkingDays(doctorData.working_days || [0, 1, 2, 3, 4])
      setDiseasesTreated(doctorData.diseases_treated?.join('، ') || '')
      setIsActive(doctorData.is_active || false)
      fetchAppointments()
    }
  }, [isDoctor, doctorData, authLoading])

  const fetchAppointments = async () => {
    if (!doctorData) return
    const { data } = await supabase.from('appointments').select('*')
      .eq('doctor_id', doctorData.id).order('appointment_date', { ascending: true })
    setAppointments(data || [])
    setLoading(false)
  }

  const handleAppointmentAction = async (id: string, status: 'confirmed' | 'rejected') => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return }
    const apt = appointments.find((a) => a.id === id)
    if (apt) {
      const dateObj = new Date(apt.appointment_date + 'T00:00:00')
      const dayName = dayNames[dateObj.getDay()]
      const timeStr = apt.appointment_time?.slice(0, 5)
      const notifMessage = status === 'confirmed'
        ? `تم تأكيد الحجز - يوم ${dayName} بتاريخ ${apt.appointment_date} الساعة ${timeStr}`
        : `تم رفض موعدك مع ${doctorData?.full_name} بتاريخ ${apt.appointment_date}`
      await supabase.from('notifications').insert({
        user_id: apt.patient_id,
        title: status === 'confirmed' ? 'تم تأكيد الحجز' : 'تم رفض الموعد',
        message: notifMessage,
        type: 'booking',
      })
    }
    toast({ title: status === 'confirmed' ? 'تم تأكيد الموعد' : 'تم رفض الموعد' })
    fetchAppointments()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !doctorData) return
    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${doctorData.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('doctor-images').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('doctor-images').getPublicUrl(path)
      await supabase.from('doctors').update({ avatar_url: urlData.publicUrl }).eq('id', doctorData.id)
      toast({ title: 'تم تحديث الصورة' })
      refreshProfile()
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingImage(false)
    }
  }

  const to24h = (time: string, period: 'AM' | 'PM'): string => {
    const cleaned = time.replace(/\s/g, '')
    const parts = cleaned.split(':')
    let h = parseInt(parts[0]) || 0
    const m = parts.length > 1 ? parts[1].replace(/\D/g, '').padStart(2, '0') : '00'
    if (h < 1 || h > 12) h = Math.max(1, Math.min(12, h))
    if (period === 'AM' && h === 12) h = 0
    else if (period === 'PM' && h !== 12) h += 12
    return `${h.toString().padStart(2, '0')}:${m.slice(0, 2)}:00`
  }

  const saveSettings = async () => {
    if (!doctorData) return
    const { error } = await supabase.from('doctors').update({
      bio, city, clinic_address: clinicAddress, specialization,
      working_hours_start: to24h(workStartTime, workStartPeriod),
      working_hours_end: to24h(workEndTime, workEndPeriod),
      working_days: workingDays,
      diseases_treated: diseasesTreated.split('،').map((d) => d.trim()).filter(Boolean),
      is_active: isActive,
    }).eq('id', doctorData.id)
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }) }
    else { toast({ title: 'تم حفظ الإعدادات' }); refreshProfile() }
  }

  const toggleDay = (day: number) => {
    setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  const fetchSlots = async (day: number) => {
    if (!doctorData) return
    const { data } = await supabase.from('doctor_slots').select('id, day_of_week, slot_time')
      .eq('doctor_id', doctorData.id).eq('day_of_week', day).order('slot_time')
    setExistingSlots(data || [])
  }

  const openSlotModal = () => {
    setShowSlotModal(true)
    setPendingSlots([])
    setSlotDay(0)
    fetchSlots(0)
  }

  const handleSlotDayChange = (day: number) => {
    setSlotDay(day)
    setPendingSlots([])
    fetchSlots(day)
  }

  const addPendingSlot = () => {
    if (pendingSlots.includes(newSlotTime) || existingSlots.some(s => s.slot_time.slice(0, 5) === newSlotTime)) {
      toast({ title: 'هذا الوقت موجود بالفعل', variant: 'destructive' }); return
    }
    setPendingSlots(prev => [...prev, newSlotTime].sort())
  }

  const deleteExistingSlot = async (slotId: string) => {
    await supabase.from('doctor_slots').delete().eq('id', slotId)
    fetchSlots(slotDay)
    toast({ title: 'تم حذف الموعد' })
  }

  const saveSlots = async () => {
    if (!doctorData || pendingSlots.length === 0) return
    setSavingSlots(true)
    const rows = pendingSlots.map(time => ({
      doctor_id: doctorData.id,
      day_of_week: slotDay,
      slot_time: time.length === 5 ? `${time}:00` : time,
    }))
    const { error } = await supabase.from('doctor_slots').insert(rows)
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'تم حفظ المواعيد بنجاح' })
      setPendingSlots([])
      fetchSlots(slotDay)
    }
    setSavingSlots(false)
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-muted text-muted-foreground' }
    const labels: Record<string, string> = { pending: 'بانتظار التأكيد', confirmed: 'مؤكد', rejected: 'مرفوض', cancelled: 'ملغى' }
    return <span className={`px-3 py-1 rounded-full text-xs font-body ${styles[status]}`}>{labels[status]}</span>
  }

  const avatarUrl = doctorData?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${doctorData?.full_name}&backgroundColor=0055A0&textColor=ffffff`

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <BackButton />

          <div className="premium-card mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-accent border-4 border-primary/10">
                <img src={avatarUrl} alt={doctorData?.full_name} className="w-full h-full object-cover" />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{doctorData?.full_name}</h1>
              <p className="font-body text-muted-foreground">{doctorData?.specialization}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            <button onClick={() => setTab('appointments')}
              className={`px-6 py-2 rounded-xl font-body text-sm transition-colors ${tab === 'appointments' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              <Calendar className="w-4 h-4 inline ml-1" /> المواعيد
            </button>
            <button onClick={() => setTab('settings')}
              className={`px-6 py-2 rounded-xl font-body text-sm transition-colors ${tab === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              <Settings className="w-4 h-4 inline ml-1" /> الإعدادات
            </button>
          </div>

          {tab === 'appointments' && (
            <div className="space-y-4">
              <button onClick={openSlotModal}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" /> إضافة مواعيد
              </button>
              {loading ? (
                <p className="text-center text-muted-foreground">جاري التحميل...</p>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
                  <p className="font-body text-muted-foreground">لا توجد مواعيد</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="premium-card flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-heading font-semibold">{apt.patient_name}</p>
                      <p className="font-body text-sm text-muted-foreground">{apt.patient_phone}</p>
                      <p className="font-body text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {apt.appointment_date}
                        <Clock className="w-3 h-3 mr-2" /> {apt.appointment_time?.slice(0, 5)}
                      </p>
                      {statusBadge(apt.status)}
                    </div>
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAppointmentAction(apt.id, 'confirmed')}
                          className="px-4 py-2 rounded-xl bg-green-600 text-primary-foreground font-body text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" /> تأكيد
                        </button>
                        <button onClick={() => handleAppointmentAction(apt.id, 'rejected')}
                          className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-body text-sm flex items-center gap-1">
                          <X className="w-4 h-4" /> رفض
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="premium-card space-y-5">
              <div className="flex items-center gap-3">
                <label className="font-body text-sm">الحالة:</label>
                <button onClick={() => setIsActive(!isActive)}
                  className={`px-4 py-1 rounded-full text-sm font-body transition-colors ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isActive ? 'نشط' : 'غير نشط'}
                </button>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">التخصص</label>
                <input className="premium-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">النبذة التعريفية</label>
                <textarea className="premium-input min-h-[80px]" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="اكتب نبذة عنك..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">المدينة</label>
                  <input className="premium-input" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">عنوان العيادة</label>
                  <input className="premium-input" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-2 block">أيام العمل</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((name, i) => (
                    <button key={i} onClick={() => toggleDay(i)}
                      className={`px-4 py-2 rounded-xl text-sm font-body transition-colors ${
                        workingDays.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                      }`}>{name}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">بداية الدوام</label>
                  <div className="flex gap-2">
                    <input className="premium-input flex-1" type="text" placeholder="8:00" value={workStartTime} onChange={(e) => setWorkStartTime(e.target.value)} dir="ltr" />
                    <select className="premium-input w-20" value={workStartPeriod} onChange={(e) => setWorkStartPeriod(e.target.value as 'AM' | 'PM')}>
                      <option value="AM">AM</option><option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">نهاية الدوام</label>
                  <div className="flex gap-2">
                    <input className="premium-input flex-1" type="text" placeholder="4:00" value={workEndTime} onChange={(e) => setWorkEndTime(e.target.value)} dir="ltr" />
                    <select className="premium-input w-20" value={workEndPeriod} onChange={(e) => setWorkEndPeriod(e.target.value as 'AM' | 'PM')}>
                      <option value="AM">AM</option><option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">الأمراض المعالجة (مفصولة بفاصلة)</label>
                <input className="premium-input" value={diseasesTreated} onChange={(e) => setDiseasesTreated(e.target.value)} placeholder="ارتفاع ضغط الدم، أمراض القلب، ..." />
              </div>
              <button onClick={saveSettings}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors">
                حفظ الإعدادات
              </button>
            </div>
          )}
        </div>

        {/* Slot Modal */}
        <Dialog open={showSlotModal} onOpenChange={setShowSlotModal}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-center">إضافة مواعيد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-2 block">اختر اليوم</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((name, i) => (
                    <button key={i} onClick={() => handleSlotDayChange(i)}
                      className={`px-3 py-2 rounded-xl text-xs font-body transition-colors ${
                        slotDay === i ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                      }`}>{name}</button>
                  ))}
                </div>
              </div>
              {existingSlots.length > 0 && (
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">المواعيد الحالية</label>
                  <div className="flex flex-wrap gap-2">
                    {existingSlots.map(slot => (
                      <div key={slot.id} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-xl text-sm font-body">
                        {slot.slot_time.slice(0, 5)}
                        <button onClick={() => deleteExistingSlot(slot.id)} className="hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="font-body text-sm text-muted-foreground mb-2 block">إضافة وقت جديد</label>
                <div className="flex gap-2">
                  <input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="premium-input flex-1" />
                  <button onClick={addPendingSlot} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-body text-sm hover:bg-accent/80 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> إضافة
                  </button>
                </div>
              </div>
              {pendingSlots.length > 0 && (
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">مواعيد جديدة (لم تُحفظ بعد)</label>
                  <div className="flex flex-wrap gap-2">
                    {pendingSlots.map(time => (
                      <div key={time} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-xl text-sm font-body">
                        {time}
                        <button onClick={() => setPendingSlots(prev => prev.filter(t => t !== time))} className="hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={saveSlots} disabled={savingSlots || pendingSlots.length === 0}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {savingSlots ? 'جاري الحفظ...' : 'حفظ المواعيد'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  )
}
