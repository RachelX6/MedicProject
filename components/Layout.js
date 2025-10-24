import Link from 'next/link'
import Image from 'next/image'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Layout({ children }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const isLoginPage = router.pathname === '/'

  // Load the volunteer's profile
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoadingProfile(false)
      return
    }

    // ✅ Query the new table
    supabase
      .from('private_volunteer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Error fetching volunteer profile:', error)
        else setProfile(data)
      })
      .finally(() => setLoadingProfile(false))
  }, [user, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <header
        style={{
          backgroundColor: '#8d171b',
          color: 'white',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/medicLogo.png"
            alt="MEDIC Logo"
            width={40}
            height={40}
            style={{ marginRight: '1rem' }}
          />
          <h1 style={{ margin: 0, fontFamily: 'Raleway, sans-serif' }}>
            MEDIC Foundation
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!isLoginPage && (
            <nav style={{ marginRight: '1rem' }}>
              <Link href="/profile" style={{ marginRight: '1rem', color: 'white' }}>
                Profile
              </Link>

              {/* ✅ Always show Timesheet for volunteers */}
              <Link
                href="/volunteer/timesheet"
                style={{ marginRight: '1rem', color: 'white' }}
              >
                Timesheet
              </Link>
            </nav>
          )}

          {user && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'white',
                color: '#8d171b',
                padding: '0.4rem',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      <main style={{ padding: '2rem' }}>{children}</main>

      <footer
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#333',
          borderTop: '1px solid #ddd',
        }}
      >
        <p>
          If you have any questions, concerns, or need support, please reach out to us at{' '}
          <a
            href="mailto:it.medicfoundation@gmail.com"
            style={{ color: '#8d171b', textDecoration: 'underline' }}
          >
            it.medicfoundation@gmail.com
          </a>
        </p>
      </footer>
    </>
  )
}
