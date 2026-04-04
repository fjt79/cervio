'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase, Profile } from '@/lib/supabase'
import {
  LayoutDashboard, Zap, Calendar, Target, Sparkles,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
 { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
{ href: '/dashboard/decisions', icon: Zap, label: 'Decisions' },
{ href: '/dashboard/meetings', icon: Calendar, label: 'Meeting Prep' },
{ href: '/dashboard/goals', icon: Target, label: 'Goals' },
{ href: '/dashboard/coach', icon: Sparkles, label: 'Coach' },
{ href: '/dashboard/settings', icon: Settings, label: 'Settings' },
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

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        if (!data.onboarding_completed) {
          router.push('/onboarding')
          return
        }
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

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold text-accent">Cervio</div>
            <div className="text-xs text-muted">AI Chief of Staff</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* Trial banner */}
        {showTrialBanner && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-xs text-accent font-medium">
              {trialDaysLeft === 0 ? 'Trial expired' : `${trialDaysLeft} days left in trial`}
            </p>
            <Link href="/dashboard/settings#billing" className="text-xs text-accent/80 flex items-center gap-1 mt-1 hover:text-accent">
              Upgrade now <ChevronRight size={10} />
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-text hover:bg-surface2'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
              {profile?.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{profile?.full_name || 'User'}</div>
              <div className="text-xs text-muted truncate">{profile?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-danger hover:bg-danger/5 text-sm transition-all"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-muted hover:text-text">
            <Menu size={20} />
          </button>
          <span className="font-display text-lg font-bold text-accent">Cervio</span>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
