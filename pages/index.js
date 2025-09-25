// pages/index.js
import React, { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import LoadingOverlay from '../components/LoadingOverlay' // 👈 adjust path if needed

export default function LoginPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Redirect client‐side if session exists after hydration
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/profile')
      }
    })
  }, [supabase, router])

  const handleGoogle = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    setLoading(false) // fallback if redirect fails
  }

  return (
    <>
      {loading && <LoadingOverlay message="Redirecting to Google..." />}

      <div className="container">
        <div className="card">
          <h1>Welcome to MEDIC Foundation</h1>
          <p>Please sign in or sign up to continue</p>
          <button className="button" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </button>
        </div>

        <style jsx>{`
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 1rem;
          }
          .card {
            background: white;
            padding: 2rem 3rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .card h1 {
            margin-bottom: 1rem;
            color: #8d171b;
            font-family: 'Raleway', sans-serif;
          }
          .card p {
            margin-bottom: 2rem;
            color: #555;
            font-size: 1rem;
          }
          .button {
            background-color: #8d171b;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s ease;
            width: 100%;
          }
          .button:hover:not(:disabled) {
            background-color: #6a1113;
          }
          .button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const supabaseServer = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabaseServer.auth.getSession()

  if (session) {
    return {
      redirect: {
        destination: '/profile',
        permanent: false,
      },
    }
  }

  return { props: {} }
}
