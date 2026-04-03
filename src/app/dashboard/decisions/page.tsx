'use client'
import { useState, useEffect } from 'react'
import { supabase, Decision } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Zap, ChevronRight, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setDecisions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-success bg-success/10 border-success/20'
      case 'medium': return 'text-warning bg-warning/10 border-warning/20'
      case 'high': return 'text-danger bg-danger/10 border-danger/20'
      default: return 'text-muted bg-surface border-border'
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Decision Support</h1>
          <p className="text-muted text-sm">Describe any situation. Get structured analysis and a clear recommendation.</p>
        </div>
        <Link href="/dashboard/decisions/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Decision
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : decisions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent2/10 border border-accent2/20 flex items-center justify-center mx-auto mb-6">
            <Zap size={24} className="text-accent2" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">No decisions yet</h3>
          <p className="text-muted text-sm max-w-sm mx-auto mb-8">
            Describe any situation you're facing — strategic, operational, or people-related — and get a structured analysis.
          </p>
          <Link href="/dashboard/decisions/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Analyse your first decision
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map(decision => (
            <Link key={decision.id} href={`/dashboard/decisions/${decision.id}`}>
              <div className="card-hover flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-accent2/10 border border-accent2/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={16} className="text-accent2" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-sm leading-tight mb-1">{decision.title}</h3>
                    <ChevronRight size={14} className="text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-muted text-xs mb-3 line-clamp-2">{decision.situation}</p>
                  <div className="flex items-center gap-3">
                    {decision.analysis?.options?.[0] && (
                      <span className={`badge text-xs ${getRiskColor(decision.analysis.options[0].risk_level)}`}>
                        {decision.status || 'analysed'}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={10} />
                      {formatDate(decision.created_at!)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
