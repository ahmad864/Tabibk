'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Shield } from 'lucide-react'
import { isDemoPhone, getDemoAccount, DEMO_PASSWORD, formatPhone } from '@/lib/demoAccounts'

interface AdminLoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      if (isDemoPhone(formatted)) {
        setStep('otp')
        toast({ title: 'حساب تجريبي', description: 'أدخل الرمز: 123456' })
        setLoading(false); return
      }
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
      if (error) throw error
      setStep('otp')
      toast({ title: 'تم إرسال الرمز' })
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const formatted = formatPhone(phone)
      if (isDemoPhone(formatted)) {
        if (otp !== '123456') {
          toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' })
          setLoading(false); return
        }
        const demoAcc = getDemoAccount(formatted)!
        if (demoAcc.role !== 'admin') {
          toast({ title: 'غير مصرح', description: 'هذا الحساب ليس حساب إدارة', variant: 'destructive' })
          setLoading(false); return
        }
        const { error } = await supabase.auth.signInWithPassword({ email: demoAcc.email, password: DEMO_PASSWORD })
        if (error) throw error
        toast({ title: 'مرحباً بك في لوحة الإدارة' })
        onSuccess(); onClose(); setLoading(false); return
      }

      const { data, error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: 'sms' })
      if (error) throw error
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', data.user!.id).eq('role', 'admin').single()
      if (!roleData) {
        await supabase.auth.signOut()
        toast({ title: 'غير مصرح', description: 'هذا الحساب ليس حساب إدارة', variant: 'destructive' }); return
      }
      toast({ title: 'مرحباً بك في لوحة الإدارة' })
      onSuccess(); onClose()
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setStep('phone'); setPhone(''); setOtp('') } }}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> دخول الإدارة
          </DialogTitle>
        </DialogHeader>
        {step === 'phone' ? (
          <div className="space-y-4">
            <input className="premium-input" placeholder="+15005550001" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            <button onClick={handleSendOTP} disabled={loading || !phone} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input className="premium-input text-center text-2xl tracking-[0.5em]" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} dir="ltr" />
            <button onClick={handleVerify} disabled={loading || otp.length < 6} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
