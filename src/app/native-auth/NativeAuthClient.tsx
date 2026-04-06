'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NativeAuthClient() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    const redirect = params.get('redirect') || '/dashboard'
    if (!token) { router.replace('/auth/login'); return }
    supabase.auth.setSession({ access_token: token, refresh_token: token })
      .then(({ error }) => { router.replace(error ? '/auth/login' : redirect) })
  }, [params, router])

  return (
    <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:'system-ui' }}>
      <div style={{ fontSize:32 }}>⚡</div>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Signing you in...</div>
    </div>
  )
}
