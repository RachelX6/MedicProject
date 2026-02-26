import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import LoadingOverlay from '../components/LoadingOverlay'

export default function ProfilePage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Format senior home nicely (casa_mia → Casa Mia)
  const formatHome = (home) => {
    if (!home) return '—'
    return home
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Load profile data
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        // fetch public profile
        const { data: publicData, error: publicError } = await supabase
          .from('volunteer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (publicError && publicError.code !== 'PGRST116') throw publicError

        // fetch private profile
        const { data: privateData, error: privateError } = await supabase
          .from('private_volunteer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (privateError && privateError.code !== 'PGRST116') throw privateError

        // Combine fields (birthday removed)
        setProfile({
          first_name: publicData?.first_name || null,
          last_name: publicData?.last_name || null,
          preferred_name: privateData?.preferred_name || null,
          email: privateData?.email || null,
          phone_number: privateData?.phone_number || null,
          senior_home: publicData?.senior_home || null
        })
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user || loading) return <LoadingOverlay message="Loading your profile..." />

  // Simple checklist
  const todos = []
  if (!profile?.phone_number) todos.push('Add your phone number')
  if (!profile?.senior_home) todos.push('Select your senior home')

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <h1>Welcome, {profile?.preferred_name || 'Volunteer'}!</h1>
        <div className="header-actions">
          <button onClick={() => router.push('/editProfile')} className="small-btn">
            ✏️ Edit Profile
          </button>
          <button onClick={handleLogout} className="small-btn logout-btn">
            Log Out
          </button>
        </div>
      </header>

      {/* Profile Information */}
      <section className="profile-info">
        <h2>Profile Information</h2>
        <p><strong>First Name:</strong> {profile?.first_name || '—'}</p>
        <p><strong>Last Name:</strong> {profile?.last_name || '—'}</p>
        <p><strong>Email:</strong> {profile?.email || '—'}</p>
        <p><strong>Phone:</strong> {profile?.phone_number || '—'}</p>
        <p><strong>Senior Home:</strong> {formatHome(profile?.senior_home)}</p>
      </section>

      {/* Overview */}
      <section className="overview">
        <h2>📝 Overview / To-Do</h2>
        {todos.length > 0 ? (
          <ul>
            {todos.map((item, index) => (
              <li key={index}>⚠️ {item}</li>
            ))}
          </ul>
        ) : (
          <p>✅ Your profile looks complete! You are ready to start volunteering.</p>
        )}
      </section>

      {/* Quick Links */}
      <section className="profile-actions">
        <h2>Quick Links</h2>
        {profile?.senior_home && (
          <button
            onClick={() => router.push(`/senior-home/${profile.senior_home}`)}
            className="main-btn senior-home-btn"
          >
            🏥 {formatHome(profile.senior_home)} Information
          </button>
        )}
        <button onClick={() => router.push('/conversationIdeas')} className="main-btn">
          💭 Conversation Ideas
        </button>
        <button onClick={() => router.push('/timesheet')} className="main-btn">
          🕑 Timesheet
        </button>
        <button onClick={() => router.push('/seniorComments')} className="main-btn">
          📝 Senior Comments
        </button>
      </section>

      <style jsx>{`
        .profile-container {
          max-width: 700px;
          margin: 2rem auto;
          padding: 2.5rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          color: #171717;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }

        h1 {
          color: #8d171b;
          font-size: 1.8rem;
          margin: 0;
        }

        h2 {
          color: #8d171b;
          margin-bottom: 0.5rem;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .profile-info {
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .overview {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ddd;
        }

        .main-btn {
          display: block;
          width: 100%;
          margin: 0.75rem 0;
          padding: 1rem 1.25rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #ffffff;
          color: #171717;
          font-size: 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .main-btn:hover {
          background-color: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .small-btn {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #171717;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .small-btn:hover {
          background-color: #f8f9fa;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .logout-btn {
          background-color: #8d171b;
          color: white;
          border: none;
        }

        .logout-btn:hover {
          background-color: #6f1317;
        }

        .senior-home-btn {
          background-color: #8d171b;
          color: white;
          border: 2px solid #8d171b;
          font-weight: 600;
        }

        .senior-home-btn:hover {
          background-color: #6f1317;
          border-color: #6f1317;
        }
      `}</style>
    </div>
  )
}