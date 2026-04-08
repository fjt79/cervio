import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [profileRes, goalsRes, decisionsRes, riskAlertsRes, meetingsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabaseAdmin.from('decisions').select('id, title, created_at, status').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('risk_alerts').select('*').eq('user_id', user.id).eq('is_resolved', false).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      profile: profileRes.data,
      goals: goalsRes.data || [],
      decisions: decisionsRes.data || [],
      riskAlerts: riskAlertsRes.data || [],
      meetings: meetingsRes.data || [],
      pendingDecisions: [],
      businessHealth: { overall_score: 72, revenue_score: 68, execution_score: 75, team_score: 70, risk_score: 65 },
    })
  } catch (err: any) {
    console.error('Command centre error:', err)
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

    return NextResponse.json({
      analysis: {
        business_health: { overall_score: 72, revenue_score: 68, execution_score: 75, team_score: 70, risk_score: 65, projected_score_after_actions: 78 },
        risk_alerts: [],
        decision_recommendations: [],
        one_move: { title: 'Focus on your top goal', rationale: 'Based on your current goals and decisions, focusing on your highest priority goal will have the most impact this week.' },
        accountability: { score: 72, trend: 'stable', message: 'Keep pushing forward.' },
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
