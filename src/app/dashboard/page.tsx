'use client'
import ExecutionPanel from '@/components/features/ExecutionPanel'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, AlertTriangle, Zap, CheckCircle, Shield, ChevronDown, ChevronUp, Flame, Brain, BarChart2, TrendingUp, TrendingDown, DollarSign, Minus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type CardState = 'pending' | 'executing' | 'completed' | 'rejected' | 'delayed'
interface Task { id: string; title: string; owner: string; due: string; status: 'pending' | 'in_progress' | 'done' }
interface ExecutionState { tasks: Task[]; progress: number; completedCount: number; nextCheckpoint: string; startedAt: number }
interface DecisionRec { id: string; title: string; context: string; recommendation: string; confidence_score: number; reasoning: string; expected_impact_approve: string; expected_impact_reject: string; urgency: string; consequence_label: string; delay_count: number; user_action: string | null; auto_actions: any[] }
interface BusinessHealth { overall_score: number; revenue_score: number; execution_score: number; team_score: number; risk_score: number; critical_factors: string[]; projected_score_after_actions: number }
interface RiskAlert { id: string; severity: string; title: string; description: string; recommended_action: string }
interface FinancialData { cash: number; monthly_burn: number; monthly_revenue: number; runway_months: number; status: string }
interface OperatorScore { score: number; prev_score: number; insights: string[] }

// ... keep everything else unchanged ...

function DecisionCard({
  dec,
  health,
  onAction,
  isPrimary,
  executionMode,
  onOpenExecutionPanel,
}: {
  dec: DecisionRec
  health: BusinessHealth | null
  onAction: (id: string, action: string) => void
  isPrimary?: boolean
  executionMode: boolean
  onOpenExecutionPanel: (decision: DecisionRec) => void
}) {
  const [cardState, setCardState] = useState<CardState>('pending')
  const [expanded, setExpanded] = useState(dec.urgency === 'critical' || !!isPrimary)
  const [execution, setExecution] = useState<ExecutionState | null>(null)
  const [acting, setActing] = useState(false)
  const isCritical = dec.urgency === 'critical'
  const isExecuting = cardState === 'executing'
  const isCompleted = cardState === 'completed'
  const recColor = dec.recommendation === 'approve' ? T.success : dec.recommendation === 'reject' ? T.danger : T.warning
  const recLabel = dec.recommendation === 'approve' ? '✓ Approve' : dec.recommendation === 'reject' ? '✗ Reject' : '⏸ Delay'

  const handleApprove = () => {
    onOpenExecutionPanel(dec)
  }

  const handleReject = () => {
    setCardState('rejected')
    onAction(dec.id, 'rejected')
    toast('Rejected and logged', { icon: '✗' })
  }

  const handleDelay = () => {
    onAction(dec.id, 'delayed')
    toast('Delayed — blocking execution', { icon: '⏸' })
  }

  const handleToggleTask = (taskId: string) => {
    if (!execution) return
    const updated = execution.tasks.map(t =>
      t.id === taskId
        ? { ...t, status: t.status === 'done' ? 'pending' as const : 'done' as const }
        : t
    )
    const completed = updated.filter(t => t.status === 'done').length
    const progress = Math.round((completed / updated.length) * 100)
    setExecution({ ...execution, tasks: updated, completedCount: completed, progress, startedAt: Date.now() })
    if (progress === 100) {
      setCardState('completed')
      toast.success('✓ All tasks complete')
    }
  }

  // ... keep rest of DecisionCard unchanged ...
}

// ── Main Page ────────────────────────────────────────────────
export default function CommandCentrePage() {
  const [profile, setProfile] = useState<any>(null)
  const [health, setHealth] = useState<BusinessHealth | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<DecisionRec[]>([])
  const [resolvedDecisions, setResolvedDecisions] = useState<any[]>([])
  const [oneMoveData, setOneMoveData] = useState<any>(null)
  const [accountabilityData, setAccountabilityData] = useState<any>(null)
  const [analysing, setAnalysing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [executionMode, setExecutionMode] = useState(false)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [operatorScore, setOperatorScore] = useState<OperatorScore | null>(null)
  const [executionTarget, setExecutionTarget] = useState<DecisionRec | null>(null)

  useEffect(() => { loadData() }, [])

  // ... keep everything else unchanged ...

  return (
    <div style={{ padding: '28px', maxWidth: 1120, margin: '0 auto', paddingBottom: 140 }}>

      {/* Header with Execution Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        {/* ... unchanged ... */}
      </div>

      {/* Critical banner */}
      {criticalAlerts.length > 0 && (
        <div style={{ background: T.dangerBg, border: `1.5px solid ${T.dangerBorder}`, borderRadius: 13, padding: '13px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ... unchanged ... */}
        </div>
      )}

      <TodaysCommand data={oneMoveData} onExecute={() => toast('Click Approve & Execute on your highest priority decision')} />

      {executionTarget && (
        <ExecutionPanel
          decision={executionTarget}
          executionMode={executionMode}
          onClose={() => setExecutionTarget(null)}
          onComplete={(log) => {
            const dec = pendingDecisions.find(d => d.id === executionTarget?.id)
            if (dec) setResolvedDecisions(prev => [{ id: executionTarget.id, title: dec.title, action: 'approved', date: new Date().toLocaleDateString('en-AU') }, ...prev])
            if (health) setHealth(h => h ? { ...h, overall_score: Math.min(100, h.overall_score + 5), execution_score: Math.min(100, h.execution_score + 8) } : h)
            setTimeout(() => setPendingDecisions(prev => prev.filter(d => d.id !== executionTarget?.id)), 2000)
            setExecutionTarget(null)
            toast.success('✓ Execution complete — decision logged')
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 356px', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Zap size={17} style={{ color: T.accent }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>AI Decisions Required</h2>
              {pendingDecisions.length > 0 && <span style={{ background: pendingDecisions.some(d => d.urgency === 'critical') ? T.danger : T.accent, color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 100 }}>{pendingDecisions.length}</span>}
            </div>
            {pendingDecisions.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 24px', textAlign: 'center', boxShadow: T.shadowSm }}>
                <CheckCircle size={24} style={{ color: T.success, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>No execution blocked. Run analysis to surface decisions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDecisions.map((dec, i) => (
                  <DecisionCard
                    key={`card-${dec.id}`}
                    dec={dec}
                    health={health}
                    onAction={handleDecisionAction}
                    isPrimary={i === 0}
                    executionMode={executionMode}
                    onOpenExecutionPanel={setExecutionTarget}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ... rest unchanged ... */}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ... unchanged ... */}
        </div>
      </div>
    </div>
  )
}