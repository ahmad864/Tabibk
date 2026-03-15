'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { useAuth } from '@/context/auth-context'
import { User, Phone, LogOut, Stethoscope } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, isDoctor, isAdmin, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/')
    if (!loading && isAdmin) router.push('/admin')
  }, [loading, user, isAdmin])

  if (loading || !profile) return <div className="min-h-screen"><Navbar /><div className="section-padding text-center text-muted-foreground">جاري التحميل...</div></div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto max-w-md">
          <BackButton />
          <div className="premium-card text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center"><User className="w-12 h-12 text-primary" /></div>
            <h1 className="font-heading text-2xl font-bold">{profile.full_name}</h1>
            <p className="font-body text-muted-foreground flex items-center justify-center gap-1 mt-1"><Phone className="w-4 h-4" /> {profile.phone}</p>
          </div>
          <div className="space-y-3">
            {isDoctor && (
              <button onClick={() => router.push('/doctor-dashboard')} className="w-full premium-card flex items-center gap-3 cursor-pointer hover:border-primary border-2 border-transparent transition-colors">
                <Stethoscope className="w-5 h-5 text-primary" /><span className="font-body">لوحة تحكم الطبيب</span>
              </button>
            )}
            <button onClick={async () => { await signOut(); router.push('/') }} className="w-full premium-card flex items-center gap-3 cursor-pointer hover:border-destructive border-2 border-transparent transition-colors text-destructive">
              <LogOut className="w-5 h-5" /><span className="font-body">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
