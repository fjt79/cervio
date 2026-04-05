'use client'

import { useState } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export interface DecisionRec {
  id: string
  title: string
  context: string
  recommendation: 'approve' | 'reject' | 'delay'
  confidence_score: number
  reasoning: string
  expected_impact_approve: string
  expected_impact_reject: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
  consequence_label: string
  delay_count: number
  user_action: string | null
  auto_actions: unknown[]
}

export interface BusinessHealth {
  overall_score: number
  revenue_score: number
  execution_score: number
  team_score: number
  risk_score: number
  critical_factors: string[]
  projected_score_after_actions: number
}

const T = {
  danger: '#c41e1e',
  dangerBg: 'rgba(196,30,30,0.07)',
  dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34',
  successBg: 'rgba(20,108,52,0.07)',
  successBorder: 'rgba(20,108,52,0.22)',
  successBtn: '#155e2f',
  successHover: '#0f4a24',
  accent: '#1d4ed8',
  accentLight: 'rgba(29,78,216,0.09)',
  accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207',
  warningBg: 'rgba(161,98,7,0.07)',
  warningBorder: 'rgba(161,98,7,0.2)',
  purple: '#5b21b6',
  purpleBg: 'rgba(91,33,182,0.07)',
  purpleBorder: 'rgba(91,33,182,0.18)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)',
  shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

function getUnlocks(title: string): string[] {
  const t = title.toLowerCase()

  if (t.includes('revenue') || t.includes('sales')) {
    return ['Q2 target planning', 'Pipeline review', 'Pricing strategy']
  }

  if (t.includes('hire') || t.includes('team')) {
    return ['Onboarding workflow', 'Team OKRs', 'Capacity planning']
  }

  if (t.includes('product') || t.includes('feature')) {
    return ['Sprint planning', 'Customer feedback loop', 'Release timeline']
  }

  return ['Downstream execution', 'Team alignment', 'Progress tracking']
}

function SimulationPanel({ dec }: { dec: DecisionRec }) {
  const [open, setOpen] = useState(false)

  const options = [
    {
      label: 'Approve',
      icon: '✓',
      color: T.success,
      goal: 'positive',
      risk: 'reduced',
      exec: 'high',
    },
    {
      label: 'Delay',
      icon: '⏸',
      color: T.warning,
      goal: 'neutral',
      risk: 'increasing',
      exec: 'blocked',
    },
    {
      label: 'Reject',
      icon: '✗',
      color: T.danger,
      goal: 'negative',
      risk: 'unchanged',
      exec: 'freed',
    },
  ]

  const ic = (v: string) =>
    v === 'positive' || v === 'reduced' || v === 'high' || v === 'freed'
      ? T.success
      : v === 'neutral' || v === 'unchanged' || v === 'blocked'
      ? T.warning
      : T.danger

  return (
    <div
      style={{
        marginBottom: 14,
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--surface2)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 700,
          color: T.purple,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        <span>🔬 Simulate Outcomes</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div style={{ padding: 14 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 9,
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.label}
                style={{
                  background: 'var(--surface2)',
                  border: `1px solid ${opt.color}22`,
                  borderRadius: 11,
                  padding: '12px 10px',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: opt.color,
                    marginBottom: 10,
                  }}
                >
                  {opt.icon} {opt.label}
                </div>

                {[
                  ['Goals', opt.goal],
                  ['Risk', opt.risk],
                  ['Exec', opt.exec],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        fontWeight: 500,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: ic(v as string),
                        background: `${ic(v as string)}15`,
                        padding: '1px 7px',
                        borderRadius: 20,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function DecisionCard({
  dec,
  health,
  onAction,
  onOpenExecutionPanel,
  isPrimary,
  executionMode,
}: {
  dec: DecisionRec
  health: BusinessHealth | null
  onAction: (id: string, action: string) => void
  onOpenExecutionPanel: (dec: DecisionRec) => void
  isPrimary?: boolean
  executionMode: boolean
}) {
  const [cardState, setCardState] = useState<
    'pending' | 'executing' | 'completed' | 'rejected' | 'delayed'
  >('pending')
  const [expanded, setExpanded] = useState(dec.urgency === 'critical' || !!isPrimary)

  void health

  const isCritical = dec.urgency === 'critical'
  const isCompleted = cardState === 'completed'

  const recColor =
    dec.recommendation === 'approve'
      ? T.success
      : dec.recommendation === 'reject'
      ? T.danger
      : T.warning

  const recLabel =
    dec.recommendation === 'approve'
      ? '✓ Approve'
      : dec.recommendation === 'reject'
      ? '✗ Reject'
      : '⏸ Delay'

  const handleApprove = () => {
    onOpenExecutionPanel(dec)
  }

  const handleReject = () => {
    setCardState('rejected')
    onAction(dec.id, 'rejected')
  }

  const handleDelay = () => {
    onAction(dec.id, 'delayed')
  }

  if (cardState === 'rejected') {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 18px',
          opacity: 0.4,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            textDecoration: 'line-through',
          }}
        >
          {dec.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginTop: 4,
          }}
        >
          Rejected · logged for accuracy tracking
        </div>
      </div>
    )
  }

  const leftBar = isCompleted
    ? T.success
    : isCritical
    ? T.danger
    : isPrimary
    ? T.accent
    : 'transparent'

  const borderColor = isCompleted
    ? T.successBorder
    : isCritical
    ? T.dangerBorder
    : isPrimary
    ? 'var(--border-strong)'
    : 'var(--border)'

  const boxShadow = isCritical
    ? `0 4px 20px rgba(196,30,30,0.14), ${T.shadowSm}`
    : isPrimary
    ? T.shadowMd
    : T.shadowSm

  const px = isPrimary ? '26px' : '20px'
  const py = isPrimary ? '22px' : '16px'
  const leftPad = leftBar !== 'transparent' ? (isPrimary ? '28px' : '22px') : undefined

  return (
    <div
      style={{
        background: isCritical ? 'rgba(196,30,30,0.025)' : 'var(--surface)',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (cardState === 'pending') {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(10,10,11,0.11)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = boxShadow
      }}
    >
      {leftBar !== 'transparent' && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: leftBar,
            zIndex: 1,
          }}
        />
      )}

      {isCompleted && (
        <div
          style={{
            background: T.success,
            padding: '6px 20px 6px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>
            EXECUTION COMPLETE
          </span>
        </div>
      )}

      {isCritical && cardState === 'pending' && (
        <div
          style={{
            background: T.danger,
            padding: '6px 20px 6px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <AlertTriangle size={11} style={{ color: 'white' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>
            BLOCKING EXECUTION — RESOLVE NOW
          </span>
        </div>
      )}

      {executionMode && cardState === 'pending' && (
        <div
          style={{
            background: 'rgba(29,78,216,0.06)',
            padding: '4px 20px',
            borderBottom: '1px solid rgba(29,78,216,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: T.accent }}>
            ⚡ Execution Mode — approve to open control panel
          </span>
        </div>
      )}

      <div
        style={{
          padding: `${py} ${px}`,
          paddingLeft: leftPad ?? px,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
            >
              {(dec.delay_count || 0) > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: T.dangerBg,
                    color: T.danger,
                    border: `1px solid ${T.dangerBorder}`,
                  }}
                >
                  Stalled {dec.delay_count}×
                </span>
              )}

              {isPrimary && cardState === 'pending' && !isCritical && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 100,
                    background: T.accentLight,
                    color: T.accent,
                    border: `1px solid ${T.accentMid}`,
                  }}
                >
                  Priority
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: isPrimary ? 20 : 16,
                fontWeight: isPrimary ? 700 : 650,
                color: 'var(--text)',
                lineHeight: 1.3,
                marginBottom: 6,
                letterSpacing: -0.3,
              }}
            >
              {dec.title}
            </div>

            <div
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {dec.context}
            </div>
          </div>

          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: recColor,
                background: `${recColor}12`,
                padding: '5px 12px',
                borderRadius: 100,
                marginBottom: 5,
                whiteSpace: 'nowrap',
                border: `1px solid ${recColor}28`,
              }}
            >
              {recLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {dec.confidence_score}% confidence
            </div>
            <div style={{ marginTop: 7 }}>
              {expanded ? (
                <ChevronUp size={13} style={{ color: 'var(--text-tertiary)' }} />
              ) : (
                <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            padding: `0 ${px} ${py}`,
            paddingLeft: leftPad ?? px,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ paddingTop: 18 }}>
            {(dec.delay_count || 0) >= 2 && cardState === 'pending' && (
              <div
                style={{
                  padding: '11px 14px',
                  background: T.dangerBg,
                  borderRadius: 11,
                  marginBottom: 16,
                  border: `1px solid ${T.dangerBorder}`,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: T.danger,
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  ⛔ Stalled {dec.delay_count} times. Compounding every day. Resolve
                  now.
                </p>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.9,
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  marginBottom: 8,
                }}
              >
                Why this is blocking you
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text)',
                  lineHeight: 1.68,
                }}
              >
                {dec.reasoning}
              </p>
            </div>

            <SimulationPanel dec={dec} />

            <div
              style={{
                padding: '11px 13px',
                background: T.purpleBg,
                borderRadius: 12,
                border: `1px solid ${T.purpleBorder}`,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.purple,
                  textTransform: 'uppercase',
                  letterSpacing: 0.9,
                  marginBottom: 9,
                }}
              >
                🔗 This Decision Unlocks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {getUnlocks(dec.title).map((u, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: T.purple,
                      background: T.purpleBg,
                      border: `1px solid ${T.purpleBorder}`,
                      borderRadius: 100,
                      padding: '3px 10px',
                    }}
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  background: T.successBg,
                  borderRadius: 12,
                  border: `1px solid ${T.successBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.success,
                    marginBottom: 7,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Execute → Gain
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.6,
                  }}
                >
                  {dec.expected_impact_approve}
                </p>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  background: T.dangerBg,
                  borderRadius: 12,
                  border: `1px solid ${T.dangerBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.danger,
                    marginBottom: 7,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Ignore → Cost
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.6,
                  }}
                >
                  {dec.expected_impact_reject}
                </p>
              </div>
            </div>

            {isCompleted && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '13px 15px',
                  background: T.successBg,
                  borderRadius: 12,
                  border: `1px solid ${T.successBorder}`,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: T.success,
                    marginBottom: 4,
                  }}
                >
                  ✓ Execution complete
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Decision executed and logged for accuracy scoring.
                </div>
              </div>
            )}

            {cardState === 'pending' && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 9,
                    marginBottom: 9,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleApprove}
                    style={{
                      padding: isPrimary ? '13px 0' : '11px 0',
                      background: T.successBtn,
                      color: 'white',
                      border: 'none',
                      borderRadius: 11,
                      fontSize: isPrimary ? 15 : 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      boxShadow: '0 3px 10px rgba(21,128,61,0.3)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.successHover
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = T.successBtn
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <CheckCircle size={isPrimary ? 15 : 13} />
                    {executionMode ? '⚡ Approve & Execute' : 'Approve & Execute'}
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    style={{
                      padding: isPrimary ? '13px 0' : '11px 0',
                      background: 'transparent',
                      color: T.danger,
                      border: `1.5px solid ${T.dangerBorder}`,
                      borderRadius: 11,
                      fontSize: isPrimary ? 15 : 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.dangerBg
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 9,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: '9px 0',
                      background: 'var(--surface2)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    👤 Delegate
                  </button>

                  <button
                    type="button"
                    onClick={handleDelay}
                    style={{
                      padding: '9px 0',
                      background: 'transparent',
                      color: T.danger,
                      border: `1px solid ${T.dangerBorder}`,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ⏸ Delay{' '}
                    {(dec.delay_count || 0) > 0 ? `(${dec.delay_count + 1}×)` : ''}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}