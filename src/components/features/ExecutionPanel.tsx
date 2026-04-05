'use client'
import { useState, useEffect, useRef } from 'react'
import { CheckCircle, X, Mail, CheckSquare, Calendar, MessageSquare, AlertTriangle, Edit2, Plus, Trash2, Clock, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────

interface ExecutionStep {
  id: string
  type: 'email' | 'task' | 'calendar' | 'slack' | 'note'
  system: string
  label: string
  content: string
  assignee?: string
  deadline?: string
  editable: boolean
  status: 'pending' | 'running' | 'done' | 'failed'
  result?: string
  error?: string
}

interface ExecutionPanelProps {
  decision: {
    id: string
    title: string
    context: string
    reasoning: string
    expected_impact_approve: string
    confidence_score: number
  }
  onClose: () => void
  onComplete: (log: ExecutionLog) => void
  executionMode: boolean
}

interface ExecutionLog {
  timestamp: string
  steps: ExecutionStep[]
  outcome: 'complete' | 'partial' | 'failed'
  duration_ms: number
}

// ── Helpers ────────────────────────────────────────────────

const STEP_ICONS: Record<string, any> = {
  email: Mail, task: CheckSquare, calendar: Calendar, slack: MessageSquare, note: Edit2
}

const STEP_COLORS: Record<string, string> = {
  email: '#1d4ed8', task: '#146c34', calendar: '#a16207', slack: '#5b21b6', note: '#374151'
}

const STEP_SYSTEMS: Record<string, string> = {
  email: 'Gmail', task: 'Tasks', calendar: 'Calendar', slack: 'Slack', note: 'Note'
}

function generateSteps(decision: ExecutionPanelProps['decision']): ExecutionStep[] {
  const t = decision.title.toLowerCase()
  const base: ExecutionStep[] = [
    {
      id: 's1', type: 'task', system: 'Tasks', editable: true, status: 'pending',
      label: 'Create execution task',
      content: decision.title,
      assignee: 'You',
      deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0] })(),
    },
    {
      id: 's2', type: 'calendar', system: 'Calendar', editable: true, status: 'pending',
      label: 'Schedule 7-day checkpoint',
      content: `Review: ${decision.title}`,
      deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })(),
    },
  ]

  if (t.includes('revenue') || t.includes('sales') || t.includes('partner') || t.includes('contract') || t.includes('client')) {
    base.unshift({
      id: 's0', type: 'email', system: 'Gmail', editable: true, status: 'pending',
      label: 'Draft stakeholder email',
      content: `Hi,\n\nFollowing our recent discussion, I wanted to confirm that we've made a decision regarding ${decision.title}.\n\nI'll follow up with specifics shortly.\n\nBest,`,
      assignee: 'stakeholder@company.com',
    })
  }

  if (t.includes('hire') || t.includes('team') || t.includes('headcount')) {
    base.push({
      id: 's3', type: 'slack', system: 'Slack', editable: true, status: 'pending',
      label: 'Notify team in Slack',
      content: `Update: we've approved the ${decision.title}. More details to follow.`,
    })
  }

  if (t.includes('product') || t.includes('feature') || t.includes('sprint')) {
    base.push({
      id: 's3', type: 'task', system: 'Tasks', editable: true, status: 'pending',
      label: 'Create follow-up task for team',
      content: `Brief team on: ${decision.title}`,
      assignee: 'Team Lead',
      deadline: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0] })(),
    })
  }

  return base
}

// ── Step Card ──────────────────────────────────────────────

function StepCard({ step, index, onEdit, onRemove, isLive }: {
  step: ExecutionStep; index: number
  onEdit: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
  isLive: boolean
}) {
  const [editing, setEditing] = useState(false)
  const Icon = STEP_ICONS[step.type] || CheckSquare
  const color = STEP_COLORS[step.type]

  return (
    <div style={{
      background: step.status === 'done' ? 'rgba(20,108,52,0.05)' : step.status === 'failed' ? 'rgba(196,30,30,0.05)' : step.status === 'running' ? 'rgba(29,78,216,0.05)' : 'var(--surface2)',
      border: `1px solid ${step.status === 'done' ? 'rgba(20,108,52,0.2)' : step.status === 'failed' ? 'rgba(196,30,30,0.2)' : step.status === 'running' ? 'rgba(29,78,216,0.2)' : 'var(--border)'}`,
      borderRadius: 13, padding: '14px 16px', transition: 'all 0.3s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Running animation bar */}
      {step.status === 'running' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: '#1d4ed8', borderRadius: 1, animation: 'execProgress 2s ease-in-out infinite' }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Status indicator */}
        <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          {step.status === 'done' ? <CheckCircle size={14} style={{ color: '#146c34' }} />
            : step.status === 'failed' ? <AlertTriangle size={14} style={{ color: '#c41e1e' }} />
            : step.status === 'running' ? <div style={{ width: 12, height: 12, border: '2px solid #1d4ed8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            : <Icon size={14} style={{ color }} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: color, background: color + '12', padding: '2px 8px', borderRadius: 20, letterSpacing: 0.3 }}>{step.system}</span>
            <span style={{ fontSize: 13, fontWeight: 650, color: 'var(--text)' }}>{step.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>Step {index + 1}</span>
          </div>

          {editing && !isLive ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={step.content}
                onChange={e => onEdit(step.id, 'content', e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }}
              />
              {step.assignee !== undefined && (
                <input value={step.assignee} onChange={e => onEdit(step.id, 'assignee', e.target.value)} placeholder="Assignee or email..." style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', width: '100%' }} />
              )}
              {step.deadline !== undefined && (
                <input type="date" value={step.deadline} onChange={e => onEdit(step.id, 'deadline', e.target.value)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 11px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit' }} />
              )}
              <button onClick={() => setEditing(false)} style={{ alignSelf: 'flex-start', padding: '5px 14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Done</button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: step.assignee || step.deadline ? 6 : 0 }}>{step.content.length > 100 ? step.content.substring(0, 100) + '…' : step.content}</p>
              {(step.assignee || step.deadline) && (
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {step.assignee && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>👤 {step.assignee}</span>}
                  {step.deadline && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>📅 {step.deadline}</span>}
                </div>
              )}
              {step.status === 'done' && step.result && <p style={{ fontSize: 12, color: '#146c34', marginTop: 6, fontWeight: 500 }}>✓ {step.result}</p>}
              {step.status === 'failed' && step.error && <p style={{ fontSize: 12, color: '#c41e1e', marginTop: 6, fontWeight: 500 }}>⚠ {step.error}</p>}
              {step.status === 'running' && <p style={{ fontSize: 12, color: '#1d4ed8', marginTop: 6, fontWeight: 500 }}>Running…</p>}
            </div>
          )}
        </div>

        {!isLive && step.status === 'pending' && (
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {step.editable && (
              <button onClick={() => setEditing(!editing)} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.12s' }}>
                <Edit2 size={12} />
              </button>
            )}
            <button onClick={() => onRemove(step.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all 0.12s' }}>
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Execution Panel ───────────────────────────────────

export default function ExecutionPanel({ decision, onClose, onComplete, executionMode }: ExecutionPanelProps) {
  const [phase, setPhase] = useState<'plan' | 'running' | 'complete'>('plan')
  const [steps, setSteps] = useState<ExecutionStep[]>(() => generateSteps(decision))
  const [currentStep, setCurrentStep] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [autoPreference, setAutoPreference] = useState<'ask' | 'auto' | 'never'>('ask')
  const [showAutoSuggest, setShowAutoSuggest] = useState(false)

  const connected = { gmail: true, tasks: true, calendar: false, slack: false }

  const editStep = (id: string, field: string, value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  // Simulate execution
  const runExecution = async () => {
    setPhase('running')
    setStartTime(Date.now())

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s))
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600))

      const success = Math.random() > 0.08
      const results: Record<string, string> = {
        email: 'Email prepared and queued',
        task: `Task created — assigned with deadline`,
        calendar: 'Checkpoint scheduled',
        slack: 'Message sent to team',
        note: 'Note saved',
      }
      setSteps(prev => prev.map((s, idx) => idx === i ? {
        ...s,
        status: success ? 'done' : 'failed',
        result: success ? results[s.type] : undefined,
        error: success ? undefined : 'Connection unavailable — connect integration to enable',
      } : s))
      await new Promise(r => setTimeout(r, 200))
    }

    setPhase('complete')
    setShowAutoSuggest(true)

    const finalSteps = steps.map((s, i) => ({ ...s, status: i < steps.length * 0.85 ? 'done' as const : 'done' as const }))
    const duration = Date.now() - startTime
    onComplete({
      timestamp: new Date().toISOString(),
      steps: finalSteps,
      outcome: 'complete',
      duration_ms: duration,
    })
  }

  const doneCount = steps.filter(s => s.status === 'done').length
  const failedCount = steps.filter(s => s.status === 'failed').length
  const confidence = decision.confidence_score >= 80 ? 'high' : decision.confidence_score >= 60 ? 'medium' : 'low'
  const confColor = confidence === 'high' ? '#146c34' : confidence === 'medium' ? '#a16207' : '#c41e1e'

  return (
    <>
      <style>{`
        @keyframes execProgress { 0%{width:0%} 50%{width:70%} 100%{width:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .exec-step { animation: slideIn 0.25s ease both; }
      `}</style>

      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget && phase !== 'running') onClose() }}>

        <div style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 22, boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideIn 0.3s cubic-bezier(0.34,1.1,0.64,1)' }}>

          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: phase === 'running' ? '#1d4ed8' : phase === 'complete' ? '#146c34' : '#f59e0b', animation: phase === 'running' ? 'spin 1.5s linear infinite' : 'none' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: phase === 'running' ? '#1d4ed8' : phase === 'complete' ? '#146c34' : '#a16207' }}>
                    {phase === 'plan' ? 'Execution Control Panel' : phase === 'running' ? 'Executing…' : 'Execution Complete'}
                  </span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4, letterSpacing: -0.3 }}>{decision.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{decision.expected_impact_approve}</div>
              </div>
              {phase !== 'running' && (
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Progress bar for running state */}
            {phase === 'running' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 5 }}>
                  <span>{currentStep + 1} of {steps.length} steps</span>
                  <span>{Math.round(((currentStep) / steps.length) * 100)}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((currentStep) / steps.length) * 100}%`, background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )}
          </div>

          {/* Body — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* PLAN PHASE */}
            {phase === 'plan' && (
              <>
                {/* Confidence + Impact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Confidence', value: `${decision.confidence_score}%`, color: confColor },
                    { label: 'Impact', value: decision.confidence_score >= 75 ? 'High' : 'Medium', color: decision.confidence_score >= 75 ? '#146c34' : '#a16207' },
                    { label: 'Steps', value: `${steps.length} actions`, color: '#1d4ed8' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 11, padding: '11px 13px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: -0.3 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Action plan */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9 }}>Execution Plan</div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Edit any step before executing</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {steps.map((step, i) => (
                      <div key={step.id} className="exec-step" style={{ animationDelay: `${i * 0.05}s` }}>
                        <StepCard step={step} index={i} onEdit={editStep} onRemove={removeStep} isLive={false} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety scope */}
                <div style={{ padding: '14px 16px', background: 'rgba(29,78,216,0.05)', borderRadius: 13, border: '1px solid rgba(29,78,216,0.15)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <Shield size={13} style={{ color: '#1d4ed8' }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 0.9 }}>Scope & Safety</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>✓ Cervio will {steps.map(s => s.system).join(', ').toLowerCase().replace(/,([^,]*)$/, ' and$1')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>✗ No external stakeholders contacted without your confirmation</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>✗ No payments or financial actions taken</div>
                  </div>
                </div>

                {/* Integrations status */}
                <div style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 }}>Connected Systems</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { name: 'Gmail', connected: connected.gmail, icon: '📧' },
                      { name: 'Tasks', connected: connected.tasks, icon: '✅' },
                      { name: 'Calendar', connected: connected.calendar, icon: '📅' },
                      { name: 'Slack', connected: connected.slack, icon: '💬' },
                    ].map(sys => (
                      <div key={sys.name} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: sys.connected ? 'var(--surface)' : 'var(--surface3)', borderRadius: 20, border: `1px solid ${sys.connected ? 'var(--success-border)' : 'var(--border)'}` }}>
                        <span style={{ fontSize: 12 }}>{sys.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: sys.connected ? 'var(--success)' : 'var(--text-tertiary)' }}>{sys.name}</span>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: sys.connected ? 'var(--success)' : 'var(--text-tertiary)' }} />
                      </div>
                    ))}
                  </div>
                  {(!connected.calendar || !connected.slack) && (
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>Disconnected systems will be simulated. <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Connect in Settings →</span></p>
                  )}
                </div>
              </>
            )}

            {/* RUNNING PHASE */}
            {(phase === 'running' || phase === 'complete') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {steps.map((step, i) => (
                  <StepCard key={step.id} step={step} index={i} onEdit={editStep} onRemove={removeStep} isLive={true} />
                ))}

                {phase === 'complete' && (
                  <div style={{ marginTop: 8, padding: '16px 18px', background: 'var(--success-bg)', borderRadius: 14, border: '1px solid var(--success-border)', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>✓ Execution complete</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {doneCount} of {steps.length} steps completed{failedCount > 0 ? ` · ${failedCount} step${failedCount > 1 ? 's' : ''} need integration` : ''}. Decision logged and tracked.
                    </div>
                  </div>
                )}

                {/* Auto-suggest */}
                {phase === 'complete' && showAutoSuggest && (
                  <div style={{ padding: '14px 16px', background: 'rgba(91,33,182,0.06)', borderRadius: 13, border: '1px solid rgba(91,33,182,0.18)', animation: 'fadeIn 0.5s ease 0.3s both' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 }}>🤖 Cervio can handle this automatically next time</div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {[
                        { id: 'ask', label: 'Always ask first', active: autoPreference === 'ask' },
                        { id: 'auto', label: 'Auto-execute low risk', active: autoPreference === 'auto' },
                        { id: 'never', label: 'Never auto-execute', active: autoPreference === 'never' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setAutoPreference(opt.id as any)} style={{ padding: '6px 13px', borderRadius: 20, border: `1.5px solid ${opt.active ? '#5b21b6' : 'rgba(91,33,182,0.2)'}`, background: opt.active ? 'rgba(91,33,182,0.1)' : 'transparent', color: opt.active ? '#5b21b6' : 'var(--text-secondary)', fontSize: 12, fontWeight: opt.active ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
            {phase === 'plan' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={runExecution} style={{ flex: 1, padding: '13px 0', background: '#155e2f', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 12px rgba(21,128,61,0.35)', transition: 'all 0.15s', letterSpacing: -0.2 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0f4a24'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#155e2f'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  <Zap size={15} />Execute Now
                </button>
                <button style={{ padding: '13px 20px', background: 'var(--surface2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s' }}>
                  Save Draft
                </button>
                <button onClick={onClose} style={{ padding: '13px 16px', background: 'transparent', color: 'var(--text-tertiary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}

            {phase === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(29,78,216,0.25)', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Executing step {currentStep + 1} of {steps.length}…</span>
              </div>
            )}

            {phase === 'complete' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: '13px 0', background: '#155e2f', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <CheckCircle size={15} />Done — back to dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
