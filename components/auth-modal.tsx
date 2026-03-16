'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { User, Stethoscope, Upload, LogIn, UserPlus, CheckCircle } from 'lucide-react'
import { formatPhone } from '@/lib/demoAccounts'

// ===== حسابات تجريبية محلية - تعمل بـ signInWithPassword مباشرة =====
const DEMO_ACCOUNTS: Record<string, { name: string; role: string; email: string; password: string }> = {
  '+963999999999': { name: 'Admin Test',    role: 'admin',   email: 'admin@demo.tabibak.local',   password: 'Demo@TabibakX9!' },
  '+963988888888': { name: 'د. أحمد محمد', role: 'doctor',  email: 'ahmad@demo.tabibak.local',   password: 'Demo@TabibakX9!' },
  '+963977777777': { name: 'Patient Demo',  role: 'patient', email: 'patient@demo.tabibak.local', password: 'Demo@TabibakX9!' },
  '+963966666666': { name: 'د. سارة علي',  role: 'doctor',  email: 'sara@demo.tabibak.local',    password: 'Demo@TabibakX9!' },
  '+963955555555': { name: 'د. علي حسن',   role: 'doctor',  email: 'ali@demo.tabibak.local',     password: 'Demo@TabibakX9!' },
  '+963944444444': { name: 'د. ليلى كريم', role: 'doctor',  email: 'layla@demo.tabibak.local',   password: 'Demo@TabibakX9!' },
  '+963933333333': { name: 'د. عمر يوسف',  role: 'doctor',  email: 'omar@demo.tabibak.local',    password: 'Demo@TabibakX9!' },
  '+963922222222': { name: 'د. هاني سعد',  role: 'doctor',  email: 'hani@demo.tabibak.local',    password: 'Demo@TabibakX9!' },
}

const isDemoPhone = (phone: string) => phone in DEMO_ACCOUNTS
const getDemoAccount = (phone: string) => DEMO_ACCOUNTS[phone] || null

interface AuthModalProps {
  open: boolean
  onClose: () => void
  defaultRole?: 'patient' | 'doctor'
  defaultMode?: 'login' | 'register'
}

const specializations = [
  'طب قلبية', 'جهاز هضمي', 'طب أعصاب', 'طب أطفال',
  'طب جلدية', 'طب عظمية', 'طب عيون', 'طب باطنية', 'طب نسائية',
]

type Step = 'choose-action' | 'login' | 'choose-role' | 'patient' | 'doctor' | 'otp' | 'doctor-success'

export default function AuthModal({ open, onClose, defaultRole, defaultMode }: AuthModalProps) {
  const getInitialStep = (): Step => {
    if (defaultMode === 'login') return 'login'
    if (defaultRole === 'doctor') return 'doctor'
    if (defaultRole === 'patient') return 'patient'
    return 'choose-action'
  }

  const [step, setStep] = useState<Step>(getInitialStep())
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [city, setCity] = useState('')
  const [clinicAddress, setClinicAddress] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingRole, setPendingRole] = useState<'patient' | 'doctor'>('patient')
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  const validatePhone = (p: string) => {
    const cleaned = p.replace(/\D/g, '')
    return /^09\d{8}$/.test(cleaned) || /^963\d{9}$/.test(cleaned) || /^\+963\d{9}$/.test(p)
  }

  const validateDoctorFields = () => {
    if (!fullName.trim()) { toast({ title: 'خطأ', description: 'يرجى إدخال الاسم الكامل', variant: 'destructive' }); return false }
    if (!specialization) { toast({ title: 'خطأ', description: 'يرجى اختيار التخصص', variant: 'destructive' }); return false }
    if (!phone.trim() || !validatePhone(phone)) { toast({ title: 'خطأ', description: 'يرجى إدخال رقم هاتف سوري صحيح (09XXXXXXXX)', variant: 'destructive' }); return false }
    if (!city.trim()) { toast({ title: 'خطأ', description: 'يرجى إدخال المدينة', variant: 'destructive' }); return false }
    if (!clinicAddress.trim()) { toast({ title: 'خطأ', description: 'يرجى إدخال عنوان العيادة', variant: 'destructive' }); return false }
    if (!avatarFile) { toast({ title: 'خطأ', description: 'يرجى رفع صورة الملف الشخصي', variant: 'destructive' }); return false }
    if (!certificateFile) { toast({ title: 'خطأ', description: 'يرجى رفع الشهادة الطبية', variant: 'destructive' }); return false }
    return true
  }

  // ---- إرسال OTP: يذهب لشاشة OTP مباشرة بدون أي طلب خارجي ----
  const handleSendOTP = () => {
    if (!isLoginMode && pendingRole === 'doctor') {
      if (!validateDoctorFields()) return
    } else if (!isLoginMode && (!phone || !fullName)) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' }); return
    }
    if (isLoginMode && !phone) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم الهاتف', variant: 'destructive' }); return
    }
    if (!validatePhone(phone)) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم هاتف سوري صحيح (09XXXXXXXX)', variant: 'destructive' }); return
    }
    setStep('otp')
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  // ---- التحقق من OTP والدخول ----
  const handleVerifyOTP = async () => {
    if (otp !== '123456') {
      toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' }); return
    }

    setLoading(true)
    try {
      const formattedPhone = formatPhone(phone)

      // ---- تسجيل طبيب جديد → يرسل طلب وينتظر الموافقة ----
      if (!isLoginMode && pendingRole === 'doctor') {
        let avatarUrl: string | null = null
        let certUrl: string | null = null
        const uniqueId = crypto.randomUUID()
        if (avatarFile) {
          const ext = avatarFile.name.split('.').pop()
          avatarUrl = await uploadFile(avatarFile, 'doctor-images', `requests/${uniqueId}.${ext}`)
        }
        if (certificateFile) {
          const ext = certificateFile.name.split('.').pop()
          certUrl = await uploadFile(certificateFile, 'doctor-certificates', `requests/${uniqueId}.${ext}`)
        }
        await supabase.from('doctor_requests').insert({
          full_name: fullName, specialization, phone: formattedPhone,
          city, clinic_address: clinicAddress, avatar_url: avatarUrl, certificate_url: certUrl,
        })
        setStep('doctor-success')
        setLoading(false)
        return
      }

      // ---- تسجيل مريض جديد → الحساب التجريبي فقط ----
      if (!isLoginMode && pendingRole === 'patient') {
        const demoAcc = getDemoAccount(formattedPhone)
        if (demoAcc) {
          const { error } = await supabase.auth.signInWithPassword({ email: demoAcc.email, password: demoAcc.password })
          if (error) throw error
          toast({ title: 'مرحباً!', description: `أهلاً بك ${fullName || demoAcc.name}` })
          onClose(); resetForm(); return
        }
        toast({ title: 'خطأ', description: 'استخدم رقم 0977777777 للحساب التجريبي للمريض', variant: 'destructive' })
        setLoading(false); return
      }

      // ---- تسجيل الدخول ----
      if (isLoginMode) {
        const demoAcc = getDemoAccount(formattedPhone)
        if (demoAcc) {
          // تسجيل دخول مباشر بـ email/password
          const { error } = await supabase.auth.signInWithPassword({ email: demoAcc.email, password: demoAcc.password })
          if (error) {
            // إذا لم يكن الحساب موجوداً في Supabase، أنشئه تلقائياً
            if (error.message.includes('Invalid login credentials')) {
              toast({ title: 'خطأ', description: 'الحسابات التجريبية غير مفعّلة في Supabase. يرجى تشغيل seed-demo function.', variant: 'destructive' })
            } else {
              toast({ title: 'خطأ في التحقق', description: error.message, variant: 'destructive' })
            }
            setLoading(false); return
          }
          toast({ title: 'مرحباً!', description: `أهلاً بك ${demoAcc.name}` })
          onClose(); resetForm(); return
        }

        // طبيب مقبول من الإدارة (غير تجريبي)
        const { data: doctorData } = await supabase
          .from('doctors').select('is_approved, user_id, full_name')
          .eq('phone', formattedPhone).eq('is_approved', true).single()
        if (doctorData?.user_id) {
          const email = `doctor_${formattedPhone.replace('+', '')}@tabibak.local`
          const { error } = await supabase.auth.signInWithPassword({ email, password: 'Doctor@Tabibak2024!' })
          if (error) {
            toast({ title: 'خطأ', description: 'تعذر تسجيل الدخول. يرجى المحاولة لاحقاً.', variant: 'destructive' })
            setLoading(false); return
          }
          toast({ title: 'مرحباً!', description: `أهلاً بك ${doctorData.full_name}` })
          onClose(); resetForm(); return
        }

        // تحقق من طلب قيد المراجعة
        const { data: requestData } = await supabase
          .from('doctor_requests').select('status')
          .eq('phone', formattedPhone)
          .order('created_at', { ascending: false }).limit(1).single()
        if (requestData?.status === 'pending') {
          toast({ title: 'طلبك قيد المراجعة', description: 'طلبك قيد المراجعة من قبل الإدارة', variant: 'destructive' })
          setLoading(false); return
        }
        if (requestData?.status === 'rejected') {
          toast({ title: 'تم رفض الطلب', description: 'تم رفض طلب تسجيلك. يرجى التواصل مع الإدارة.', variant: 'destructive' })
          setLoading(false); return
        }

        toast({ title: 'خطأ', description: 'لا يوجد حساب بهذا الرقم', variant: 'destructive' })
        setLoading(false); return
      }

    } catch (err: any) {
      toast({ title: 'خطأ في التحقق', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(getInitialStep()); setPhone(''); setFullName(''); setSpecialization('')
    setCity(''); setClinicAddress(''); setOtp(''); setIsLoginMode(false)
    setAvatarFile(null); setCertificateFile(null)
  }

  const isDoctorFormValid = fullName.trim() && specialization && phone.trim() && city.trim() && clinicAddress.trim() && avatarFile && certificateFile

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent className="max-w-md" dir="rtl">

        {step === 'choose-action' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">مرحباً بك في طبيبك</DialogTitle></DialogHeader>
            <p className="font-body text-sm text-muted-foreground text-center mb-4">سجل دخولك أو أنشئ حساباً جديداً</p>
            <div className="space-y-3">
              <button onClick={() => { setIsLoginMode(true); setStep('login') }} className="w-full premium-card flex items-center gap-3 cursor-pointer hover:border-primary border-2 border-transparent transition-colors">
                <LogIn className="w-8 h-8 text-primary" />
                <div className="text-right"><span className="font-heading font-semibold block">تسجيل الدخول</span><span className="font-body text-xs text-muted-foreground">لديك حساب بالفعل</span></div>
              </button>
              <button onClick={() => { setIsLoginMode(false); setStep('choose-role') }} className="w-full premium-card flex items-center gap-3 cursor-pointer hover:border-primary border-2 border-transparent transition-colors">
                <UserPlus className="w-8 h-8 text-primary" />
                <div className="text-right"><span className="font-heading font-semibold block">إنشاء حساب</span><span className="font-body text-xs text-muted-foreground">حساب جديد كمريض أو طبيب</span></div>
              </button>
            </div>
          </>
        )}

        {step === 'login' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">تسجيل الدخول</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">رقم الهاتف</label>
                <input className="premium-input" placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
                <p className="font-body text-xs text-muted-foreground mt-1">صيغة سورية: 09XXXXXXXX</p>
              </div>
              <button onClick={handleSendOTP} disabled={!phone} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                إرسال رمز التحقق
              </button>
              <button onClick={() => setStep('choose-action')} className="w-full text-center font-body text-sm text-primary hover:underline">← رجوع</button>
            </div>
          </>
        )}

        {step === 'choose-role' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">إنشاء حساب</DialogTitle></DialogHeader>
            <p className="font-body text-sm text-muted-foreground text-center mb-4">اختر نوع الحساب</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setPendingRole('patient'); setStep('patient') }} className="premium-card flex flex-col items-center gap-3 p-6 cursor-pointer hover:border-primary border-2 border-transparent">
                <User className="w-10 h-10 text-primary" /><span className="font-heading font-semibold">مريض</span>
              </button>
              <button onClick={() => { setPendingRole('doctor'); setStep('doctor') }} className="premium-card flex flex-col items-center gap-3 p-6 cursor-pointer hover:border-primary border-2 border-transparent">
                <Stethoscope className="w-10 h-10 text-primary" /><span className="font-heading font-semibold">طبيب</span>
              </button>
            </div>
            <button onClick={() => setStep('choose-action')} className="w-full text-center font-body text-sm text-primary hover:underline mt-3">← رجوع</button>
          </>
        )}

        {step === 'patient' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">حساب مريض</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">الاسم الكامل <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="أدخل اسمك الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">رقم الهاتف <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
                <p className="font-body text-xs text-muted-foreground mt-1">صيغة سورية: 09XXXXXXXX</p>
              </div>
              <button onClick={handleSendOTP} disabled={!phone || !fullName} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                إرسال رمز التحقق
              </button>
              <button onClick={() => setStep('choose-role')} className="w-full text-center font-body text-sm text-primary hover:underline">← رجوع</button>
            </div>
          </>
        )}

        {step === 'doctor' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">تسجيل طبيب</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">الاسم الكامل <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="د. ..." value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">التخصص <span className="text-destructive">*</span></label>
                <select className="premium-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                  <option value="">اختر التخصص</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">رقم الهاتف <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
                <p className="font-body text-xs text-muted-foreground mt-1">صيغة سورية: 09XXXXXXXX</p>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">المدينة <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="دمشق" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">عنوان العيادة <span className="text-destructive">*</span></label>
                <input className="premium-input" placeholder="عنوان العيادة" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">صورة الملف الشخصي <span className="text-destructive">*</span></label>
                <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="premium-input w-full flex items-center gap-2 cursor-pointer text-right">
                  {avatarFile ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-sm truncate">{avatarFile.name}</span></> : <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground text-sm">رفع الصورة</span></>}
                </button>
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">الشهادة الطبية <span className="text-destructive">*</span></label>
                <input type="file" accept="image/*,.pdf" ref={certInputRef} className="hidden" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => certInputRef.current?.click()} className="premium-input w-full flex items-center gap-2 cursor-pointer text-right">
                  {certificateFile ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="text-sm truncate">{certificateFile.name}</span></> : <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground text-sm">رفع الشهادة</span></>}
                </button>
              </div>
              <button onClick={handleSendOTP} disabled={!isDoctorFormValid} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                إرسال رمز التحقق
              </button>
              <button onClick={() => setStep('choose-role')} className="w-full text-center font-body text-sm text-primary hover:underline">← رجوع</button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <DialogHeader><DialogTitle className="font-heading text-xl text-center">رمز التحقق</DialogTitle></DialogHeader>
            <p className="font-body text-sm text-muted-foreground text-center">أدخل رمز التحقق المرسل إلى هاتفك</p>
            <div className="space-y-4">
              <input className="premium-input text-center text-2xl tracking-[0.5em]" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} dir="ltr" />
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </button>
            </div>
          </>
        )}

        {step === 'doctor-success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold mb-3">تم إرسال طلبك بنجاح</h3>
            <p className="font-body text-muted-foreground leading-relaxed">تم تسجيل طلبك، سنتواصل معك في حال تم قبولك.</p>
            <button onClick={() => { onClose(); resetForm() }} className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors">إغلاق</button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
