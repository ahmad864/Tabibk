import { supabase } from '@/integrations/supabase/client'
import { updateDemoBookingStatus } from '@/lib/demoBookings'

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface ActionParams {
  appointmentId: string
  isDemo: boolean
  status: 'confirmed' | 'rejected'
  doctorName: string
  /** معرّف إشعار "حجز جديد" الأصلي عند الطبيب، لتحديث حالته بعد اتخاذ القرار */
  sourceNotificationId?: string
}

/**
 * يقبل أو يرفض حجزًا (حقيقي أو تجريبي)، ويرسل للمريض إشعارًا تفصيليًا،
 * ويحدّث حالة إشعار الطبيب الأصلي حتى تختفي أزرار القبول/الرفض بعد الاستخدام.
 */
export async function confirmOrRejectAppointment({
  appointmentId, isDemo, status, doctorName, sourceNotificationId,
}: ActionParams): Promise<{ success: boolean; error?: string }> {
  let patientId: string | undefined
  let appointmentDate: string | undefined
  let appointmentTime: string | undefined

  if (isDemo) {
    const booking = updateDemoBookingStatus(appointmentId, status)
    if (!booking) return { success: false, error: 'لم يتم العثور على الحجز التجريبي (ربما فُتح من متصفح/تبويب آخر)' }
    patientId = booking.patientId
    appointmentDate = booking.date
    appointmentTime = booking.time
  } else {
    const { data, error } = await supabase.from('appointments')
      .update({ status }).eq('id', appointmentId).select().single()
    if (error) return { success: false, error: error.message }
    patientId = data.patient_id
    appointmentDate = data.appointment_date
    appointmentTime = data.appointment_time?.slice(0, 5)
  }

  if (patientId) {
    const dateObj = new Date(appointmentDate + 'T00:00:00')
    const dayName = dayNames[dateObj.getDay()]
    const title = status === 'confirmed' ? '🎉 تم حجز موعدك بنجاح' : '❌ تم رفض موعدك'
    const message = status === 'confirmed'
      ? `تم تأكيد موعدك مع ${doctorName} يوم ${dayName} بتاريخ ${appointmentDate} الساعة ${appointmentTime}.`
      : `نعتذر، تم رفض طلب حجزك مع ${doctorName} بتاريخ ${appointmentDate}. يمكنك اختيار موعد آخر.`
    const { error: notifErr } = await supabase.from('notifications').insert({
      user_id: patientId, title, message, type: 'booking',
    })
    if (notifErr) console.error('patient notification failed:', notifErr.message)
  }

  if (sourceNotificationId) {
    const { error: updateErr } = await supabase.from('notifications')
      .update({ action_status: status === 'confirmed' ? 'accepted' : 'rejected', is_read: true })
      .eq('id', sourceNotificationId)
    if (updateErr) console.error('notification action_status update failed:', updateErr.message)
  }

  return { success: true }
}
