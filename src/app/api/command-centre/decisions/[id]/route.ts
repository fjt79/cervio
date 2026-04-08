import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { action, override_reason } = await request.json()

    if (!['approved', 'rejected', 'delayed', 'overridden'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the decision
    const { data: decision } = await supabaseAdmin
      .from('decision_recommendations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!decision) return NextResponse.json({ error: 'Decision not found' }, { status: 404 })

    const updates: any = {
      user_action: action,
      action_taken_at: new Date().toISOString(),
    }

    if (action === 'delayed') {
      updates.delay_count = (decision.delay_count || 0) + 1
      // Escalate consequence
      updates.consequence_escalation = (decision.consequence_escalation || 0) + 1
    }

    if (override_reason) {
      updates.user_override_reason = override_reason
    }

    const { data: updated } = await supabaseAdmin
      .from('decision_recommendations')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    // If approved and has auto_actions, create execution actions
    if ((action === 'approved' || action === 'overridden') && decision.auto_actions?.length > 0) {
      await supabaseAdmin.from('execution_actions').insert(
        decision.auto_actions.map((a: any) => ({
          user_id: user.id,
          action_type: a.type || 'email_draft',
          title: a.title,
          description: a.description,
          trigger_source: 'decision_recommendation',
          trigger_id: params.id,
          status: 'pending',
        }))
      )
    }

    return NextResponse.json({ decision: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
