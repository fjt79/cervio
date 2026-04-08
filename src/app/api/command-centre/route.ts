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
      risk_alerts: riskAlertsRes.data || [],
      meetings: meetingsRes.data || [],
      pending_decisions: [],
      execution_actions: [],
      business_health: null,
      ai_analysis: null,
    })
  } catch (err: any) {
    console.error('Command centre error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
