'use client'
import { useState, useEffect } from 'react'
import { supabase, Goal } from '@/lib/supabase'
import { Plus, Target, TrendingUp, CheckCircle, Pause, X, RefreshCw } from 'lucide-react'
import { getPriorityLabel, getPriorityColor, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkIn, setCheckIn] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'business',
    priority: '1',
    target_date: '',
    success_criteria: '',
  })

  useEffect(() => { loadGoals() }, [])

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('priority')
    setGoals(data || [])
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        ...form,
        priority: parseInt(form.priority),
        status: 'active',
        current_progress: 0,
      })
      if (error) throw error
      toast.success('Goal created!')
      setShowForm(false)
      setForm({ title: '', description: '', category: 'business', priority: '1', target_date: '', success_criteria: '' })
      await loadGoals()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateProgress = async (goalId: string, progress: number) => {
    await supabase.from('goals').update({ current_progress: progress }).eq('id', goalId)
    setGoals(g => g.map(goal => goal.id === goalId ? { ...goal, current_progress: progress } : goal))
  }

  const updateStatus = async (goalId: string, status: string) => {
    await supabase.from('goals').update({ status }).eq('id', goalId)
    await loadGoals()
    toast.success(`Goal marked as ${status}`)
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const res = await fetch('/api/goals/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCheckIn(data.checkIn)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCheckingIn(false)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Goals</h1>
          <p className="text-muted text-sm">Track what matters. Stay accountable. Move forward.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCheckIn} disabled={checkingIn || activeGoals.length === 0} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={checkingIn ? 'animate-spin' : ''} />
            Check In
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Goal
          </button>
        </div>
      </div>

      {/* Check-in results */}
      {checkIn && (
        <div className="card mb-8 border border-accent2/30 bg-accent2/5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-accent2">Weekly Check-In</h3>
            <button onClick={() => setCheckIn(null)} className="text-muted hover:text-text"><X size={14} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {checkIn.on_track?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-success uppercase tracking-wider mb-2">On Track ✓</p>
                <ul className="space-y-1">
                  {checkIn.on_track.map((t: string, i: number) => <li key={i} className="text-sm text-text/80">{t}</li>)}
                </ul>
              </div>
            )}
            {checkIn.at_risk?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-warning uppercase tracking-wider mb-2">At Risk ⚠</p>
                <ul className="space-y-1">
                  {checkIn.at_risk.map((t: string, i: number) => <li key={i} className="text-sm text-text/80">{t}</li>)}
                </ul>
              </div>
            )}
          </div>
          {checkIn.recommended_actions?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">This Week — Take Action</p>
              <ul className="space-y-1">
                {checkIn.recommended_actions.map((a: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-accent">→</span>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {checkIn.motivation && (
            <p className="mt-4 text-sm text-muted italic border-t border-border pt-4">"{checkIn.motivation}"</p>
          )}
        </div>
      )}

      {/* Add goal form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-8 space-y-4 animate-slide-up">
          <h3 className="font-display text-lg font-bold">New Goal</h3>
          <div>
            <label className="label">Goal title</label>
            <input className="input" placeholder="e.g. Hit $500k ARR by end of year" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="textarea min-h-[80px]" placeholder="More detail on what this goal means and why it matters..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="business">Business</option>
                <option value="financial">Financial</option>
                <option value="team">Team</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="1">High</option>
                <option value="2">Medium</option>
                <option value="3">Low</option>
              </select>
            </div>
            <div>
              <label className="label">Target date</label>
              <input type="date" className="input" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Success criteria (optional)</label>
            <input className="input" placeholder="How will you know when this goal is achieved?" value={form.success_criteria} onChange={e => setForm(f => ({ ...f, success_criteria: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="flex items-center justify-center gap-2"><div className="spinner" /> Saving...</span> : 'Create Goal'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : activeGoals.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Target size={24} className="text-accent" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">No active goals</h3>
          <p className="text-muted text-sm max-w-sm mx-auto mb-8">Set your goals and Cervio will track them in every briefing, decision, and check-in.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Set your first goal
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-accent" />
                Active Goals
                <span className="text-sm text-muted font-normal">({activeGoals.length})</span>
              </h2>
              <div className="space-y-4">
                {activeGoals.map(goal => (
                  <div key={goal.id} className="card">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge text-xs ${getPriorityColor(goal.priority || 2)}`}>
                              {getPriorityLabel(goal.priority || 2)}
                            </span>
                          </div>
                        </div>
                        {goal.description && <p className="text-muted text-sm mb-3">{goal.description}</p>}
                        {goal.success_criteria && (
                          <p className="text-xs text-muted mb-3 italic">Success: {goal.success_criteria}</p>
                        )}

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                            <span>Progress</span>
                            <span className="text-accent font-medium">{goal.current_progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={goal.current_progress || 0}
                            onChange={e => updateProgress(goal.id, parseInt(e.target.value))}
                            className="w-full h-1 accent-accent cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted">
                            {goal.target_date && <span>Due {formatDate(goal.target_date)}</span>}
                            <span className="capitalize">{goal.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateStatus(goal.id, 'completed')}
                              className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-all"
                              title="Mark complete"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => updateStatus(goal.id, 'paused')}
                              className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-warning/10 transition-all"
                              title="Pause"
                            >
                              <Pause size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2 text-muted">
                <CheckCircle size={18} />
                Completed
                <span className="text-sm font-normal">({completedGoals.length})</span>
              </h2>
              <div className="space-y-2">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="card opacity-60 flex items-center gap-3">
                    <CheckCircle size={14} className="text-success flex-shrink-0" />
                    <span className="text-sm line-through text-muted">{goal.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
