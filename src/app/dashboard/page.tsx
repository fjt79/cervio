'use client'

import { useEffect, useMemo, useState } from 'react'

type Recommendation = 'approve' | 'reject' | 'delay'
type Urgency = 'critical' | 'high' | 'medium' | 'low'
type DecisionAction = 'approved' | 'rejected' | 'delayed'

interface DecisionRec {
  id: string
  title: string
  context: string
  recommendation: Recommendation
  confidence_score: number
  reasoning: string
  expected_impact_approve: string
  expected_impact_reject: string
  urgency: Urgency
  consequence_label: string
  delay_count: number
  user_action: DecisionAction | null
  auto_actions: string[]
}

interface BusinessHealth {
  overall_score: number
  revenue_score: number
  execution_score: number
  team_score: number
  risk_score: number
  critical_factors: string[]
  projected_score_after_actions: number
}

interface RiskAlert {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  recommended_action: string
}

interface FinancialData {
  cash: number
  monthly_burn: number
  monthly_revenue: number
  runway_months: number
  status: string
}

interface OperatorScore {
  score: number
  prev_score: number
  insights: string[]
}

const T = {
  bg: '#0b1020',
  surface: '#11182d',
  surface2: '#16203a',
  border: 'rgba(255,255,255,0.08)',
  text: '#f4f7fb',
  textSecondary: 'rgba(244,247,251,0.7)',
  accent: '#2563eb',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  muted: '#64748b',
  successBg: 'rgba(22,163,74,0.12)',
  dangerBg: 'rgba(220,38,38,0.10)',
  warningBg: 'rgba(245,158,11,0.10)',
  accentBg: 'rgba(37,99,235,0.12)',
  dangerBorder: 'rgba(220,38,38,0.28)',
  shadowSm: '0 8px 24px rgba(0,0,0,0.18)',
  shadowLg: '0 18px 48px rgba(0,0,0,0.28)',
}

function currency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value)
}

function scoreColor(score: number): string {
  if (score >= 80) return T.success
  if (score >= 60) return T.warning
  return T.danger
}

function badgeStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    color: '#fff',
    background: color,
    lineHeight: 1,
  }
}

function cardStyle(): React.CSSProperties {
  return {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    boxShadow: T.shadowSm,
  }
}

function SectionTitle({
  title,
  right,
}: {
  title: string
  right?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          color: T.text,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </h2>
      {right}
    </div>
  )
}

function MetricCard({
  label,
  value,
  sublabel,
  tone = 'neutral',
}: {
  label: string
  value: string
  sublabel?: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}) {
  const toneColor =
    tone === 'good'
      ? T.success
      : tone === 'warn'
      ? T.warning
      : tone === 'bad'
      ? T.danger
      : T.accent

  return (
    <div
      style={{
        ...cardStyle(),
        padding: 16,
        minHeight: 110,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.textSecondary,
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: toneColor,
          letterSpacing: -0.8,
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      {sublabel ? (
        <div
          style={{
            fontSize: 13,
            color: T.textSecondary,
            lineHeight: 1.45,
          }}
        >
          {sublabel}
        </div>
      ) : null}
    </div>
  )
}

function DecisionCard({
  dec,
  onAction,
}: {
  dec: DecisionRec
  onAction: (id: string, action: DecisionAction) => void
}) {
  const [expanded, setExpanded] = useState<boolean>(dec.urgency === 'critical')

  const recColor =
    dec.recommendation === 'approve'
      ? T.success
      : dec.recommendation === 'reject'
      ? T.danger
      : T.warning

  const urgencyColor =
    dec.urgency === 'critical'
      ? T.danger
      : dec.urgency === 'high'
      ? T.warning
      : dec.urgency === 'medium'
      ? T.accent
      : T.muted

  const recLabel =
    dec.recommendation === 'approve'
      ? 'Approve'
      : dec.recommendation === 'reject'
      ? 'Reject'
      : 'Delay'

  return (
    <div
      style={{
        ...cardStyle(),
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={badgeStyle(recColor)}>{recLabel}</span>
            <span style={badgeStyle(urgencyColor)}>
              {dec.urgency.toUpperCase()}
            </span>
            <span
              style={{
                ...badgeStyle(T.surface2),
                border: `1px solid ${T.border}`,
              }}
            >
              {dec.confidence_score}% confidence
            </span>
          </div>

          <h3
            style={{
              margin: '0 0 8px',
              color: T.text,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: -0.3,
            }}
          >
            {dec.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: T.textSecondary,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {dec.context}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            border: `1px solid ${T.border}`,
            background: T.surface2,
            color: T.text,
            borderRadius: 10,
            padding: '10px 12px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {expanded ? 'Hide' : 'View'}
        </button>
      </div>

      {expanded ? (
        <div
          style={{
            borderTop: `1px solid ${T.border}`,
            paddingTop: 14,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                background: T.successBg,
                border: `1px solid rgba(22,163,74,0.18)`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: T.success,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Impact if approved
              </div>
              <div
                style={{
                  color: T.text,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {dec.expected_impact_approve}
              </div>
            </div>

            <div
              style={{
                background: T.dangerBg,
                border: `1px solid rgba(220,38,38,0.18)`,
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: T.danger,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                Impact if rejected
              </div>
              <div
                style={{
                  color: T.text,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {dec.expected_impact_reject}
              </div>
            </div>
          </div>

          <div
            style={{
              background: T.surface2,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: T.textSecondary,
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              Reasoning
            </div>
            <div
              style={{
                color: T.text,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {dec.reasoning}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => onAction(dec.id, 'approved')}
              style={{
                background: T.success,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Approve
            </button>

            <button
              type="button"
              onClick={() => onAction(dec.id, 'delayed')}
              style={{
                background: T.warning,
                color: '#111',
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Delay
            </button>

            <button
              type="button"
              onClick={() => onAction(dec.id, 'rejected')}
              style={{
                background: T.danger,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 16px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function CommandCentrePage() {
  const [pageLoading, setPageLoading] = useState<boolean>(true)
  const [health, setHealth] = useState<BusinessHealth | null>(null)
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([])
  const [pendingDecisions, setPendingDecisions] = useState<DecisionRec[]>([])
  const [resolvedDecisions, setResolvedDecisions] = useState<
    Array<{
      id: string
      title: string
      action: DecisionAction
      date: string
    }>
  >([])
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [operatorScore, setOperatorScore] = useState<OperatorScore | null>(null)
  const [executionMode, setExecutionMode] = useState<boolean>(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHealth({
        overall_score: 68,
        revenue_score: 62,
        execution_score: 71,
        team_score: 74,
        risk_score: 56,
        critical_factors: [
          'Decision latency is slowing execution',
          'Revenue conversion needs tighter follow-up',
          'Risk concentration is too high in 2 accounts',
        ],
        projected_score_after_actions: 78,
      })

      setRiskAlerts([
        {
          id: 'r1',
          severity: 'critical',
          title: 'Revenue concentration risk',
          description:
            'A large share of near-term revenue depends on a small number of customers.',
          recommended_action:
            'Prioritise collection and diversify pipeline over the next 30 days.',
        },
        {
          id: 'r2',
          severity: 'high',
          title: 'Execution delay in top initiative',
          description:
            'The highest-priority initiative is slipping due to unresolved decision bottlenecks.',
          recommended_action:
            'Approve or reject key blocked items within 24 hours.',
        },
      ])

      setPendingDecisions([
        {
          id: 'd1',
          title: 'Approve premium onboarding sprint',
          context:
            'A short focused sprint would improve onboarding completion and increase paid conversion.',
          recommendation: 'approve',
          confidence_score: 84,
          reasoning:
            'The expected increase in activation rate outweighs the short-term resource cost. Current user drop-off suggests onboarding friction is the fastest unlock.',
          expected_impact_approve:
            'Higher activation, improved conversion, better first-week retention.',
          expected_impact_reject:
            'Continued drop-off at onboarding and slower revenue expansion.',
          urgency: 'critical',
          consequence_label: 'Revenue impact',
          delay_count: 2,
          user_action: null,
          auto_actions: [],
        },
        {
          id: 'd2',
          title: 'Pause low-performing outbound channel',
          context:
            'One outbound channel is underperforming and pulling attention from higher-yield work.',
          recommendation: 'reject',
          confidence_score: 76,
          reasoning:
            'The channel currently has weak economics and poor quality leads. Resource reallocation should produce a better return.',
          expected_impact_approve:
            'If approved instead of rejected, spend and attention remain diluted.',
          expected_impact_reject:
            'Cleaner focus on stronger channels and lower wasted effort.',
          urgency: 'high',
          consequence_label: 'Efficiency',
          delay_count: 1,
          user_action: null,
          auto_actions: [],
        },
        {
          id: 'd3',
          title: 'Delay secondary dashboard redesign',
          context:
            'The redesign may improve appearance, but it is not the main bottleneck to growth right now.',
          recommendation: 'delay',
          confidence_score: 69,
          reasoning:
            'The opportunity cost is too high relative to immediate revenue and execution priorities.',
          expected_impact_approve:
            'Better polish, but little near-term commercial lift.',
          expected_impact_reject:
            'Focus remains on more important work.',
          urgency: 'medium',
          consequence_label: 'Prioritisation',
          delay_count: 0,
          user_action: null,
          auto_actions: [],
        },
      ])

      setFinancialData({
        cash: 145000,
        monthly_burn: 42000,
        monthly_revenue: 31000,
        runway_months: 3.5,
        status: 'Tight but manageable with immediate execution discipline',
      })

      setOperatorScore({
        score: 72,
        prev_score: 66,
        insights: [
          'Decisiveness improved week-on-week',
          'Execution cadence is stronger',
          'Need faster closure on revenue blockers',
        ],
      })

      setPageLoading(false)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [])

  const criticalAlerts = useMemo(
    () => riskAlerts.filter((a) => a.severity === 'critical'),
    [riskAlerts]
  )

  const handleDecisionAction = (id: string, action: DecisionAction) => {
    const decision = pendingDecisions.find((d) => d.id === id)
    if (!decision) return

    setResolvedDecisions((prev) => [
      {
        id,
        title: decision.title,
        action,
        date: new Date().toLocaleDateString('en-AU'),
      },
      ...prev,
    ])

    setPendingDecisions((prev) => prev.filter((d) => d.id !== id))

    setHealth((prev) => {
      if (!prev) return prev

      const executionBoost =
        action === 'approved' ? 6 : action === 'delayed' ? -1 : 2
      const overallBoost =
        action === 'approved' ? 4 : action === 'delayed' ? -1 : 1

      return {
        ...prev,
        execution_score: Math.max(
          0,
          Math.min(100, prev.execution_score + executionBoost)
        ),
        overall_score: Math.max(
          0,
          Math.min(100, prev.overall_score + overallBoost)
        ),
      }
    })
  }

  if (pageLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: T.bg,
          color: T.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div
          style={{
            ...cardStyle(),
            padding: 24,
            minWidth: 320,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: `3px solid ${T.border}`,
              borderTopColor: T.accent,
              margin: '0 auto 14px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Loading dashboard
          </div>
          <div style={{ color: T.textSecondary, fontSize: 14 }}>
            Preparing command centre view...
          </div>

          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 28%), #0b1020',
        color: T.text,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '28px 20px 80px',
        }}
      >
        <div
          style={{
            ...cardStyle(),
            padding: 22,
            marginBottom: 22,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            boxShadow: T.shadowLg,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: T.accentBg,
                  border: `1px solid rgba(37,99,235,0.22)`,
                  color: '#8fb4ff',
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                Command Centre
              </div>
              <h1
                style={{
                  margin: '0 0 8px',
                  fontSize: 34,
                  lineHeight: 1.05,
                  letterSpacing: -1,
                  fontWeight: 900,
                }}
              >
                AI decisions, risk, and execution in one place
              </h1>
              <p
                style={{
                  margin: 0,
                  color: T.textSecondary,
                  maxWidth: 760,
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                This replacement page is self-contained and compile-safe. It is
                designed to get your deployment unstuck immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setExecutionMode((v) => !v)}
              style={{
                border: `1px solid ${T.border}`,
                background: executionMode ? T.success : T.surface2,
                color: '#fff',
                borderRadius: 14,
                padding: '12px 16px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {executionMode ? 'Execution Mode: ON' : 'Execution Mode: OFF'}
            </button>
          </div>
        </div>

        {criticalAlerts.length > 0 ? (
          <div
            style={{
              background: T.dangerBg,
              border: `1.5px solid ${T.dangerBorder}`,
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 22,
            }}
          >
            <div
              style={{
                color: '#ffb4b4',
                fontSize: 13,
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Critical alert
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: T.text,
                marginBottom: 4,
              }}
            >
              {criticalAlerts[0].title}
            </div>
            <div style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
              {criticalAlerts[0].description}
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 22,
          }}
        >
          <MetricCard
            label="Overall health"
            value={`${health?.overall_score ?? 0}`}
            sublabel={`Projected after actions: ${health?.projected_score_after_actions ?? 0}`}
            tone={
              (health?.overall_score ?? 0) >= 80
                ? 'good'
                : (health?.overall_score ?? 0) >= 60
                ? 'warn'
                : 'bad'
            }
          />
          <MetricCard
            label="Cash runway"
            value={`${financialData?.runway_months ?? 0} mo`}
            sublabel={financialData?.status}
            tone={
              (financialData?.runway_months ?? 0) >= 6
                ? 'good'
                : (financialData?.runway_months ?? 0) >= 3
                ? 'warn'
                : 'bad'
            }
          />
          <MetricCard
            label="Monthly revenue"
            value={currency(financialData?.monthly_revenue ?? 0)}
            sublabel={`Burn: ${currency(financialData?.monthly_burn ?? 0)}`}
            tone="neutral"
          />
          <MetricCard
            label="Operator score"
            value={`${operatorScore?.score ?? 0}`}
            sublabel={`Previous: ${operatorScore?.prev_score ?? 0}`}
            tone={
              (operatorScore?.score ?? 0) >= (operatorScore?.prev_score ?? 0)
                ? 'good'
                : 'warn'
            }
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: 20,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <SectionTitle
                title="AI Decisions Required"
                right={
                  <span
                    style={{
                      ...badgeStyle(
                        pendingDecisions.some((d) => d.urgency === 'critical')
                          ? T.danger
                          : T.accent
                      ),
                    }}
                  >
                    {pendingDecisions.length}
                  </span>
                }
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {pendingDecisions.length > 0 ? (
                  pendingDecisions.map((dec) => (
                    <DecisionCard
                      key={dec.id}
                      dec={dec}
                      onAction={handleDecisionAction}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      ...cardStyle(),
                      padding: 28,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: T.success,
                        marginBottom: 8,
                      }}
                    >
                      No open decision blockers
                    </div>
                    <div style={{ color: T.textSecondary, fontSize: 14 }}>
                      You are clear to execute.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionTitle title="Resolved Decisions" />
              <div
                style={{
                  ...cardStyle(),
                  overflow: 'hidden',
                }}
              >
                {resolvedDecisions.length === 0 ? (
                  <div
                    style={{
                      padding: 20,
                      color: T.textSecondary,
                      fontSize: 14,
                    }}
                  >
                    No decisions resolved yet.
                  </div>
                ) : (
                  <div>
                    {resolvedDecisions.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        style={{
                          padding: 16,
                          borderTop:
                            idx === 0 ? 'none' : `1px solid ${T.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: T.text,
                              marginBottom: 4,
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: T.textSecondary,
                            }}
                          >
                            {item.date}
                          </div>
                        </div>

                        <span
                          style={badgeStyle(
                            item.action === 'approved'
                              ? T.success
                              : item.action === 'rejected'
                              ? T.danger
                              : T.warning
                          )}
                        >
                          {item.action}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionTitle title="Business Health" />
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  ['Revenue', health?.revenue_score ?? 0],
                  ['Execution', health?.execution_score ?? 0],
                  ['Team', health?.team_score ?? 0],
                  ['Risk', health?.risk_score ?? 0],
                ].map(([label, score]) => (
                  <div key={String(label)}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        fontSize: 13,
                        color: T.textSecondary,
                        fontWeight: 700,
                      }}
                    >
                      <span>{label}</span>
                      <span style={{ color: scoreColor(Number(score)) }}>
                        {score}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 10,
                        width: '100%',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${score}%`,
                          background: scoreColor(Number(score)),
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionTitle title="Critical Factors" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(health?.critical_factors ?? []).map((factor, index) => (
                  <div
                    key={`${factor}-${index}`}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: T.surface2,
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  >
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionTitle title="Risk Alerts" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {riskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      borderRadius: 14,
                      padding: 14,
                      background:
                        alert.severity === 'critical'
                          ? T.dangerBg
                          : alert.severity === 'high'
                          ? T.warningBg
                          : T.surface2,
                      border:
                        alert.severity === 'critical'
                          ? `1px solid ${T.dangerBorder}`
                          : `1px solid ${T.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: T.text,
                        }}
                      >
                        {alert.title}
                      </div>
                      <span
                        style={badgeStyle(
                          alert.severity === 'critical'
                            ? T.danger
                            : alert.severity === 'high'
                            ? T.warning
                            : T.accent
                        )}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.textSecondary,
                        lineHeight: 1.5,
                        marginBottom: 8,
                      }}
                    >
                      {alert.description}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.text,
                        fontWeight: 700,
                        lineHeight: 1.5,
                      }}
                    >
                      Recommended: {alert.recommended_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionTitle title="Operator Insights" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(operatorScore?.insights ?? []).map((insight, idx) => (
                  <div
                    key={`${insight}-${idx}`}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: T.surface2,
                      border: `1px solid ${T.border}`,
                      color: T.textSecondary,
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}