'use client'

import { useState } from 'react'
import { Send, Phone, Mail, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) { toast.error('يرجى ملء جميع الحقول'); return }
    toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.')
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <section className="section-padding bg-muted/30" id="contact">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">اتصل بنا</h2>
          <p className="font-body text-muted-foreground">نسعد بتواصلك معنا في أي وقت</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="premium-card space-y-4">
            <div>
              <label className="block font-body text-sm text-foreground mb-1.5">الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="أدخل اسمك الكامل" className="premium-input" />
            </div>
            <div>
              <label className="block font-body text-sm text-foreground mb-1.5">رقم الهاتف</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09XX XXX XXX" className="premium-input" dir="ltr" />
            </div>
            <div>
              <label className="block font-body text-sm text-foreground mb-1.5">الرسالة</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." className="premium-input min-h-[100px] resize-none" rows={4} />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md">
              <Send className="w-4 h-4" /> إرسال الرسالة
            </button>
          </form>
          <div className="space-y-6">
            <div className="premium-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary" /></div>
              <div><p className="font-body text-sm text-muted-foreground">الهاتف</p><p className="font-heading font-semibold text-foreground" dir="ltr">+963 999 000 000</p></div>
            </div>
            <div className="premium-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-primary" /></div>
              <div><p className="font-body text-sm text-muted-foreground">البريد الإلكتروني</p><p className="font-heading font-semibold text-foreground">info@tabibak.sy</p></div>
            </div>
            <div className="premium-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
              <div><p className="font-body text-sm text-muted-foreground">الموقع</p><p className="font-heading font-semibold text-foreground">دمشق - سوريا</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
