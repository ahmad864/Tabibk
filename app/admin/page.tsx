'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import BackButton from '@/components/back-button'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Shield, Check, X, Clock, Users, Activity, Bell, Trash2, Star, LogOut, Eye, ZoomIn } from 'lucide-react'
import { DEMO_DOCTORS } from '@/lib/demoDoctors'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading, user, signOut } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'requests' | 'doctors' | 'notifications'>('requests')
  const [detailRequest, setDetailRequest] = useState<any>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) { router.push('/'); return }
    if (isAdmin) fetchAll()
  }, [isAdmin, authLoading])

  const fetchAll = async () => {
    const [reqRes, docRes] = await Promise.all([
      supabase.from('doctor_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('doctors').select('*').order('created_at', { ascending: false }),
    ])
    setRequests(reqRes.data || [])
    // دمج الأطباء التجريبيين مع أطباء Supabase
    const supabaseIds = new Set((docRes.data || []).map((d: any) => d.id))
    const demoDocs = DEMO_DOCTORS.filter((d) => !supabaseIds.has(d.id)).map((d) => ({ ...d, _isDemo: true }))
    setDoctors([...(docRes.data || []), ...demoDocs])
    if (user) {
      const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setNotifications(notifData || [])
    }
    setLoading(false)
  }

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      if (action === 'approved') {
        const { data, error } = await supabase.functions.invoke('approve-doctor', {
          body: { requestId: id, action: 'approved' },
        })
        if (error) throw error
        if (data?.error) throw new Error(data.error)
      } else {
        const { error } = await supabase.from('doctor_requests').update({ status: 'rejected', reviewed_by: user?.id }).eq('id', id)
        if (error) throw error
      }
      toast({ title: action === 'approved' ? 'تم قبول الطلب وإنشاء حساب الطبيب' : 'تم رفض الطلب' })
      setDetailRequest(null)
      fetchAll()
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' })
    }
  }

  const deleteDoctor = async (id: string) => {
    const doc = doctors.find((d: any) => d.id === id)
    if (doc?._isDemo) {
      toast({ title: 'لا يمكن حذف الطبيب التجريبي', variant: 'destructive' }); return
    }
    const { error } = await supabase.from('doctors').delete().eq('id', id)
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'تم حذف الطبيب' })
      fetchAll()
    }
  }

  const toggleDoctorActive = async (id: string, current: boolean) => {
    const doc = doctors.find((d: any) => d.id === id)
    if (doc?._isDemo) {
      setDoctors((prev: any[]) => prev.map((d) => d.id === id ? { ...d, is_active: !current } : d))
      toast({ title: !current ? 'تم تفعيل الطبيب' : 'تم تعطيل الطبيب' }); return
    }
    await supabase.from('doctors').update({ is_active: !current }).eq('id', id)
    toast({ title: !current ? 'تم تفعيل الطبيب' : 'تم تعطيل الطبيب' })
    fetchAll()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const doc = doctors.find((d: any) => d.id === id)
    if (doc?._isDemo) {
      setDoctors((prev: any[]) => prev.map((d) => d.id === id ? { ...d, is_featured: !current } : d))
      toast({ title: !current ? 'تم تمييز الطبيب' : 'تم إلغاء التمييز' }); return
    }
    await supabase.from('doctors').update({ is_featured: !current }).eq('id', id)
    toast({ title: !current ? 'تم تمييز الطبيب' : 'تم إلغاء التمييز' })
    fetchAll()
  }

  const markNotifRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }
    const labels: Record<string, string> = { pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض' }
    return <span className={`px-3 py-1 rounded-full text-xs font-body ${map[status] || ''}`}>{labels[status] || status}</span>
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const approvedDoctors = doctors.filter((d) => d.is_approved)
  const activeDoctors = doctors.filter((d) => d.is_active)
  const featuredDoctors = doctors.filter((d) => d.is_featured)

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="section-padding">
        <div className="container mx-auto max-w-5xl">
          <BackButton />
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              لوحة الإدارة
            </h1>
            <button onClick={async () => { await signOut(); router.push('/') }}
              className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-body text-sm hover:bg-destructive/90 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="premium-card text-center">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <p className="font-heading text-2xl font-bold">{pendingRequests.length}</p>
              <p className="font-body text-xs text-muted-foreground">طلبات معلقة</p>
            </div>
            <div className="premium-card text-center">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="font-heading text-2xl font-bold">{approvedDoctors.length}</p>
              <p className="font-body text-xs text-muted-foreground">أطباء مقبولون</p>
            </div>
            <div className="premium-card text-center">
              <Activity className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="font-heading text-2xl font-bold">{activeDoctors.length}</p>
              <p className="font-body text-xs text-muted-foreground">أطباء نشطون</p>
            </div>
            <div className="premium-card text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="font-heading text-2xl font-bold">{featuredDoctors.length}</p>
              <p className="font-body text-xs text-muted-foreground">أطباء مميزون</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => setTab('requests')}
              className={`px-5 py-2 rounded-xl font-body text-sm transition-colors ${tab === 'requests' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              طلبات الأطباء ({pendingRequests.length})
            </button>
            <button onClick={() => setTab('doctors')}
              className={`px-5 py-2 rounded-xl font-body text-sm transition-colors ${tab === 'doctors' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              الأطباء ({approvedDoctors.length})
            </button>
            <button onClick={() => setTab('notifications')}
              className={`px-5 py-2 rounded-xl font-body text-sm transition-colors ${tab === 'notifications' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              <Bell className="w-4 h-4 inline ml-1" /> الإشعارات
            </button>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground font-body">جاري التحميل...</p>
          ) : (
            <>
              {tab === 'requests' && (
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-16">
                      <Clock className="w-16 h-16 text-muted mx-auto mb-4" />
                      <p className="font-body text-muted-foreground">لا توجد طلبات</p>
                    </div>
                  ) : (
                    requests.map((req) => (
                      <div key={req.id} className="premium-card">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-heading font-semibold text-lg">{req.full_name}</h3>
                              {statusBadge(req.status)}
                            </div>
                            <p className="font-body text-sm text-muted-foreground">التخصص: {req.specialization}</p>
                            <p className="font-body text-sm text-muted-foreground">الهاتف: {req.phone}</p>
                            <p className="font-body text-xs text-muted-foreground mt-2">{new Date(req.created_at).toLocaleDateString('ar-SY')}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setDetailRequest(req)}
                              className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-body text-sm hover:bg-accent/80 transition-colors flex items-center gap-1">
                              <Eye className="w-4 h-4" /> عرض التفاصيل
                            </button>
                            {req.status === 'pending' && (
                              <>
                                <button onClick={() => handleAction(req.id, 'approved')}
                                  className="px-4 py-2 rounded-xl bg-green-600 text-white font-body text-sm hover:bg-green-700 transition-colors flex items-center gap-1">
                                  <Check className="w-4 h-4" /> قبول
                                </button>
                                <button onClick={() => handleAction(req.id, 'rejected')}
                                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground font-body text-sm hover:bg-destructive/90 transition-colors flex items-center gap-1">
                                  <X className="w-4 h-4" /> رفض
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'doctors' && (
                <div className="space-y-4">
                  {approvedDoctors.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-muted mx-auto mb-4" />
                      <p className="font-body text-muted-foreground">لا يوجد أطباء</p>
                    </div>
                  ) : (
                    approvedDoctors.map((doc) => (
                      <div key={doc.id} className="premium-card flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold">{doc.full_name}</h3>
                            {doc.is_featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-body bg-yellow-100 text-yellow-800 border border-yellow-300">مميز</span>
                            )}
                          </div>
                          <p className="font-body text-sm text-muted-foreground">{doc.specialization} - {doc.phone}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-body mt-1 ${doc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {doc.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleFeatured(doc.id, doc.is_featured)}
                            className={`px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1 transition-colors ${
                              doc.is_featured ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-accent text-accent-foreground hover:bg-accent/80'
                            }`}>
                            <Star className="w-3 h-3" />
                            {doc.is_featured ? 'إلغاء التمييز' : 'تمييز'}
                          </button>
                          <button onClick={() => toggleDoctorActive(doc.id, doc.is_active)}
                            className={`px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1 transition-colors ${
                              doc.is_active ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}>
                            <Activity className="w-3 h-3" />
                            {doc.is_active ? 'تعطيل' : 'تفعيل'}
                          </button>
                          <button onClick={() => deleteDoctor(doc.id)}
                            className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive font-body text-xs flex items-center gap-1 hover:bg-destructive/20 transition-colors">
                            <Trash2 className="w-3 h-3" /> حذف
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'notifications' && (
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <Bell className="w-16 h-16 text-muted mx-auto mb-4" />
                      <p className="font-body text-muted-foreground">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`premium-card flex items-start gap-4 ${!n.is_read ? 'border-r-4 border-r-primary' : 'opacity-70'}`}>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground">{n.title}</h3>
                          <p className="font-body text-sm text-muted-foreground">{n.message}</p>
                          <p className="font-body text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('ar-SY')}</p>
                        </div>
                        {!n.is_read && (
                          <button onClick={() => markNotifRead(n.id)}
                            className="p-2 rounded-xl hover:bg-accent text-primary transition-colors">
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Detail Modal */}
      <Dialog open={!!detailRequest} onOpenChange={(o) => { if (!o) setDetailRequest(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          {detailRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">تفاصيل طلب الطبيب</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="font-body text-xs text-muted-foreground">الاسم الكامل</p><p className="font-heading font-semibold">{detailRequest.full_name}</p></div>
                  <div><p className="font-body text-xs text-muted-foreground">رقم الهاتف</p><p className="font-heading font-semibold" dir="ltr">{detailRequest.phone}</p></div>
                  <div><p className="font-body text-xs text-muted-foreground">التخصص</p><p className="font-heading font-semibold">{detailRequest.specialization}</p></div>
                  <div><p className="font-body text-xs text-muted-foreground">المدينة</p><p className="font-heading font-semibold">{detailRequest.city || '—'}</p></div>
                  <div className="col-span-2"><p className="font-body text-xs text-muted-foreground">عنوان العيادة</p><p className="font-heading font-semibold">{detailRequest.clinic_address || '—'}</p></div>
                  <div className="col-span-2"><p className="font-body text-xs text-muted-foreground">الحالة</p>{statusBadge(detailRequest.status)}</div>
                </div>
                {detailRequest.avatar_url && (
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2">صورة الملف الشخصي</p>
                    <div className="relative group">
                      <img src={detailRequest.avatar_url} alt="صورة الطبيب" className="w-full max-h-48 object-contain rounded-xl border border-border" />
                      <button onClick={() => setZoomImage(detailRequest.avatar_url)} className="absolute top-2 left-2 p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-md">
                        <ZoomIn className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  </div>
                )}
                {detailRequest.certificate_url && (
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2">الشهادة الطبية</p>
                    <div className="relative group">
                      <img src={detailRequest.certificate_url} alt="الشهادة الطبية" className="w-full max-h-48 object-contain rounded-xl border border-border" />
                      <button onClick={() => setZoomImage(detailRequest.certificate_url)} className="absolute top-2 left-2 p-2 rounded-xl bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-md">
                        <ZoomIn className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  </div>
                )}
                {detailRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleAction(detailRequest.id, 'approved')}
                      className="flex-1 py-3 rounded-xl bg-green-600 text-white font-heading font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> قبول الطلب
                    </button>
                    <button onClick={() => handleAction(detailRequest.id, 'rejected')}
                      className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-heading font-semibold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
                      <X className="w-5 h-5" /> رفض الطلب
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Zoom Modal */}
      <Dialog open={!!zoomImage} onOpenChange={(o) => { if (!o) setZoomImage(null) }}>
        <DialogContent className="max-w-4xl max-h-[95vh] p-2">
          {zoomImage && <img src={zoomImage} alt="صورة مكبرة" className="w-full h-full object-contain rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
