'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Shield } from 'lucide-react'
import { formatPhone } from '@/lib/demoAccounts'
import { useAuth, DEMO_USERS } from '@/context/auth-context'

interface AdminLoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const { demoLogin } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = () => {
    if (!phone) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم الهاتف', variant: 'destructive' }); return
    }
    setStep('otp')
    toast({ title: 'رمز التحقق', description: 'أدخل الرمز: 123456' })
  }

  const handleVerify = () => {
    if (otp !== '123456') {
      toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' }); return
    }

    const formatted = formatPhone(phone)
    const demo = DEMO_USERS[formatted]

    if (!demo) {
      toast({ title: 'خطأ', description: 'لا يوجد حساب بهذا الرقم', variant: 'destructive' }); return
    }

    if (demo.role !== 'admin') {
      toast({ title: 'غير مصرح', description: 'هذا الرقم ليس حساب إدارة. رقم الأدمن: 0999999999', variant: 'destructive' }); return
    }

    setLoading(true)
    const success = demoLogin(formatted)
    setLoading(false)

    if (success) {
      toast({ title: 'مرحباً بك في لوحة الإدارة' })
      onSuccess()
      onClose()
    } else {
      toast({ title: 'خطأ', description: 'تعذر تسجيل الدخول', variant: 'destructive' })
    }
  }

  const handleClose = () => {
    onClose(); setStep('phone'); setPhone(''); setOtp('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> دخول الإدارة
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">رقم الهاتف</label>
              <input className="premium-input" placeholder="09XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
              <p className="font-body text-xs text-muted-foreground mt-1">رقم الأدمن: 0999999999</p>
            </div>
            <button onClick={handleSendOTP} disabled={!phone} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              إرسال رمز التحقق
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-body text-sm text-muted-foreground text-center">أدخل الرمز: <strong>123456</strong></p>
            <input className="premium-input text-center text-2xl tracking-[0.5em]" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} dir="ltr" />
            <button onClick={handleVerify} disabled={loading || otp.length < 6} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
            <button onClick={() => setStep('phone')} className="w-full text-center font-body text-sm text-primary hover:underline">← رجوع</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
