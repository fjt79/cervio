'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '@/lib/supabase'
import {
  LayoutDashboard, Zap, Calendar, Target, Sparkles,
  Settings, LogOut, Menu, X, ChevronRight, Star,
  FileText, Users, MessageCircle, CalendarDays
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AskCervioBar from '@/components/features/AskCervioBar'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/decisions', icon: Zap, label: 'Decisions' },
  { href: '/dashboard/meetings', icon: CalendarDays, label: 'Meeting Prep' },
  { href: '/dashboard/goals', icon: Target, label: 'Goals' },
  { href: '/dashboard/coach', icon: Sparkles, label: 'Coach' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/weekly-review', icon: Star, label: 'Weekly Review' },
  { href: '/dashboard/board-update', icon: FileText, label: 'Board Updates' },
  { href: '/dashboard/stakeholders', icon: Users, label: 'Stakeholders' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        if (!data.onboarding_completed) { router.push('/onboarding'); return }
        setProfile(data)
      }
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0
  const showTrialBanner = profile?.subscription_plan === 'trial' && trialDaysLeft <= 7
  const isAskCervio = pathname === '/dashboard/ask-cervio'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--surface)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        boxShadow: 'var(--shadow-sm)',
      }} className="hidden lg:flex">

        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', letterSpacing: -0.5, fontFamily: '-apple-system, SF Pro Display, sans-serif' }}>Cervio</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>AI Chief of Staff</div>
        </div>

        {/* Trial banner */}
        {showTrialBanner && (
          <div style={{ margin: '12px 12px 0', padding: '10px 12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--accent)' }}>
            <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              {trialDaysLeft === 0 ? 'Trial expired' : `${trialDaysLeft} days left`}
            </p>
            <Link href="/dashboard/settings#billing" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, textDecoration: 'none', opacity: 0.8 }}>
              Upgrade now <ChevronRight size={10} />
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', marginTop: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 2,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'var(--text)',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <item.icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — Ask Cervio + Settings + User */}
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '8px 8px' }}>
          {/* Ask Cervio */}
          <Link
            href="/dashboard/ask-cervio"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isAskCervio ? 600 : 400,
              color: isAskCervio ? 'var(--accent)' : 'var(--text)',
              background: isAskCervio ? 'var(--accent-light)' : 'transparent',
            }}
          >
            <MessageCircle size={16} style={{ color: isAskCervio ? 'var(--accent)' : 'var(--text-secondary)' }} />
            Ask Cervio
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: pathname === '/dashboard/settings' ? 600 : 400,
              color: pathname === '/dashboard/settings' ? 'var(--accent)' : 'var(--text)',
              background: pathname === '/dashboard/settings' ? 'var(--accent-light)' : 'transparent',
            }}
          >
            <Settings size={16} style={{ color: pathname === '/dashboard/settings' ? 'var(--accent)' : 'var(--text-secondary)' }} />
            Settings
          </Link>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {profile?.full_name?.[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'User'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6, display: 'flex' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isAskCervio ? 0 : 72 }} className="lg:ml-[240px] ml-0">
        {/* Mobile header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 30 }} className="lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>Cervio</span>
          <div style={{ width: 28 }} />
        </div>

        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Persistent Ask Cervio bar — always visible except on Ask Cervio page */}
      {!isAskCervio && <AskCervioBar />}
    </div>
  )
}
