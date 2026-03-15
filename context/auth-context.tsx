'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

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
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, roles: [],
  isAdmin: false, isDoctor: false, isPatient: false,
  doctorData: null, loading: true,
  signOut: async () => {}, refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [doctorData, setDoctorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    if (user) await fetchUserData(user.id)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0)
      } else {
        setProfile(null); setRoles([]); setDoctorData(null)
      }
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchUserData(session.user.id)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null); setProfile(null); setRoles([]); setDoctorData(null)
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, roles,
      isAdmin: roles.includes('admin'),
      isDoctor: roles.includes('doctor'),
      isPatient: roles.includes('patient'),
      doctorData, loading, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
