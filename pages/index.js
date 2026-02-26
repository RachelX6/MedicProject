import React, { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import LoadingOverlay from '../components/LoadingOverlay'

export default function LoginPage() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 🔍 After sign-in, check if user profile exists
  useEffect(() => {
    const checkUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (user) {
        setLoading(true)
        // Check if user already has a profile in private_volunteer_profiles
        const { data: profiles, error } = await supabase
          .from('private_volunteer_profiles')
          .select('id')
          .eq('email', user.email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking profile:', error)
          setLoading(false)
          return
        }

        // Redirect based on whether a profile exists
        if (profiles) {
          router.replace('/profile')
        } else {
          router.replace('/register')
        }
      }
    }

    checkUserProfile()
  }, [supabase, router])

  const handleGoogle = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    setLoading(false) // fallback if redirect fails
  }

  return (
    <>
      {loading && <LoadingOverlay message="Redirecting..." />}

      <div className="login-page">
        {/* Hero Section */}
        <div className="hero-section fade-in">
          <div className="hero-content">
            <h1 className="hero-title">MEDIC Foundation</h1>
            <p className="hero-tagline">Connecting Volunteers with Seniors</p>
            <p className="hero-mission">
              Making meaningful connections between dedicated volunteers and seniors in care homes across Vancouver
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-container">
          <div className="login-card fade-in-scale delay-2">
            <h2>Welcome</h2>
            <p className="login-subtitle">Sign in to continue your volunteer journey</p>
            <button className="google-button" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '12px' }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>
            <p className="privacy-note">Your privacy is protected. We only access your basic profile information.</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="features-section">
          <div className="feature-card slide-up delay-1">
            <div className="feature-icon">📅</div>
            <h3>Easy Scheduling</h3>
            <p>Book visits with seniors at times that work for you. Track your hours effortlessly.</p>
          </div>
          <div className="feature-card slide-up delay-2">
            <div className="feature-icon">💬</div>
            <h3>Meaningful Connections</h3>
            <p>Build lasting relationships with seniors through engaging activities and conversations.</p>
          </div>
          <div className="feature-card slide-up delay-3">
            <div className="feature-icon">📊</div>
            <h3>Track Your Hours</h3>
            <p>Keep a record of your volunteer sessions and see the time you have dedicated to supporting seniors.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section fade-in delay-4">
          <h2>Ready to Make a Difference?</h2>
          <p>Join our community of volunteers bringing joy to seniors across Vancouver.</p>
        </div>

        <style jsx>{`
          .login-page {
            padding-bottom: 2rem;
          }

          .hero-section {
            background: linear-gradient(135deg, #8d171b 0%, #b91d24 50%, #8d171b 100%);
            color: white;
            padding: 4rem 2rem 3rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }

          .hero-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .hero-title {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            font-family: 'Raleway', sans-serif;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }

          .hero-tagline {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            opacity: 0.95;
            font-weight: 300;
          }

          .hero-mission {
            font-size: 1.1rem;
            line-height: 1.6;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
          }

          .login-container {
            display: flex;
            justify-content: center;
            padding: 3rem 1rem;
          }

          .login-card {
            background: white;
            padding: 3rem 2.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
            text-align: center;
            max-width: 450px;
            width: 100%;
            border: 1px solid rgba(141, 23, 27, 0.1);
          }

          .login-card h2 {
            color: #8d171b;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            font-family: 'Raleway', sans-serif;
          }

          .login-subtitle {
            color: #666;
            margin-bottom: 2rem;
            font-size: 1rem;
          }

          .google-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background: white;
            color: #444;
            border: 2px solid #e0e0e0;
            padding: 0.875rem 1.5rem;
            border-radius: 8px;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .google-button:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #8d171b;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .google-button:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
            opacity: 0.6;
          }

          .privacy-note {
            margin-top: 1.5rem;
            font-size: 0.85rem;
            color: #888;
            line-height: 1.4;
          }

          .features-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            max-width: 1100px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .feature-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
          }

          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(141, 23, 27, 0.15);
            border-color: rgba(141, 23, 27, 0.2);
          }

          .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .feature-card h3 {
            color: #8d171b;
            font-size: 1.3rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }

          .feature-card p {
            color: #666;
            line-height: 1.6;
            font-size: 0.95rem;
          }

          .cta-section {
            background: linear-gradient(135deg, #6f1317 0%, #8d171b 100%);
            color: white;
            text-align: center;
            padding: 3rem 2rem;
            margin: 2rem auto;
            max-width: 800px;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(141, 23, 27, 0.3);
          }

          .cta-section h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }

          .cta-section p {
            font-size: 1.1rem;
            opacity: 0.95;
            line-height: 1.6;
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.2rem;
            }

            .hero-tagline {
              font-size: 1.2rem;
            }

            .features-section {
              grid-template-columns: 1fr;
              padding: 1rem;
            }

            .login-card {
              padding: 2rem 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  )
}


export const getServerSideProps = async (ctx) => {
  const supabaseServer = createPagesServerClient(ctx)
  const { data: { session } } = await supabaseServer.auth.getSession()

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
