'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // The Supabase client library handles the session from the URL hash.
    // We just need to redirect the user back to the home page.
    router.push('/')
  }, [router])

  return <p>認証処理中...</p>
}
