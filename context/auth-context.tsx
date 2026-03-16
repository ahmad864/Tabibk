'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export const DEMO_USERS: Record<string, {
  id: string
  name: string
  phone: string
  role: 'admin' | 'doctor' | 'patient'
  doctorData?: any
}> = {
  '+963999999999': {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    name: 'Admin Test',
    phone: '+963999999999',
    role: 'admin',
  },
  '+963977777777': {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    name: 'Patient Demo',
    phone: '+963977777777',
    role: 'patient',
  },
  '+963988888888': {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'د. أحمد محمد', phone: '+963988888888', role: 'doctor',
    doctorData: { id: 'f02e7fa6-b9f4-4505-a70f-f9ef01d3dfb6', user_id: 'aaaaaaaa-0000-0000-0000-000000000002', full_name: 'د. أحمد محمد', specialization: 'طب قلبية', phone: '+963988888888', city: 'دمشق', clinic_address: 'شارع الحمراء', bio: 'أخصائي أمراض القلب والأوعية الدموية بخبرة 15 سنة', diseases_treated: ['أمراض القلب', 'ارتفاع ضغط الدم', 'تصلب الشرايين', 'قصور القلب'], is_approved: true, is_active: true, is_featured: true, rating: 4.8, rating_count: 24, working_hours_start: '08:00', working_hours_end: '16:00', working_days: [0,1,2,3,4], avatar_url: '/doctors/dr-ahmad.jpg' },
  },
  '+963966666666': {
    id: 'aaaaaaaa-0000-0000-0000-000000000004',
    name: 'د. سارة علي', phone: '+963966666666', role: 'doctor',
    doctorData: { id: '406a1a52-4c6a-4b76-b6d7-77389c58678e', user_id: 'aaaaaaaa-0000-0000-0000-000000000004', full_name: 'د. سارة علي', specialization: 'جهاز هضمي', phone: '+963966666666', city: 'حلب', clinic_address: 'شارع النيل', bio: 'متخصصة في أمراض الجهاز الهضمي والكبد بخبرة 10 سنوات', diseases_treated: ['قرحة المعدة', 'القولون العصبي', 'التهاب الكبد', 'ارتجاع المريء'], is_approved: true, is_active: true, is_featured: true, rating: 4.7, rating_count: 19, working_hours_start: '09:00', working_hours_end: '17:00', working_days: [0,1,2,3,4], avatar_url: '/doctors/dr-sara.jpg' },
  },
  '+963955555555': {
    id: 'aaaaaaaa-0000-0000-0000-000000000005',
    name: 'د. علي حسن', phone: '+963955555555', role: 'doctor',
    doctorData: { id: 'a61fa9ff-5a7e-40e3-b77b-04e6217774c3', user_id: 'aaaaaaaa-0000-0000-0000-000000000005', full_name: 'د. علي حسن', specialization: 'طب أعصاب', phone: '+963955555555', city: 'دمشق', clinic_address: 'ساحة الأمويين', bio: 'استشاري طب الأعصاب والدماغ بخبرة 12 سنة', diseases_treated: ['الصداع النصفي', 'الصرع', 'التصلب اللويحي', 'آلام الأعصاب'], is_approved: true, is_active: true, is_featured: true, rating: 4.9, rating_count: 31, working_hours_start: '08:00', working_hours_end: '15:00', working_days: [0,1,2,3,4], avatar_url: '/doctors/dr-ali.jpg' },
  },
  '+963944444444': {
    id: 'aaaaaaaa-0000-0000-0000-000000000006',
    name: 'د. ليلى كريم', phone: '+963944444444', role: 'doctor',
    doctorData: { id: '389912d5-2109-4258-9aaf-de3e987c249a', user_id: 'aaaaaaaa-0000-0000-0000-000000000006', full_name: 'د. ليلى كريم', specialization: 'طب أطفال', phone: '+963944444444', city: 'حمص', clinic_address: 'شارع الجامعة', bio: 'أخصائية طب الأطفال وحديثي الولادة بخبرة 8 سنوات', diseases_treated: ['أمراض الأطفال العامة', 'حساسية الأطفال', 'نمو وتطور الطفل'], is_approved: true, is_active: false, is_featured: true, rating: 4.6, rating_count: 15, working_hours_start: '10:00', working_hours_end: '18:00', working_days: [1,2,3,4,6], avatar_url: '/doctors/dr-layla.jpg' },
  },
  '+963933333333': {
    id: 'aaaaaaaa-0000-0000-0000-000000000007',
    name: 'د. عمر يوسف', phone: '+963933333333', role: 'doctor',
    doctorData: { id: '86613f43-7cc9-4f0e-ab50-1d14175bc4b8', user_id: 'aaaaaaaa-0000-0000-0000-000000000007', full_name: 'د. عمر يوسف', specialization: 'طب جلدية', phone: '+963933333333', city: 'اللاذقية', clinic_address: 'شارع بغداد', bio: 'أخصائي الأمراض الجلدية والتجميل بخبرة 10 سنوات', diseases_treated: ['حب الشباب', 'الأكزيما', 'الصدفية', 'أمراض الشعر'], is_approved: true, is_active: true, is_featured: false, rating: 4.5, rating_count: 18, working_hours_start: '09:00', working_hours_end: '17:00', working_days: [0,1,2,3,4], avatar_url: '/doctors/dr-omar.jpg' },
  },
  '+963922222222': {
    id: 'aaaaaaaa-0000-0000-0000-000000000008',
    name: 'د. هاني سعد', phone: '+963922222222', role: 'doctor',
    doctorData: { id: '38adc132-69cb-464d-a3dd-f3b269b95588', user_id: 'aaaaaaaa-0000-0000-0000-000000000008', full_name: 'د. هاني سعد', specialization: 'طب عظمية', phone: '+963922222222', city: 'دمشق', clinic_address: 'شارع المزة', bio: 'جراح عظام ومفاصل بخبرة 20 سنة', diseases_treated: ['كسور العظام', 'خشونة المفاصل', 'آلام الظهر', 'تمزق الأربطة'], is_approved: true, is_active: true, is_featured: false, rating: 4.7, rating_count: 27, working_hours_start: '08:00', working_hours_end: '14:00', working_days: [0,1,2,3,4], avatar_url: '/doctors/dr-hani.jpg' },
  },
  '+963911111111': {
    id: 'aaaaaaaa-0000-0000-0000-000000000009',
    name: 'د. رنا إبراهيم', phone: '+963911111111', role: 'doctor',
    doctorData: { id: 'da07e5f5-a3cb-489e-857a-1656ba40fd31', user_id: 'aaaaaaaa-0000-0000-0000-000000000009', full_name: 'د. رنا إبراهيم', specialization: 'طب نسائية', phone: '+963911111111', city: 'دمشق', clinic_address: 'شارع الصالحية', bio: 'أخصائية أمراض النساء والتوليد بخبرة 14 سنة', diseases_treated: ['أمراض الرحم', 'الحمل والولادة', 'العقم', 'تكيس المبايض'], is_approved: true, is_active: true, is_featured: true, rating: 4.9, rating_count: 35, working_hours_start: '09:00', working_hours_end: '17:00', working_days: [0,1,2,3,4], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=رنا&backgroundColor=0055A0&textColor=ffffff' },
  },
  '+963910000000': {
    id: 'aaaaaaaa-0000-0000-0000-000000000010',
    name: 'د. كريم ناصر', phone: '+963910000000', role: 'doctor',
    doctorData: { id: '805120a7-7e33-41e4-b232-4ce7f9cc2b81', user_id: 'aaaaaaaa-0000-0000-0000-000000000010', full_name: 'د. كريم ناصر', specialization: 'طب عيون', phone: '+963910000000', city: 'حلب', clinic_address: 'شارع المتنبي', bio: 'أخصائي أمراض العيون وجراحة الليزك بخبرة 11 سنة', diseases_treated: ['ضعف النظر', 'الماء الأبيض', 'الماء الأزرق', 'التهاب الشبكية'], is_approved: true, is_active: false, is_featured: false, rating: 4.4, rating_count: 12, working_hours_start: '10:00', working_hours_end: '18:00', working_days: [0,1,2,3,4], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=كريم&backgroundColor=0055A0&textColor=ffffff' },
  },
  '+963909000000': {
    id: 'aaaaaaaa-0000-0000-0000-000000000011',
    name: 'د. منى خالد', phone: '+963909000000', role: 'doctor',
    doctorData: { id: '2054e50a-9f8f-4117-a111-b0bb271f7670', user_id: 'aaaaaaaa-0000-0000-0000-000000000011', full_name: 'د. منى خالد', specialization: 'طب باطنية', phone: '+963909000000', city: 'دمشق', clinic_address: 'شارع بغداد', bio: 'أخصائية الأمراض الداخلية والسكري بخبرة 9 سنوات', diseases_treated: ['السكري', 'أمراض الغدة الدرقية', 'فقر الدم', 'أمراض الكلى'], is_approved: true, is_active: true, is_featured: false, rating: 4.6, rating_count: 21, working_hours_start: '08:00', working_hours_end: '16:00', working_days: [0,1,2,3,4], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=منى&backgroundColor=0055A0&textColor=ffffff' },
  },
  '+963908000000': {
    id: 'aaaaaaaa-0000-0000-0000-000000000012',
    name: 'د. طارق سليمان', phone: '+963908000000', role: 'doctor',
    doctorData: { id: '976eef04-0528-4737-820b-523482d10d17', user_id: 'aaaaaaaa-0000-0000-0000-000000000012', full_name: 'د. طارق سليمان', specialization: 'طب قلبية', phone: '+963908000000', city: 'حمص', clinic_address: 'شارع الحضارة', bio: 'استشاري أمراض القلب والتدخل القسطري بخبرة 18 سنة', diseases_treated: ['جلطة القلب', 'ضعف القلب', 'عدم انتظام الضربات', 'أمراض الصمامات'], is_approved: true, is_active: true, is_featured: true, rating: 4.8, rating_count: 29, working_hours_start: '09:00', working_hours_end: '15:00', working_days: [0,1,2,4], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=طارق&backgroundColor=0055A0&textColor=ffffff' },
  },
  '+963907000000': {
    id: 'aaaaaaaa-0000-0000-0000-000000000013',
    name: 'د. نورا فارس', phone: '+963907000000', role: 'doctor',
    doctorData: { id: 'c8539898-5134-45a0-a2ab-6458fc35d7f0', user_id: 'aaaaaaaa-0000-0000-0000-000000000013', full_name: 'د. نورا فارس', specialization: 'طب جلدية', phone: '+963907000000', city: 'دمشق', clinic_address: 'شارع الملك فيصل', bio: 'أخصائية أمراض الجلد والتجميل الطبي بخبرة 7 سنوات', diseases_treated: ['الشرى', 'التهاب الجلد', 'إزالة الوشم', 'تجديد الجلد'], is_approved: true, is_active: true, is_featured: false, rating: 4.5, rating_count: 16, working_hours_start: '11:00', working_hours_end: '19:00', working_days: [1,2,3,4,6], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=نورا&backgroundColor=0055A0&textColor=ffffff' },
  },
  '+963906000000': {
    id: 'aaaaaaaa-0000-0000-0000-000000000014',
    name: 'د. بلال عمر', phone: '+963906000000', role: 'doctor',
    doctorData: { id: '642ebd9a-7298-4806-ae1f-5e194552cc27', user_id: 'aaaaaaaa-0000-0000-0000-000000000014', full_name: 'د. بلال عمر', specialization: 'طب عظمية', phone: '+963906000000', city: 'اللاذقية', clinic_address: 'شارع الأمين', bio: 'أخصائي جراحة العمود الفقري والمفاصل بخبرة 13 سنة', diseases_treated: ['انزلاق الغضروف', 'تضيق القناة الشوكية', 'التهاب المفاصل', 'إصابات الركبة'], is_approved: true, is_active: false, is_featured: false, rating: 4.3, rating_count: 11, working_hours_start: '08:00', working_hours_end: '14:00', working_days: [0,1,2,3,4], avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=بلال&backgroundColor=0055A0&textColor=ffffff' },
  },
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  roles: string[]
  isAdmin: boolean
  isDoctor: boolean
  isPatient: boolean
  doctorData: any | null
  loading: boolean
  demoLogin: (phone: string) => boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, roles: [],
  isAdmin: false, isDoctor: false, isPatient: false,
  doctorData: null, loading: true,
  demoLogin: () => false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [doctorData, setDoctorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoSession, setIsDemoSession] = useState(false)

  const fetchUserData = async (userId: string) => {
    const [profileRes, rolesRes, doctorRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
      supabase.from('doctors').select('*').eq('user_id', userId).single(),
    ])
    setProfile(profileRes.data)
    setRoles(rolesRes.data?.map((r: any) => r.role) || [])
    setDoctorData(doctorRes.data)
  }

  const refreshProfile = async () => {
    if (isDemoSession) return
    if (user) await fetchUserData(user.id)
  }

  const demoLogin = (phone: string): boolean => {
    const demo = DEMO_USERS[phone]
    if (!demo) return false
    const fakeUser = {
      id: demo.id, email: `${demo.role}@demo.tabibak.local`, phone: demo.phone,
      app_metadata: {}, user_metadata: { full_name: demo.name },
      aud: 'authenticated', created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), role: 'authenticated', identities: [],
    } as unknown as User
    setUser(fakeUser)
    setSession({ user: fakeUser, access_token: 'demo', token_type: 'bearer' } as unknown as Session)
    setProfile({ user_id: demo.id, full_name: demo.name, phone: demo.phone })
    setRoles([demo.role])
    setDoctorData(demo.doctorData || null)
    setIsDemoSession(true)
    setLoading(false)
    return true
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isDemoSession) { setLoading(false); return }
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchUserData(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isDemoSession) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0)
      } else {
        setProfile(null); setRoles([]); setDoctorData(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [isDemoSession])

  const signOut = async () => {
    if (isDemoSession) setIsDemoSession(false)
    else await supabase.auth.signOut()
    setUser(null); setSession(null); setProfile(null)
    setRoles([]); setDoctorData(null)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, roles,
      isAdmin: roles.includes('admin'),
      isDoctor: roles.includes('doctor'),
      isPatient: roles.includes('patient'),
      doctorData, loading, demoLogin, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
