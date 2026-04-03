'use client'
import Link from 'next/link'
import { ArrowRight, Brain, Zap, Target, Calendar, CheckCircle, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-accent">Cervio</span>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent2/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-accent/6 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 text-xs text-accent tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            AI Chief of Staff
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-black leading-none mb-6 tracking-tight">
            Think sharper.<br />
            <span className="gradient-text">Decide faster.</span><br />
            Lead better.
          </h1>

          <p className="text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Cervio is your AI Chief of Staff — a personalised intelligence layer that learns how you lead,
            supports every decision, and keeps you ahead of the game.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup" className="btn-primary flex items-center gap-2 text-base">
              Start your free 14-day trial
              <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="btn-secondary text-base">
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-accent text-accent" />)}
              <span className="ml-1">Loved by founders</span>
            </div>
            <span className="text-border">·</span>
            <span>No credit card required</span>
            <span className="text-border">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-xs tracking-widest uppercase mb-4">Core Product</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Four features. One intelligent platform.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                number: '01',
                title: 'Daily Briefing',
                desc: 'Every morning, Cervio delivers a personalised briefing tailored to your business, goals, and context. 3 minutes. Maximum signal.',
                items: ['Top 3 priorities for the day', 'Decisions that need attention', 'Risks and flags', 'One strategic prompt']
              },
              {
                icon: Zap,
                number: '02',
                title: 'Decision Support',
                desc: 'Describe any situation. Cervio analyses it, maps your options, assesses risks, and gives a clear recommendation.',
                items: ['Situation analysis', '3 options with trade-offs', 'Personalised recommendation', 'Post-decision watchpoints']
              },
              {
                icon: Calendar,
                number: '03',
                title: 'Meeting Prep',
                desc: 'Before any meeting — investor, board, client, negotiation — Cervio prepares you with a concise brief.',
                items: ['Meeting objective', 'Key points and questions', 'Risks and sensitivities', 'Recommended outcome']
              },
              {
                icon: Target,
                number: '04',
                title: 'Goal Tracking',
                desc: 'Set your business and personal goals. Cervio integrates them into every interaction and nudges action.',
                items: ['Progress tracking', 'Weekly check-ins', 'Blocker identification', 'Action recommendations']
              }
            ].map((feature) => (
              <div key={feature.number} className="card-hover group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="font-display text-5xl font-black text-border/50 group-hover:text-border transition-colors">
                    {feature.number}
                  </span>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {feature.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-text/80">
                      <span className="text-accent">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent text-xs tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="font-display text-4xl font-bold mb-16">Up and running in 10 minutes.</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Tell Cervio about you', desc: 'Complete a 10-minute onboarding. Your business, goals, challenges, and how you make decisions.' },
              { step: '2', title: 'Get your first briefing', desc: 'Cervio immediately delivers your first personalised briefing — you experience the value within minutes.' },
              { step: '3', title: 'It gets smarter every day', desc: 'The more you use Cervio, the better it knows you. Your intelligence layer compounds over time.' },
            ].map(s => (
              <div key={s.step} className="card text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-accent font-bold">{s.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-border" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent text-xs tracking-widest uppercase mb-4">Pricing</p>
            <h2 className="font-display text-4xl font-bold">Simple pricing. Start free.</h2>
            <p className="text-muted mt-4">14-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Solo', price: '$49', period: '/month', features: ['1 user', 'All 4 core features', '100 interactions/month', 'Standard memory'], popular: false },
              { name: 'Pro', price: '$99', period: '/month', features: ['1 user', 'Unlimited interactions', 'Priority AI processing', 'Advanced memory engine'], popular: true },
              { name: 'Team', price: '$299', period: '/month', features: ['Up to 5 users', 'Shared goals & context', 'Admin dashboard', 'Team analytics'], popular: false },
            ].map(plan => (
              <div key={plan.name} className={`card relative ${plan.popular ? 'border-accent glow-accent' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-muted text-xs tracking-widest uppercase mb-3">{plan.name}</p>
                  <div className="font-display text-4xl font-bold">{plan.price}</div>
                  <div className="text-muted text-sm">{plan.period}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <CheckCircle size={14} className="text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`w-full text-center block py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-accent text-bg hover:bg-accent/90'
                      : 'bg-surface2 text-text border border-border hover:border-accent/40'
                  }`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-6">
            Ready to lead with an AI advantage?
          </h2>
          <p className="text-muted mb-10">
            Join the executives who use Cervio to make better decisions, faster.
          </p>
          <Link href="/auth/signup" className="btn-primary text-base inline-flex items-center gap-2">
            Start your free 14-day trial
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 text-center">
        <div className="font-display text-2xl font-bold text-accent mb-2">Cervio</div>
        <p className="text-muted text-xs tracking-widest uppercase">
          AI Chief of Staff · Built by Freddy Elturk · Powered by Morphotech
        </p>
        <div className="mt-6 flex justify-center gap-6 text-xs text-muted">
          <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
          <Link href="mailto:hello@cervio.com" className="hover:text-text transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  )
}
