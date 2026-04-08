import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"
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

    const [profileRes, goalsRes, decisionsRes, riskAlertsRes, pendingDecisionsRes, healthRes, executionRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabaseAdmin.from('decisions').select('id, title, created_at, analysis').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('risk_alerts').select('*').eq('user_id', user.id).eq('is_resolved', false).order('created_at', { ascending: false }),
      supabaseAdmin.from('decision_recommendations').select('*').eq('user_id', user.id).is('user_action', null).order('created_at', { ascending: false }),
      supabaseAdmin.from('business_health').select('*').eq('user_id', user.id).order('snapshot_date', { ascending: false }).limit(1).single(),
      supabaseAdmin.from('execution_actions').select('*').eq('user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      profile: profileRes.data,
      goals: goalsRes.data || [],
      recentDecisions: decisionsRes.data || [],
      riskAlerts: riskAlertsRes.data || [],
      pendingDecisions: pendingDecisionsRes.data || [],
      businessHealth: healthRes.data,
      pendingActions: executionRes.data || [],
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

    const [profileRes, goalsRes, decisionsRes, meetingsRes, reviewsRes, stakeholdersRes, existingAlertsRes, pendingDecisionsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).order('priority'),
      supabaseAdmin.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id).gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2),
      supabaseAdmin.from('stakeholders').select('*').eq('user_id', user.id).order('importance', { ascending: false }),
      supabaseAdmin.from('risk_alerts').select('*').eq('user_id', user.id).eq('is_resolved', false),
      supabaseAdmin.from('decision_recommendations').select('*').eq('user_id', user.id).is('user_action', null),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const decisions = decisionsRes.data || []
    const meetings = meetingsRes.data || []
    const reviews = reviewsRes.data || []
    const stakeholders = stakeholdersRes.data || []
    const existingAlerts = existingAlertsRes.data || []
    const pendingDecisions = pendingDecisionsRes.data || []

    const activeGoals = goals.filter((g: any) => g.status === 'active')
    const avgProgress = activeGoals.length ? Math.round(activeGoals.reduce((a: number, g: any) => a + (g.current_progress || 0), 0) / activeGoals.length) : 0
    const overdueGoals = activeGoals.filter((g: any) => g.target_date && new Date(g.target_date) < now && (g.current_progress || 0) < 100)
    const coldStakeholders = stakeholders.filter((s: any) => {
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

RECENT DECISIONS (${decisions.length}):
${decisions.slice(0, 5).map((d: any) => `- "${d.title}" (${new Date(d.created_at).toLocaleDateString('en-AU')})`).join('\n') || 'None'}

PENDING DECISIONS AWAITING ACTION: ${pendingDecisions.length}
MEETINGS THIS WEEK: ${meetings.length}
COLD HIGH-VALUE RELATIONSHIPS: ${coldStakeholders.map((s: any) => s.name).join(', ') || 'None'}
LAST WEEKLY REVIEW: ${reviews?.[0] ? `Score ${reviews[0].week_score}/100 (${reviews[0].content?.week_label})` : 'None yet'}
EXISTING UNRESOLVED ALERTS: ${existingAlerts.length}

Generate a complete command centre analysis. Return ONLY this exact JSON:

{
  "business_health": {
    "overall_score": <0-100>,
    "revenue_score": <0-100>,
    "execution_score": <0-100>,
    "team_score": <0-100>,
    "risk_score": <0-100>,
    "critical_factors": ["<factor>", "<factor>"],
    "recommended_actions": ["<action>", "<action>"],
    "projected_score_after_actions": <0-100>
  },
  "risk_alerts": [
    {
      "alert_type": "<revenue|execution|relationship|deadline|pattern>",
      "severity": "<critical|high|medium>",
      "title": "<max 8 words>",
      "description": "<2-3 sentences, specific>",
      "recommended_action": "<one specific action>",
      "auto_action_available": false
    }
  ],
  "decision_recommendations": [
    {
      "title": "<specific decision title>",
      "context": "<why needed now>",
      "recommendation": "<approve|reject|delay>",
      "confidence_score": <0-100>,
      "reasoning": "<specific reasoning>",
      "expected_impact_approve": "<what happens if approved>",
      "expected_impact_reject": "<what happens if rejected>",
      "urgency": "<critical|high|normal>",
      "consequence_label": "<e.g. Revenue at risk>",
      "auto_actions": []
    }
  ],
  "one_move": {
    "title": "<single most important action today>",
    "reasoning": "<why this, specific to their situation>",
    "time_required": "<e.g. 20 minutes>",
    "impact": "<what changes if done today>"
  },
  "accountability": {
    "avoidance_patterns": ["<pattern>"],
    "pressure_message": "<direct challenge, 1-2 sentences>"
  }
}

Be SPECIFIC. Reference real goals and real numbers. Return ONLY valid JSON.`

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

    // Save risk alerts
    if (analysis.risk_alerts?.length > 0) {
      await supabaseAdmin.from('risk_alerts').insert(
        analysis.risk_alerts.map((alert: any) => ({ user_id: user.id, ...alert }))
      )
    }

    // Save decision recommendations
    if (analysis.decision_recommendations?.length > 0) {
      await supabaseAdmin.from('decision_recommendations').insert(
        analysis.decision_recommendations.map((dec: any) => ({ user_id: user.id, ...dec }))
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
