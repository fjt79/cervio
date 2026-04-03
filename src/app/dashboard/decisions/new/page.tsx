'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Zap, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function NewDecisionPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [decisionId, setDecisionId] = useState<string | null>(null)

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !situation.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const res = await fetch('/api/decisions/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title, situation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data.analysis)
      setDecisionId(data.decisionId)
      toast.success('Analysis complete')
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyse')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'border-success/30 bg-success/5'
      case 'medium': return 'border-warning/30 bg-warning/5'
      case 'high': return 'border-danger/30 bg-danger/5'
      default: return 'border-border bg-surface2'
    }
  }

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low': return 'text-success bg-success/10 border-success/20'
      case 'medium': return 'text-warning bg-warning/10 border-warning/20'
      case 'high': return 'text-danger bg-danger/10 border-danger/20'
      default: return 'text-muted bg-surface border-border'
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/decisions" className="btn-ghost p-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">New Decision</h1>
          <p className="text-muted text-sm">Describe the situation and get a structured analysis</p>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleAnalyse} className="space-y-6">
          <div className="card">
            <div className="space-y-4">
              <div>
                <label className="label">Decision title</label>
                <input
                  className="input"
                  placeholder="e.g. Should I hire a COO now or wait 6 months?"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Describe the situation in full</label>
                <textarea
                  className="textarea min-h-[180px]"
                  placeholder="Give Cervio as much context as possible. What's the situation? What are the stakes? What options are you already considering? What's your timeline? What constraints do you have?"
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  required
                />
                <p className="text-xs text-muted mt-2">
                  The more context you provide, the more accurate and personalised the analysis will be.
                </p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || !title || !situation} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <><div className="spinner" /> Analysing your situation...</>
            ) : (
              <><Zap size={16} /> Analyse this decision</>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Summary */}
          <div className="card">
            <h2 className="font-display text-xl font-bold mb-3">{title}</h2>
            <p className="text-muted text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Options */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Your Options</h3>
            <div className="space-y-4">
              {result.options?.map((option: any, i: number) => (
                <div key={i} className={`card border ${getRiskColor(option.risk_level)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-2xl font-black text-border/50">0{i + 1}</span>
                      <h4 className="font-semibold">{option.title}</h4>
                    </div>
                    <span className={`badge text-xs ${getRiskBadge(option.risk_level)}`}>
                      {option.risk_level} risk
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-4">{option.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-success mb-2 uppercase tracking-wider">Pros</p>
                      <ul className="space-y-1">
                        {option.pros?.map((pro: string, j: number) => (
                          <li key={j} className="text-xs text-text/80 flex gap-2">
                            <span className="text-success">+</span>{pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-danger mb-2 uppercase tracking-wider">Cons</p>
                      <ul className="space-y-1">
                        {option.cons?.map((con: string, j: number) => (
                          <li key={j} className="text-xs text-text/80 flex gap-2">
                            <span className="text-danger">−</span>{con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="card border border-accent/30 bg-accent/5 glow-accent">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-accent" />
              <h3 className="font-semibold text-accent uppercase text-xs tracking-wider">Cervio's Recommendation</h3>
            </div>
            <p className="font-semibold mb-2">{result.recommendation}</p>
            <p className="text-sm text-muted leading-relaxed">{result.rationale}</p>
          </div>

          {/* Watchpoints */}
          {result.watchpoints?.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-warning" />
                <h3 className="font-semibold text-sm uppercase tracking-wider text-warning">After the Decision — Watch For</h3>
              </div>
              <ul className="space-y-2">
                {result.watchpoints.map((w: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-text/80">
                    <span className="text-warning flex-shrink-0">→</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); setTitle(''); setSituation('') }}
              className="btn-secondary flex-1"
            >
              New Analysis
            </button>
            {decisionId && (
              <Link href={`/dashboard/decisions/${decisionId}`} className="btn-primary flex-1 text-center">
                View Decision
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
