import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET /api/calendar/events?start=ISO&end=ISO
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start') || new Date().toISOString()
    const end = searchParams.get('end') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .select(`
        *,
        goals(id, title),
        meetings(id, title, brief)
      `)
      .eq('user_id', user.id)
      .gte('start_time', start)
      .lte('start_time', end)
      .order('start_time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ events: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/calendar/events - Create event
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('calendar_events')
      .insert({ ...body, user_id: user.id, external_source: 'manual' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ event: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
