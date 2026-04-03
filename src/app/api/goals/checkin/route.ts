import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateGoalCheckIn, logInteraction } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    const [profileRes, goalsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('status', 'active').order('priority'),
    ])

    if (!profileRes.data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    if (!goalsRes.data?.length) return NextResponse.json({ error: 'No active goals found' }, { status: 400 })

    const checkIn = await generateGoalCheckIn(goalsRes.data, profileRes.data)

    await logInteraction(supabaseAdmin, userId, 'goal', 'weekly check-in', JSON.stringify(checkIn))

    return NextResponse.json({ checkIn })
  } catch (err: any) {
    console.error('Goal check-in API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate check-in' }, { status: 500 })
  }
}
