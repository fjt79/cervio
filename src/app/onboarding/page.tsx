'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Your Business', subtitle: 'Tell Cervio about what you do' },
  { id: 2, title: 'Your Priorities', subtitle: 'What matters most right now' },
  { id: 3, title: 'Your Goals', subtitle: 'What you want to achieve' },
  { id: 4, title: 'Your Preferences', subtitle: 'How you like to work' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    business_description: '',
    role: '',
    business_stage: '',
    industry: '',
    team_size: '',
    biggest_challenge: '',
    support_preference: '',
    communication_style: 'direct',
    briefing_time: '07:00',
  })

  const [goals, setGoals] = useState([
    { title: '', target_date: '', priority: 1 },
    { title: '', target_date: '', priority: 2 },
  ])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      setForm(f => ({ ...f, full_name: user.user_metadata?.full_name || '' }))
    })
  }, [router])

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleComplete = async () => {
    if (!userId) return
    setLoading(true)
    try {
      // Save profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...form,
          onboarding_completed: true,
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Save goals
      const validGoals = goals.filter(g => g.title.trim())
      if (validGoals.length > 0) {
        const { error: goalsError } = await supabase
          .from('goals')
          .insert(validGoals.map(g => ({
            user_id: userId,
            title: g.title,
            target_date: g.target_date || null,
            priority: g.priority,
            status: 'active',
          })))
        if (goalsError) throw goalsError
      }

      toast.success('Welcome to Cervio!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent2/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-2xl font-bold text-accent mb-1">Cervio</div>
          <p className="text-muted text-sm">Setting up your AI Chief of Staff</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1 bg-surface2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent2 to-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {STEPS.map(s => (
            <div key={s.id} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              s.id <= step ? 'bg-accent' : 'bg-border'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="card animate-slide-up">
          <h2 className="font-display text-2xl font-bold mb-1">{STEPS[step - 1].title}</h2>
          <p className="text-muted text-sm mb-8">{STEPS[step - 1].subtitle}</p>

          {/* Step 1: Business */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Your name</label>
                <input className="input" placeholder="Freddy Elturk" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
              </div>
              <div>
                <label className="label">Business or company name</label>
                <input className="input" placeholder="e.g. Morphotech" value={form.business_name} onChange={e => update('business_name', e.target.value)} />
              </div>
              <div>
                <label className="label">What does your business do?</label>
                <textarea className="textarea" placeholder="Briefly describe what your business does and who it serves..." value={form.business_description} onChange={e => update('business_description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Your role</label>
                  <select className="input" value={form.role} onChange={e => update('role', e.target.value)}>
                    <option value="">Select role</option>
                    <option value="CEO/Founder">CEO / Founder</option>
                    <option value="Managing Director">Managing Director</option>
                    <option value="COO">COO</option>
                    <option value="CTO">CTO</option>
                    <option value="Executive Director">Executive Director</option>
                    <option value="Other Executive">Other Executive</option>
                  </select>
                </div>
                <div>
                  <label className="label">Team size</label>
                  <select className="input" value={form.team_size} onChange={e => update('team_size', e.target.value)}>
                    <option value="">Select size</option>
                    <option value="Solo">Solo</option>
                    <option value="2-10">2–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Business stage</label>
                  <select className="input" value={form.business_stage} onChange={e => update('business_stage', e.target.value)}>
                    <option value="">Select stage</option>
                    <option value="Idea / Pre-revenue">Idea / Pre-revenue</option>
                    <option value="Early stage">Early stage</option>
                    <option value="Growth">Growth</option>
                    <option value="Scale-up">Scale-up</option>
                    <option value="Established">Established</option>
                  </select>
                </div>
                <div>
                  <label className="label">Industry</label>
                  <select className="input" value={form.industry} onChange={e => update('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="SaaS / Software">SaaS / Software</option>
                    <option value="Finance / Fintech">Finance / Fintech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Energy">Energy</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Priorities & Challenges */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">What's your biggest challenge right now?</label>
                <textarea className="textarea" placeholder="e.g. Scaling the team while maintaining quality, raising our Series A, expanding into new markets..." value={form.biggest_challenge} onChange={e => update('biggest_challenge', e.target.value)} />
              </div>
              <div>
                <label className="label">What kind of support do you value most?</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'strategic', label: 'Strategic direction & big-picture thinking' },
                    { value: 'operational', label: 'Day-to-day operational clarity' },
                    { value: 'decisions', label: 'Structured decision-making support' },
                    { value: 'accountability', label: 'Goal accountability & progress tracking' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('support_preference', opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all text-sm ${
                        form.support_preference === opt.value
                          ? 'border-accent bg-accent/5 text-text'
                          : 'border-border bg-surface2 text-muted hover:border-accent/40'
                      }`}
                    >
                      {form.support_preference === opt.value && (
                        <span className="text-accent mr-2">✓</span>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-muted text-sm">Set your top goals. Cervio will track these and reference them in every briefing and decision.</p>
              {goals.map((goal, i) => (
                <div key={i} className="p-4 rounded-xl bg-surface2 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-accent font-medium uppercase tracking-wider">
                      {i === 0 ? 'Top Priority Goal' : 'Secondary Goal'}
                    </span>
                    <span className="text-xs text-muted">{i === 0 ? 'Most important' : 'Also important'}</span>
                  </div>
                  <input
                    className="input"
                    placeholder={i === 0 ? "e.g. Hit $100k MRR by Q3" : "e.g. Build a team of 5 engineers"}
                    value={goal.title}
                    onChange={e => {
                      const updated = [...goals]
                      updated[i] = { ...updated[i], title: e.target.value }
                      setGoals(updated)
                    }}
                  />
                  <div>
                    <label className="label text-xs">Target date (optional)</label>
                    <input
                      type="date"
                      className="input text-sm"
                      value={goal.target_date}
                      onChange={e => {
                        const updated = [...goals]
                        updated[i] = { ...updated[i], target_date: e.target.value }
                        setGoals(updated)
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGoals(g => [...g, { title: '', target_date: '', priority: g.length + 1 }])}
                className="btn-ghost text-sm w-full border border-dashed border-border hover:border-accent/40"
              >
                + Add another goal
              </button>
            </div>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="label">How do you prefer to receive information?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'direct', label: 'Direct & concise', desc: 'Sharp, no-fluff summaries' },
                    { value: 'detailed', label: 'Detailed & thorough', desc: 'Full analysis and context' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('communication_style', opt.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        form.communication_style === opt.value
                          ? 'border-accent bg-accent/5'
                          : 'border-border bg-surface2 hover:border-accent/40'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{opt.label}</div>
                      <div className="text-xs text-muted">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">What time should Cervio deliver your daily briefing?</label>
                <input
                  type="time"
                  className="input"
                  value={form.briefing_time}
                  onChange={e => update('briefing_time', e.target.value)}
                />
                <p className="text-xs text-muted mt-2">Cervio will generate and deliver your briefing at this time each day.</p>
              </div>

              {/* Summary preview */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs font-medium text-accent mb-3 uppercase tracking-wider">Your Cervio setup</p>
                <div className="space-y-1.5 text-sm">
                  {form.full_name && <p><span className="text-muted">Name:</span> <span className="text-text">{form.full_name}</span></p>}
                  {form.business_name && <p><span className="text-muted">Business:</span> <span className="text-text">{form.business_name}</span></p>}
                  {form.role && <p><span className="text-muted">Role:</span> <span className="text-text">{form.role}</span></p>}
                  {goals.filter(g => g.title).length > 0 && (
                    <p><span className="text-muted">Goals set:</span> <span className="text-text">{goals.filter(g => g.title).length}</span></p>
                  )}
                  <p><span className="text-muted">Briefing time:</span> <span className="text-text">{form.briefing_time}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <><div className="spinner" /> Setting up...</>
              ) : (
                <><CheckCircle size={16} /> Launch Cervio</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
