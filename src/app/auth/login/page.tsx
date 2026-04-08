'use client'
import dynamic from 'next/dynamic'

const AuthForm = dynamic(() => import('@/components/features/AuthForm'), { 
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c9a96e', fontSize: 14 }}>Loading...</div>
    </div>
  )
})

export default function LoginPage() {
  return <AuthForm mode="login" />
}
