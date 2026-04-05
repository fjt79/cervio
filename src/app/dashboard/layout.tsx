'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '@/lib/supabase'
import {
  LayoutDashboard, Zap, Calendar, Target, Sparkles,
  Settings, LogOut, Menu, X, ChevronRight, Star,
  FileText, Users, MessageCircle, CalendarDays, TrendingUp, DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AskCervioBar from '@/components/features/AskCervioBar'
import { CervioLogo, CervioLogomark } from '@/components/features/CervioLogo'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/decisions', icon: Zap, label: 'Decisions' },
  { href: '/dashboard/meetings', icon: CalendarDays, label: 'Meeting Prep' },
  { href: '/dashboard/goals', icon: Target, label: 'Goals' },
  { href: '/dashboard/coach', icon: Sparkles, label: 'Coach' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/weekly-review', icon: Star, label: 'Weekly Review' },
  { href: '/dashboard/board-update', icon: FileText, label: 'Board Updates' },
  { href: '/dashboard/financial-command', icon: DollarSign, label: 'Financial Command' },
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

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 8, marginBottom: 1,
          textDecoration: 'none', fontSize: 14,
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--accent)' : 'var(--text)',
          background: active ? 'var(--accent-light)' : 'transparent',
          transition: 'all 0.1s',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)' }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <item.icon size={15} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />
        {item.label}
      </Link>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 40 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 236, background: 'var(--surface)', borderRight: '0.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }} className="hidden lg:flex">

        {/* Logo area - professional header */}
        <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <CervioLogomark size={28} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)', letterSpacing: -0.3, lineHeight: 1.2 }}>Cervio</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 0.1 }}>AI Chief of Staff</div>
            </div>
          </div>

          {/* User card */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.full_name || 'User'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.subscription_plan === 'trial' ? `Free Trial · ${trialDaysLeft}d left` : profile.subscription_plan || 'Trial'}
                </div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Trial upgrade banner */}
        {showTrialBanner && trialDaysLeft <= 3 && (
          <div style={{ margin: '10px 12px 0', padding: '10px 12px', background: 'var(--accent-light)', borderRadius: 10, border: '0.5px solid var(--accent)' }}>
            <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
              {trialDaysLeft === 0 ? 'Trial expired' : `${trialDaysLeft} days left`}
            </p>
            <Link href="/dashboard/settings" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', opacity: 0.85 }}>
              Upgrade to Pro <ChevronRight size={10} />
            </Link>
          </div>
        )}

        {/* Nav section label */}
        <div style={{ padding: '14px 14px 4px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Workspace</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '8px 8px 10px' }}>
          <div style={{ padding: '4px 0 6px 10px' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Account</span>
          </div>

          {/* Ask Cervio */}
          {(() => {
            const active = pathname === '/dashboard/ask-cervio'
            return (
              <Link href="/dashboard/ask-cervio" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, marginBottom: 1, textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : 'var(--text)', background: active ? 'var(--accent-light)' : 'transparent' }}>
                <MessageCircle size={15} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }} />
                Ask Cervio
              </Link>
            )
          })()}

          {/* Settings */}
          {(() => {
            const active = pathname === '/dashboard/settings'
            return (
              <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, marginBottom: 1, textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : 'var(--text)', background: active ? 'var(--accent-light)' : 'transparent' }}>
                <Settings size={15} style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }} />
                Settings
              </Link>
            )
          })()}

          {/* Sign out */}
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', transition: 'all 0.1s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLElement).style.background = 'var(--danger-bg)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 236, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isAskCervio ? 0 : 72 }} className="lg:ml-[236px] ml-0">
        {/* Mobile header */}
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '0.5px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 30 }} className="flex lg:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}>
            <Menu size={20} />
          </button>
          <CervioLogo size={24} color="var(--accent)" textSize={17} />
          <div style={{ width: 28 }} />
        </div>

        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {!isAskCervio && <AskCervioBar />}
    </div>
  )
}
