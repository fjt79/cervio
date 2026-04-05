'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  accent: '#1d4ed8',
  accentLight: 'rgba(29,78,216,0.1)',
  accentMid: 'rgba(29,78,216,0.2)',
  success: '#146c34',
  successBg: 'rgba(20,108,52,0.08)',
  successBorder: 'rgba(20,108,52,0.22)',
  danger: '#c41e1e',
}

const STEPS = [
  { id: 1, title: 'Your Business',   subtitle: 'Tell Cervio about what you do' },
  { id: 2, title: 'Your Priorities', subtitle: 'What matters most right now' },
  { id: 3, title: 'Your Goals',      subtitle: 'What you want to achieve' },
  { id: 4, title: 'Your Preferences',subtitle: 'How you like to work' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '', business_name: '', business_description: '',
    role: '', business_stage: '', industry: '', team_size: '',
    biggest_challenge: '', support_preference: '',
    communication_style: 'direct', briefing_time: '07:00',
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

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleComplete = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { error: profileError } = await supabase.from('profiles').update({ ...form, onboarding_completed: true }).eq('id', userId)
      if (profileError) throw profileError
      const validGoals = goals.filter(g => g.title.trim())
      if (validGoals.length > 0) {
        await supabase.from('goals').insert(validGoals.map(g => ({ user_id: userId, title: g.title, target_date: g.target_date || null, priority: g.priority, status: 'active' })))
      }
      toast.success('Welcome to Cervio!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 11,
    padding: '12px 15px',
    fontSize: 15,
    color: '#f0efe9',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'rgba(240,239,233,0.45)',
    textTransform: 'uppercase' as const, letterSpacing: 0.8,
    display: 'block', marginBottom: 7,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;400;500;600;700;800&display=swap');
        .ob-inp:focus { border-color: rgba(29,78,216,0.6) !important; box-shadow: 0 0 0 3px rgba(29,78,216,0.12); }
        .ob-inp::placeholder { color: rgba(240,239,233,0.22); }
        .ob-inp option { background: #111114; color: #f0efe9; }
        @keyframes obSlide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes obFade { from{opacity:0} to{opacity:1} }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'DM Sans', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased', position: 'relative', overflow: 'hidden' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.18) 0%, transparent 65%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(91,33,182,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 48, height: 48, borderRadius: 15, background: T.accentLight, border: `1px solid ${T.accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>⚡</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f0efe9', letterSpacing: -0.5, marginBottom: 4 }}>Cervio</div>
            <div style={{ fontSize: 14, color: 'rgba(240,239,233,0.38)' }}>Setting up your AI Chief of Staff</div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,239,233,0.32)', fontWeight: 500, marginBottom: 10 }}>
              <span>Step {step} of {STEPS.length}</span>
              <span>{Math.round((step / STEPS.length) * 100)}% complete</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {STEPS.map(s => (
                <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 2, background: s.id <= step ? T.accent : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
              ))}
            </div>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(12,12,18,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '32px 32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', animation: 'obSlide 0.3s ease' }} key={step}>

            <div style={{ marginBottom: 26 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0efe9', letterSpacing: -0.5, marginBottom: 4 }}>{STEPS[step - 1].title}</h2>
              <p style={{ fontSize: 14, color: 'rgba(240,239,233,0.42)' }}>{STEPS[step - 1].subtitle}</p>
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input className="ob-inp" style={inp} placeholder="Freddy Elturk" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Business name</label>
                  <input className="ob-inp" style={inp} placeholder="e.g. Morphotech" value={form.business_name} onChange={e => update('business_name', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>What does your business do?</label>
                  <textarea className="ob-inp" style={{ ...inp, resize: 'vertical' }} rows={3} placeholder="Briefly describe what your business does and who it serves..." value={form.business_description} onChange={e => update('business_description', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Your role</label>
                    <select className="ob-inp" style={{ ...inp, cursor: 'pointer' }} value={form.role} onChange={e => update('role', e.target.value)}>
                      <option value="">Select role</option>
                      {['CEO / Founder', 'Managing Director', 'COO', 'CTO', 'Executive Director', 'Other Executive'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Team size</label>
                    <select className="ob-inp" style={{ ...inp, cursor: 'pointer' }} value={form.team_size} onChange={e => update('team_size', e.target.value)}>
                      <option value="">Select size</option>
                      {['Solo', '2–10', '11–50', '51–200', '200+'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Business stage</label>
                    <select className="ob-inp" style={{ ...inp, cursor: 'pointer' }} value={form.business_stage} onChange={e => update('business_stage', e.target.value)}>
                      <option value="">Select stage</option>
                      {['Idea / Pre-revenue', 'Early stage', 'Growth', 'Scale-up', 'Established'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select className="ob-inp" style={{ ...inp, cursor: 'pointer' }} value={form.industry} onChange={e => update('industry', e.target.value)}>
                      <option value="">Select industry</option>
                      {['Technology', 'SaaS / Software', 'Finance / Fintech', 'Healthcare', 'Education', 'Energy', 'Real Estate', 'Consulting', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>What's your biggest challenge right now?</label>
                  <textarea className="ob-inp" style={{ ...inp, resize: 'vertical' }} rows={4} placeholder="e.g. Scaling the team while maintaining quality, raising our Series A..." value={form.biggest_challenge} onChange={e => update('biggest_challenge', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>What kind of support do you value most?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {[
                      { value: 'strategic',      label: 'Strategic direction & big-picture thinking' },
                      { value: 'operational',    label: 'Day-to-day operational clarity' },
                      { value: 'decisions',      label: 'Structured decision-making support' },
                      { value: 'accountability', label: 'Goal accountability & progress tracking' },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => update('support_preference', opt.value)}
                        style={{ textAlign: 'left', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${form.support_preference === opt.value ? T.accent : 'rgba(255,255,255,0.09)'}`, background: form.support_preference === opt.value ? T.accentLight : 'rgba(255,255,255,0.03)', color: form.support_preference === opt.value ? '#f0efe9' : 'rgba(240,239,233,0.5)', fontSize: 14, fontWeight: form.support_preference === opt.value ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.support_preference === opt.value ? T.accent : 'rgba(255,255,255,0.2)'}`, background: form.support_preference === opt.value ? T.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                          {form.support_preference === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: 'rgba(240,239,233,0.4)', lineHeight: 1.65, marginBottom: 4 }}>Set your top goals. Cervio will track these and reference them in every briefing and decision.</p>
                {goals.map((goal, i) => (
                  <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: T.accent, letterSpacing: 1.2, textTransform: 'uppercase' }}>{i === 0 ? 'Top Priority Goal' : i === 1 ? 'Secondary Goal' : `Goal ${i + 1}`}</span>
                      {i > 1 && <button onClick={() => setGoals(g => g.filter((_, idx) => idx !== i))} style={{ fontSize: 12, color: 'rgba(240,239,233,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>✕</button>}
                    </div>
                    <input className="ob-inp" style={inp} placeholder={i === 0 ? 'e.g. Hit $100k MRR by Q3' : 'e.g. Build a team of 5 engineers'} value={goal.title} onChange={e => { const u = [...goals]; u[i] = { ...u[i], title: e.target.value }; setGoals(u) }} />
                    <div>
                      <label style={{ ...labelStyle, marginBottom: 5 }}>Target date (optional)</label>
                      <input type="date" className="ob-inp" style={{ ...inp, colorScheme: 'dark' }} value={goal.target_date} onChange={e => { const u = [...goals]; u[i] = { ...u[i], target_date: e.target.value }; setGoals(u) }} />
                    </div>
                  </div>
                ))}
                <button onClick={() => setGoals(g => [...g, { title: '', target_date: '', priority: g.length + 1 }])}
                  style={{ padding: '11px 0', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, color: 'rgba(240,239,233,0.4)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  + Add another goal
                </button>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <label style={labelStyle}>How do you prefer to receive information?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                    {[
                      { value: 'direct',   label: 'Direct & concise',    desc: 'Sharp, no-fluff summaries' },
                      { value: 'detailed', label: 'Detailed & thorough', desc: 'Full analysis and context' },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => update('communication_style', opt.value)}
                        style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 13, border: `1.5px solid ${form.communication_style === opt.value ? T.accent : 'rgba(255,255,255,0.09)'}`, background: form.communication_style === opt.value ? T.accentLight : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0efe9', marginBottom: 4 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,239,233,0.4)' }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Daily briefing time</label>
                  <input type="time" className="ob-inp" style={{ ...inp, colorScheme: 'dark' }} value={form.briefing_time} onChange={e => update('briefing_time', e.target.value)} />
                  <p style={{ fontSize: 12, color: 'rgba(240,239,233,0.3)', marginTop: 7 }}>Cervio delivers your daily briefing at this time each morning.</p>
                </div>

                {/* Summary */}
                <div style={{ padding: '16px 18px', background: T.accentLight, borderRadius: 14, border: `1px solid ${T.accentMid}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12 }}>Your Cervio setup</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      ['Name', form.full_name],
                      ['Business', form.business_name],
                      ['Role', form.role],
                      ['Goals set', goals.filter(g => g.title).length > 0 ? String(goals.filter(g => g.title).length) : null],
                      ['Briefing', form.briefing_time],
                    ].filter(([, v]) => v).map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'rgba(240,239,233,0.45)' }}>{l}</span>
                        <span style={{ color: '#f0efe9', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(240,239,233,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <ArrowLeft size={15} />Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(29,78,216,0.35)', transition: 'all 0.15s', letterSpacing: -0.2 }}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: loading ? 'rgba(255,255,255,0.1)' : T.success, color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 3px 12px rgba(20,108,52,0.35)', opacity: loading ? 0.7 : 1, letterSpacing: -0.2 }}>
                <CheckCircle size={15} />{loading ? 'Setting up...' : 'Launch Cervio'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
