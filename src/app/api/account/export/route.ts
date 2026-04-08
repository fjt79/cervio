import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // Fetch all user data in parallel
    const [profile, goals, briefings, decisions, meetings, reviews, stakeholders, boardUpdates, calendarEvents, interactions] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single().then(r => r.data),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).then(r => r.data || []),
      supabaseAdmin.from('briefings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('stakeholders').select('*').eq('user_id', user.id).then(r => r.data || []),
      supabaseAdmin.from('board_updates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('calendar_events').select('*').eq('user_id', user.id).order('start_time', { ascending: false }).then(r => r.data || []),
      supabaseAdmin.from('interactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500).then(r => r.data || []),
    ])

    // Remove sensitive fields
    const cleanProfile = { ...profile }
    delete cleanProfile.stripe_customer_id
    delete cleanProfile.subscription_id

    const exportData = {
      export_date: new Date().toISOString(),
      export_version: '1.0',
      user: {
        id: user.id,
        email: user.email,
      },
      profile: cleanProfile,
      summary: {
        goals_count: goals.length,
        briefings_count: briefings.length,
        decisions_count: decisions.length,
        meetings_count: meetings.length,
        weekly_reviews_count: reviews.length,
        stakeholders_count: stakeholders.length,
        board_updates_count: boardUpdates.length,
        calendar_events_count: calendarEvents.length,
      },
      data: {
        goals,
        briefings,
        decisions,
        meetings,
        weekly_reviews: reviews,
        stakeholders,
        board_updates: boardUpdates,
        calendar_events: calendarEvents,
        interactions,
      },
    }

    const json = JSON.stringify(exportData, null, 2)
    const filename = `cervio-data-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
