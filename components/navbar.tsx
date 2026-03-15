'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Bell, User, Shield, Stethoscope } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/auth-context'
import AuthModal from './auth-modal'
import AdminLoginModal from './admin-login-modal'

const navLinks = [
  { label: 'الصفحة الرئيسية', href: '/' },
  { label: 'الأطباء', href: '/doctors' },
  { label: 'من نحن', href: '/about' },
  { label: 'اتصل بنا', href: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | undefined>()
  const [authRole, setAuthRole] = useState<'patient' | 'doctor' | undefined>()
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdmin, isDoctor } = useAuth()

  const handleProfileClick = () => {
    if (user) { isAdmin ? router.push('/admin') : router.push('/profile') }
    else { setAuthMode(undefined); setAuthRole(undefined); setAuthOpen(true) }
  }

  const handleNotificationsClick = () => {
    if (user) router.push('/notifications')
    else { setAuthMode('login'); setAuthOpen(true) }
  }

  const handleAdminClick = () => {
    if (user && isAdmin) router.push('/admin')
    else setAdminLoginOpen(true)
  }

  const handleJoinClick = () => { setAuthMode('register'); setAuthRole('doctor'); setAuthOpen(true) }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-heading text-2xl font-bold text-primary">طبيبك</Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`font-body text-sm font-medium transition-colors duration-200 hover:text-primary ${pathname === link.href ? 'text-primary border-b-2 border-primary pb-1' : 'text-foreground/70'}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <button onClick={handleJoinClick} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1">
                <Stethoscope className="w-4 h-4" /> انضم إلينا
              </button>
            )}
            {user && isDoctor && (
              <button onClick={() => router.push('/doctor-dashboard')} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors" title="لوحة الطبيب">
                <Stethoscope className="w-5 h-5" />
              </button>
            )}
            {(!user || isAdmin) && (
              <button onClick={handleAdminClick} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors" title="لوحة الإدارة">
                <Shield className="w-5 h-5" />
              </button>
            )}
            {user && !isAdmin && (
              <button onClick={handleNotificationsClick} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors" title="الإشعارات">
                <Bell className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleProfileClick} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors" title="الملف الشخصي">
              <User className="w-5 h-5" />
            </button>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="md:hidden overflow-hidden bg-background border-b border-border">
              <ul className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)} className={`block py-2 px-4 rounded-xl font-body text-sm transition-colors ${pathname === link.href ? 'bg-accent text-primary font-medium' : 'text-foreground/70 hover:bg-accent'}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 px-4 pb-4">
                {!user && <button onClick={() => { setMobileOpen(false); handleJoinClick() }} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-semibold">انضم إلينا</button>}
                {user && isDoctor && <button onClick={() => { setMobileOpen(false); router.push('/doctor-dashboard') }} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent"><Stethoscope className="w-5 h-5" /></button>}
                {(!user || isAdmin) && <button onClick={() => { setMobileOpen(false); handleAdminClick() }} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent"><Shield className="w-5 h-5" /></button>}
                {user && !isAdmin && <button onClick={() => { setMobileOpen(false); handleNotificationsClick() }} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent"><Bell className="w-5 h-5" /></button>}
                <button onClick={() => { setMobileOpen(false); handleProfileClick() }} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent"><User className="w-5 h-5" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultRole={authRole} defaultMode={authMode} />
      <AdminLoginModal open={adminLoginOpen} onClose={() => setAdminLoginOpen(false)} onSuccess={() => router.push('/admin')} />
    </>
  )
}
