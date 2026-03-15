'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const reviews = [
  { name: 'محمد أحمد', rating: 5, comment: 'تجربة رائعة! حجزت موعدي بسهولة وسرعة. أنصح الجميع باستخدام طبيبك.' },
  { name: 'فاطمة علي', rating: 5, comment: 'منصة ممتازة وسهلة الاستخدام. الأطباء محترفون جداً.' },
  { name: 'خالد يوسف', rating: 4, comment: 'خدمة مميزة وحجز سريع. شكراً لفريق طبيبك.' },
  { name: 'نور الدين', rating: 5, comment: 'أفضل منصة لحجز المواعيد الطبية في سوريا. سهلة ومريحة.' },
  { name: 'ريم حسان', rating: 4, comment: 'تجربة جيدة جداً. أتمنى إضافة المزيد من الأطباء.' },
]

export default function ReviewsSlider() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % reviews.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">آراء المرضى</h2>
          <p className="font-body text-muted-foreground">ماذا يقول مرضانا عن تجربتهم</p>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }} className="premium-card text-center">
              <div className="flex items-center justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < reviews[current].rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                ))}
              </div>
              <p className="font-body text-foreground/80 text-lg mb-4 leading-relaxed">"{reviews[current].comment}"</p>
              <p className="font-heading font-semibold text-primary">{reviews[current].name}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-4 mt-6">
            <button onClick={() => setCurrent((c) => (c - 1 + reviews.length) % reviews.length)} className="p-2 rounded-full bg-accent hover:bg-accent/80 text-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={() => setCurrent((c) => (c + 1) % reviews.length)} className="p-2 rounded-full bg-accent hover:bg-accent/80 text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
