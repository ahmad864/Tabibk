'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import AuthModal from './auth-modal'

const slides = [
  { image: '/hero-1.jpg', title: 'احجز موعدك الطبي بسهولة', subtitle: 'أسرع وأسهل طريقة لحجز موعدك مع أفضل الأطباء' },
  { image: '/hero-2.jpg', title: 'أفضل الأطباء المتخصصين', subtitle: 'نخبة من الأطباء المتخصصين بين يديك' },
  { image: '/hero-3.jpg', title: 'صحتك تبدأ بخطوة', subtitle: 'اعتنِ بصحتك واحجز موعدك الآن' },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [joinOpen, setJoinOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0">
            <img src={slides[current].image} alt={slides[current].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 hero-gradient opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 max-w-3xl">
                <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                  {slides[current].title}
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="font-body text-lg md:text-xl text-primary-foreground/80 mb-8">
                  {slides[current].subtitle}
                </motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="flex flex-wrap justify-center gap-4">
                  <Link href="/doctors" className="px-8 py-3 rounded-xl bg-primary-foreground text-primary font-heading font-semibold text-sm hover:bg-primary-foreground/90 transition-colors shadow-lg">احجز الآن</Link>
                  <button onClick={() => setJoinOpen(true)} className="px-8 py-3 rounded-xl border-2 border-primary-foreground text-primary-foreground font-heading font-semibold text-sm hover:bg-primary-foreground/10 transition-colors">انضم إلينا كطبيب</button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={() => setCurrent((c) => (c + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 text-primary-foreground transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? 'bg-primary-foreground w-8' : 'bg-primary-foreground/40'}`} />
          ))}
        </div>
      </section>
      <AuthModal open={joinOpen} onClose={() => setJoinOpen(false)} defaultRole="doctor" defaultMode="register" />
    </>
  )
}
