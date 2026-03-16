'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { isDemoDoctor, getDemoSlotsForDay } from '@/lib/demoDoctors'
import { addDemoBooking, getDemoBookedSlotsForDate } from '@/lib/demoBookings'

interface BookingModalProps { open: boolean; onClose: () => void; doctor: any }
const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default function BookingModal({ open, onClose, doctor }: BookingModalProps) {
  const { user, profile } = useAuth()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (selectedDate && doctor) {
      loadSlots()
      loadBookedSlots()
    }
  }, [selectedDate, doctor])

  const loadSlots = async () => {
    if (!doctor || !selectedDate) return
    const dayOfWeek = new Date(selectedDate).getDay()
    if (isDemoDoctor(doctor.id)) {
      setAvailableSlots(getDemoSlotsForDay(dayOfWeek))
      return
    }
    const { data } = await supabase
      .from('doctor_slots').select('slot_time')
      .eq('doctor_id', doctor.id).eq('day_of_week', dayOfWeek).order('slot_time')
    setAvailableSlots(data?.map((s: any) => s.slot_time.slice(0, 5)) || [])
  }

  const loadBookedSlots = async () => {
    if (!doctor || !selectedDate) return
    if (isDemoDoctor(doctor.id)) {
      setBookedSlots(getDemoBookedSlotsForDate(doctor.id, selectedDate))
      return
    }
    const { data } = await supabase
      .from('appointments').select('appointment_time')
      .eq('doctor_id', doctor.id).eq('appointment_date', selectedDate)
      .in('status', ['pending', 'confirmed'])
    setBookedSlots(data?.map((a: any) => a.appointment_time.slice(0, 5)) || [])
  }

  const getAvailableDates = () => {
    if (!doctor) return []
    const dates: string[] = []
    const workingDays = doctor.working_days || [0, 1, 2, 3, 4]
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      if (workingDays.includes(d.getDay())) dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const handleBook = async () => {
    if (!user || !profile || !selectedDate || !selectedTime) return
    setLoading(true)
    try {
      if (isDemoDoctor(doctor.id)) {
        // ===== حجز تجريبي =====
        addDemoBooking({
          doctorId: doctor.id,
          doctorName: doctor.full_name,
          date: selectedDate,
          time: selectedTime,
          patientId: user.id,
          patientName: profile.full_name,
          patientPhone: profile.phone,
          status: 'pending',
        })
        // إشعار للمريض في Supabase
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'تم إرسال طلب الحجز',
          message: `تم إرسال طلب حجزك مع ${doctor.full_name} بتاريخ ${selectedDate} الساعة ${selectedTime}. في انتظار تأكيد الطبيب.`,
          type: 'booking',
        }).then(() => {}).catch(() => {})
        setSuccess(true)
        toast({ title: 'تم إرسال طلب الحجز!', description: 'في انتظار تأكيد الطبيب' })
        setLoading(false)
        return
      }

      // ===== حجز حقيقي =====
      const { error } = await supabase.from('appointments').insert({
        doctor_id: doctor.id, patient_id: user.id,
        patient_name: profile.full_name, patient_phone: profile.phone,
        appointment_date: selectedDate, appointment_time: selectedTime,
      })
      if (error) throw error
      if (doctor.user_id) {
        await supabase.from('notifications').insert({
          user_id: doctor.user_id, title: 'حجز جديد',
          message: `حجز جديد من ${profile.full_name} بتاريخ ${selectedDate} الساعة ${selectedTime}`,
          type: 'booking',
        })
      }
      await supabase.from('notifications').insert({
        user_id: user.id, title: 'تم إرسال طلب الحجز',
        message: `تم إرسال طلب حجزك مع ${doctor.full_name} بتاريخ ${selectedDate} الساعة ${selectedTime}. في انتظار تأكيد الطبيب.`,
        type: 'booking',
      })
      setSuccess(true)
      toast({ title: 'تم الحجز بنجاح!' })
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose(); setSuccess(false); setSelectedDate(''); setSelectedTime('')
    setAvailableSlots([]); setBookedSlots([])
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-md" dir="rtl">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">تم إرسال طلب الحجز</h3>
            <p className="font-body text-muted-foreground mb-1">الموعد: {selectedDate} الساعة {selectedTime}</p>
            <p className="font-body text-sm text-muted-foreground">ستصلك إشعار عند تأكيد الطبيب</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl text-center">حجز موعد - {doctor?.full_name}</DialogTitle>
            </DialogHeader>
            {profile && (
              <div className="bg-accent rounded-xl p-3 mb-2">
                <p className="font-body text-sm"><strong>الاسم:</strong> {profile.full_name}</p>
                <p className="font-body text-sm"><strong>الهاتف:</strong> {profile.phone}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> اختر التاريخ
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {getAvailableDates().map((date) => {
                    const d = new Date(date)
                    return (
                      <button key={date}
                        onClick={() => { setSelectedDate(date); setSelectedTime('') }}
                        className={`p-2 rounded-xl text-xs font-body transition-colors ${
                          selectedDate === date ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-primary/10'
                        }`}>
                        {dayNames[d.getDay()]}<br />{date.slice(5)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> اختر الوقت
                  </label>
                  {availableSlots.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground text-center py-4">لا توجد مواعيد متاحة لهذا اليوم</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto">
                      {availableSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot)
                        return (
                          <button key={slot} disabled={isBooked}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-2 rounded-xl text-sm font-body transition-colors ${
                              isBooked ? 'bg-destructive/10 text-destructive line-through cursor-not-allowed'
                                : selectedTime === slot ? 'bg-primary text-primary-foreground'
                                : 'bg-accent hover:bg-primary/10'
                            }`}>
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleBook} disabled={loading || !selectedDate || !selectedTime}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
