import Link from 'next/link'
import Image from 'next/image'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import useProfile from '../hooks/useProfile'

export default function Layout({ children }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const isLoginPage = router.pathname === '/'

  // Use centralized profile hook
  const { profile, loading: loadingProfile } = useProfile()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <header
        style={{
          background: 'linear-gradient(135deg, #8d171b 0%, #b91d24 100%)',
          color: 'white',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
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
          <h1 style={{ margin: 0, fontFamily: 'Raleway, sans-serif', fontSize: '1.5rem' }}>
            MEDIC Foundation
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {!isLoginPage && (
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link
                href="/profile"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'opacity 0.2s',
                  opacity: router.pathname === '/profile' ? 1 : 0.9
                }}
              >
                Profile
              </Link>

              <Link
                href="/timesheet"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'opacity 0.2s',
                  opacity: router.pathname === '/timesheet' ? 1 : 0.9
                }}
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
                padding: '0.5rem 0.75rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              title="Log out"
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </header>

      <main style={{
        flex: 1,
        padding: '2rem',
      }}>
        {children}
      </main>

      <footer
        style={{
          marginTop: 'auto',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#555',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <p style={{ margin: 0 }}>
          If you have any questions, concerns, or need support, please reach out to us at{' '}
          <a
            href="mailto:it.medicfoundation@gmail.com"
            style={{
              color: '#8d171b',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.2s'
            }}
          >
            it.medicfoundation@gmail.com
          </a>
        </p>
      </footer>
    </div>
  )
}
