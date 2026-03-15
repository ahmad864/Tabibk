'use client'

import { useState } from 'react'
import { Search, Stethoscope, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/auth-context'

const symptomDatabase: Record<string, { illness: string; specialization: string }> = {
  'صداع': { illness: 'صداع توتري أو شقيقة', specialization: 'طبيب أعصاب' },
  'حرارة': { illness: 'التهاب فيروسي أو بكتيري', specialization: 'طبيب باطنية' },
  'ألم في المعدة': { illness: 'التهاب المعدة', specialization: 'طبيب جهاز هضمي' },
  'ألم في الصدر': { illness: 'مشاكل قلبية محتملة', specialization: 'طبيب قلبية' },
  'ضيق تنفس': { illness: 'مشاكل تنفسية', specialization: 'طبيب صدرية' },
  'ألم في الظهر': { illness: 'مشاكل في العمود الفقري', specialization: 'طبيب عظمية' },
  'ألم في المفاصل': { illness: 'التهاب مفاصل', specialization: 'طبيب عظمية' },
  'طفح جلدي': { illness: 'حساسية أو التهاب جلدي', specialization: 'طبيب جلدية' },
  'ألم في العين': { illness: 'التهاب أو مشاكل في العين', specialization: 'طبيب عيون' },
  'ألم في الأسنان': { illness: 'تسوس أو التهاب لثة', specialization: 'طبيب أسنان' },
}

export default function SymptomsAnalysis() {
  const { user } = useAuth()
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState<{ illness: string; specialization: string } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return
    setAnalyzing(true); setResult(null)
    setTimeout(async () => {
      let found: { illness: string; specialization: string } | null = null
      for (const [keyword, data] of Object.entries(symptomDatabase)) {
        if (symptoms.includes(keyword)) { found = data; break }
      }
      const finalResult = found || { illness: 'حالة تحتاج فحص طبي', specialization: 'طبيب باطنية' }
      setResult(finalResult); setAnalyzing(false)
      try {
        await supabase.from('symptom_logs').insert({
          symptoms: symptoms.trim(), matched_illness: finalResult.illness,
          matched_specialization: finalResult.specialization, patient_id: user?.id || null,
        })
      } catch (e) { /* silent */ }
    }, 1500)
  }

  return (
    <section className="section-padding bg-accent/30">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Stethoscope className="w-4 h-4" />
            <span className="font-body text-sm font-medium">تحليل الأعراض</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">اكتشف التخصص المناسب لحالتك</h2>
          <p className="font-body text-muted-foreground">أدخل الأعراض التي تشعر بها وسنساعدك في تحديد التخصص الطبي المناسب</p>
        </div>
        <div className="premium-card">
          <div className="relative mb-4">
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
              placeholder="اكتب الأعراض التي تشعر بها مثل: صداع، حرارة، ألم في المعدة..."
              className="premium-input min-h-[100px] resize-none" rows={3} />
          </div>
          <button onClick={analyzeSymptoms} disabled={analyzing || !symptoms.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md">
            {analyzing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Activity className="w-5 h-5" />
              </motion.div>
            ) : (<><Search className="w-5 h-5" /> تحليل الأعراض</>)}
          </button>
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-6 p-5 rounded-xl bg-accent border border-primary/20">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Activity className="w-5 h-5 text-primary" /></div>
                    <div><p className="font-body text-xs text-muted-foreground">المرض المحتمل</p><p className="font-heading font-semibold text-foreground">{result.illness}</p></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Stethoscope className="w-5 h-5 text-primary" /></div>
                    <div><p className="font-body text-xs text-muted-foreground">التخصص المناسب</p><p className="font-heading font-semibold text-primary">{result.specialization}</p></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
