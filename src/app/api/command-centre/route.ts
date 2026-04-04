import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all context in parallel
    const [profileRes, goalsRes, decisionsRes, riskAlertsRes, pendingDecisionsRes, healthRes, accountabilityRes, executionRes, stakeholdersRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabaseAdmin.from('decisions').select('id, title, created_at, analysis').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('risk_alerts').select('*').eq('user_id', user.id).eq('is_resolved', false).order('created_at', { ascending: false }),
      supabaseAdmin.from('decision_recommendations').select('*').eq('user_id', user.id).is('user_action', null).order('created_at', { ascending: false }),
      supabaseAdmin.from('business_health').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(1).single(),
      supabaseAdmin.from('accountability_log').select('*').eq('user_id', user.id).eq('log_date', now.toISOString().split('T')[0]).single(),
      supabaseAdmin.from('execution_actions').select('*').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('stakeholders').select('name, importance, last_contact_date, relationship_type').eq('user_id', user.id).order('importance', { ascending: false }).limit(10),
    ])

    return NextResponse.json({
      profile: profileRes.data,
      goals: goalsRes.data || [],
      recentDecisions: decisionsRes.data || [],
      riskAlerts: riskAlertsRes.data || [],
      pendingDecisions: pendingDecisionsRes.data || [],
      businessHealth: healthRes.data,
      todayLog: accountabilityRes.data,
      pendingActions: executionRes.data || [],
      stakeholders: stakeholdersRes.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Load full context for AI analysis
    const [profile, goals, decisions, meetings, reviews, stakeholders, existingAlerts, pendingDecisions] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single().then(r => r.data),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).order('priority'),
      supabaseAdmin.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2),
      supabaseAdmin.from('stakeholders').select('*').eq('user_id', user.id).order('importance', { ascending: false }),
      supabaseAdmin.from('risk_alerts').select('*').eq('user_id', user.id).eq('is_resolved', false),
      supabaseAdmin.from('decision_recommendations').select('*').eq('user_id', user.id).is('user_action', null),
    ])

    const activeGoals = (goals || []).filter((g: any) => g.status === 'active')
    const avgProgress = activeGoals.length ? Math.round(activeGoals.reduce((a: number, g: any) => a + (g.current_progress || 0), 0) / activeGoals.length) : 0
    const overdueGoals = activeGoals.filter((g: any) => g.target_date && new Date(g.target_date) < now && (g.current_progress || 0) < 100)
    const coldStakeholders = (stakeholders || []).filter((s: any) => {
      if (!s.last_contact_date) return s.importance >= 4
      const daysSince = Math.floor((now.getTime() - new Date(s.last_contact_date).getTime()) / 86400000)
      return s.importance >= 4 && daysSince > 21
    })

    const prompt = `You are Cervio — an AI Chief of Staff and decision-making engine for ${profile?.full_name}, ${profile?.role} at ${profile?.business_name}.

Your job is to analyse their entire business situation and generate:
1. A Business Health Score (0-100) with component scores
2. Risk Alerts (active threats and patterns)
3. Decision Recommendations (specific decisions that need to be made)
4. The ONE MOVE that matters most today
5. An Accountability assessment

FULL CONTEXT:

PROFILE:
- Name: ${profile?.full_name}
- Role: ${profile?.role} at ${profile?.business_name}
- Description: ${profile?.business_description}
- Stage: ${profile?.business_stage}
- Challenge: ${profile?.biggest_challenge}

GOALS (${activeGoals.length} active):
${activeGoals.map((g: any) => `- "${g.title}": ${g.current_progress || 0}% complete, ${g.priority === 1 ? 'HIGH' : 'MEDIUM'} priority${g.target_date ? `, due ${g.target_date}` : ''}`).join('\n') || 'None set'}

OVERDUE GOALS: ${overdueGoals.length}
AVG GOAL PROGRESS: ${avgProgress}%

RECENT DECISIONS (${decisions?.length || 0}):
${(decisions || []).slice(0, 5).map((d: any) => `- "${d.title}" (${new Date(d.created_at).toLocaleDateString('en-AU')})`).join('\n') || 'None'}

PENDING DECISIONS AWAITING ACTION: ${pendingDecisions?.length || 0}

MEETINGS THIS WEEK: ${meetings?.length || 0}

COLD HIGH-VALUE RELATIONSHIPS: ${coldStakeholders.map((s: any) => s.name).join(', ') || 'None'}

LAST WEEKLY REVIEW: ${reviews?.[0] ? `Score ${reviews[0].week_score}/100 (${reviews[0].content?.week_label})` : 'None yet'}

EXISTING UNRESOLVED ALERTS: ${existingAlerts?.length || 0}

Generate a complete command centre analysis. Return ONLY this exact JSON:

{
  "business_health": {
    "overall_score": <0-100>,
    "revenue_score": <0-100>,
    "execution_score": <0-100>,
    "team_score": <0-100>,
    "risk_score": <0-100>,
    "score_direction": "<'up' | 'down' | 'stable'>",
    "critical_factors": [
      "<specific factor dragging the score>",
      "<another factor>"
    ],
    "recommended_actions": [
      "<specific action that would improve score>",
      "<another action>"
    ],
    "projected_score_after_actions": <0-100>
  },
  "risk_alerts": [
    {
      "alert_type": "<'revenue' | 'execution' | 'relationship' | 'deadline' | 'pattern'>",
      "severity": "<'critical' | 'high' | 'medium'>",
      "title": "<sharp, specific alert title — max 8 words>",
      "description": "<2-3 sentences. Specific. Reference actual data. What is at risk and why it matters now>",
      "recommended_action": "<one specific action to resolve this>",
      "auto_action_available": <true|false>
    }
  ],
  "decision_recommendations": [
    {
      "title": "<specific decision title>",
      "context": "<why this decision is needed now>",
      "recommendation": "<'approve' | 'reject' | 'delay'>",
      "confidence_score": <0-100>,
      "reasoning": "<specific reasoning referencing their situation>",
      "expected_impact_approve": "<what happens if approved>",
      "expected_impact_reject": "<what happens if rejected>",
      "urgency": "<'critical' | 'high' | 'normal'>",
      "consequence_label": "<e.g. 'Revenue at risk' | 'Relationship degrading' | 'Deadline approaching'>",
      "auto_actions": [
        {"type": "email_draft", "title": "<action title>", "description": "<what cervio will do>"}
      ]
    }
  ],
  "one_move": {
    "title": "<the single most important action today — 1 sentence>",
    "reasoning": "<why THIS is the one thing. Be direct and specific. Reference their actual situation>",
    "time_required": "<e.g. '20 minutes' | '1 hour'>",
    "impact": "<what changes if they do this today>"
  },
  "accountability": {
    "avoidance_patterns": [
      "<pattern you've detected — be honest and specific>"
    ],
    "pressure_message": "<1-2 sentences. Direct challenge. What are they avoiding and what is it costing them>"
  }
}

Be SPECIFIC to their actual situation. Reference real goals, real numbers, real patterns. Do not be generic.
Return ONLY valid JSON. No markdown.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(clean)

    // Save business health snapshot
    await supabaseAdmin.from('business_health').insert({
      user_id: user.id,
      overall_score: analysis.business_health.overall_score,
      revenue_score: analysis.business_health.revenue_score,
      execution_score: analysis.business_health.execution_score,
      team_score: analysis.business_health.team_score,
      risk_score: analysis.business_health.risk_score,
      critical_factors: analysis.business_health.critical_factors,
      recommended_actions: analysis.business_health.recommended_actions,
      projected_score_after_actions: analysis.business_health.projected_score_after_actions,
      snapshot_date: now.toISOString().split('T')[0],
    })

    // Save risk alerts (clear old unresolved ones first for today)
    if (analysis.risk_alerts?.length > 0) {
      await supabaseAdmin.from('risk_alerts').insert(
        analysis.risk_alerts.map((alert: any) => ({
          user_id: user.id,
          ...alert,
        }))
      )
    }

    // Save decision recommendations
    if (analysis.decision_recommendations?.length > 0) {
      await supabaseAdmin.from('decision_recommendations').insert(
        analysis.decision_recommendations.map((dec: any) => ({
          user_id: user.id,
          ...dec,
        }))
      )
    }

    // Save accountability log
    await supabaseAdmin.from('accountability_log').upsert({
      user_id: user.id,
      log_date: now.toISOString().split('T')[0],
      one_move: analysis.one_move.title,
      one_move_reasoning: analysis.one_move.reasoning,
      avoidance_patterns: analysis.accountability.avoidance_patterns,
    }, { onConflict: 'user_id,log_date' })

    return NextResponse.json({ analysis })
  } catch (err: any) {
    console.error('Command centre error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
