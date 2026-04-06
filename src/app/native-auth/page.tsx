import { Suspense } from 'react'
import NativeAuthClient from './NativeAuthClient'

export default function NativeAuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#080810', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14, fontFamily:'system-ui' }}>Loading...</div>
      </div>
    }>
      <NativeAuthClient />
    </Suspense>
  )
}
