'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/integrations/supabase/client'
import { Bell, Check } from 'lucide-react'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/'); return }
    if (user) fetchNotifications()
  }, [user, authLoading])

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <BackButton />
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8 flex items-center gap-3"><Bell className="w-8 h-8 text-primary" />الإشعارات</h1>
          {loading ? (
            <p className="text-center text-muted-foreground font-body">جاري التحميل...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16"><Bell className="w-16 h-16 text-muted mx-auto mb-4" /><p className="font-body text-muted-foreground">لا توجد إشعارات</p></div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`premium-card flex items-start gap-4 ${!n.is_read ? 'border-r-4 border-r-primary' : 'opacity-70'}`}>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-foreground">{n.title}</h3>
                    <p className="font-body text-sm text-muted-foreground">{n.message}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('ar-SY')}</p>
                  </div>
                  {!n.is_read && <button onClick={() => markAsRead(n.id)} className="p-2 rounded-xl hover:bg-accent text-primary transition-colors"><Check className="w-5 h-5" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
