'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// ===== الحسابات التجريبية =====
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
  '+963988888888': {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'د. أحمد محمد',
    phone: '+963988888888',
    role: 'doctor',
    doctorData: {
      id: 'f02e7fa6-b9f4-4505-a70f-f9ef01d3dfb6',
      user_id: 'aaaaaaaa-0000-0000-0000-000000000002',
      full_name: 'د. أحمد محمد',
      specialization: 'طب قلبية',
      phone: '+963988888888',
      city: 'دمشق',
      clinic_address: 'شارع الحمراء',
      bio: 'أخصائي أمراض القلب والأوعية الدموية بخبرة 15 سنة',
      diseases_treated: ['أمراض القلب', 'ارتفاع ضغط الدم', 'تصلب الشرايين', 'قصور القلب'],
      is_approved: true, is_active: true, is_featured: true,
      rating: 4.8, rating_count: 24,
      working_hours_start: '08:00', working_hours_end: '16:00',
      working_days: [0, 1, 2, 3, 4],
      avatar_url: '/doctors/dr-ahmad.jpg',
    },
  },
  '+963977777777': {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    name: 'Patient Demo',
    phone: '+963977777777',
    role: 'patient',
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

  // ===== تسجيل دخول تجريبي - بدون Supabase =====
  const demoLogin = (phone: string): boolean => {
    const demo = DEMO_USERS[phone]
    if (!demo) return false

    const fakeUser = {
      id: demo.id,
      email: `${demo.role}@demo.tabibak.local`,
      phone: demo.phone,
      app_metadata: {},
      user_metadata: { full_name: demo.name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'authenticated',
      identities: [],
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
    if (isDemoSession) {
      setIsDemoSession(false)
    } else {
      await supabase.auth.signOut()
    }
    setUser(null); setSession(null); setProfile(null)
    setRoles([]); setDoctorData(null)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, roles,
      isAdmin: roles.includes('admin'),
      isDoctor: roles.includes('doctor'),
      isPatient: roles.includes('patient'),
      doctorData, loading,
      demoLogin, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
