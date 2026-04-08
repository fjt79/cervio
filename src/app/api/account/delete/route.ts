import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { confirmation_text, email_confirmed } = await request.json()

    // Final verification — must type DELETE exactly
    if (confirmation_text !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation. Please type DELETE exactly.' }, { status: 400 })
    }

    // Must confirm email matches
    if (!email_confirmed || email_confirmed.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Email address does not match your account.' }, { status: 400 })
    }

    // Delete all user data in order (cascade handles most, but explicit for safety)
    const tables = [
      'interactions', 'user_context', 'calendar_events',
      'board_updates', 'weekly_reviews', 'stakeholders',
      'briefings', 'decisions', 'meetings', 'goals', 'profiles'
    ]

    for (const table of tables) {
      await supabaseAdmin.from(table).delete().eq('user_id', user.id)
    }

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, message: 'Account and all data permanently deleted.' })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
