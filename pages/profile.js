'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingOverlay from '../components/LoadingOverlay'

export default function ProfilePage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Load profile data
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        // fetch public profile
        const { data: publicData, error: publicError } = await supabase
          .from('volunteer_profile')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (publicError && publicError.code !== 'PGRST116') throw publicError

        // fetch private profile
        const { data: privateData, error: privateError } = await supabase
          .from('private_volunteer_profile')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (privateError && privateError.code !== 'PGRST116') throw privateError

        setProfile({
          ...publicData,
          ...privateData
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

  // ✅ Simple checklist based on missing fields
  const todos = []
  if (!profile?.gender) todos.push('Add your gender')
  if (!profile?.birthday) todos.push('Add your birthday')
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
        <p><strong>Gender:</strong> {profile?.gender || '—'}</p>
        <p><strong>Birthday:</strong> {profile?.birthday || '—'}</p>
        <p><strong>Senior Home:</strong> {profile?.senior_home || '—'}</p>
      </section>

      {/* Overview / To-Do Section */}
      <section className="overview">
        <h2>📝 Overview / To-Do</h2>
        {todos.length > 0 ? (
          <ul>
            {todos.map((item, index) => (
              <li key={index}>⚠️ {item}</li>
            ))}
          </ul>
        ) : (
          <p>✅ Your profile looks complete! You’re ready to start volunteering.</p>
        )}
      </section>

      {/* Navigation Buttons */}
      <section className="profile-actions">
        <h2>Quick Links</h2>
        <button onClick={() => router.push('/conversationIdeas')} className="main-btn">
          💭 Conversation Ideas
        </button>
        <button onClick={() => router.push('/timesheet')} className="main-btn">
          🕑 Timesheet
        </button>
        <button onClick={() => router.push('/changeAvailability')} className="main-btn">
          📆 Change Availability
        </button>
      </section>

      <style jsx>{`
        .profile-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          color: black;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
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

        .overview ul {
          padding-left: 1rem;
        }

        .main-btn {
          display: block;
          width: 100%;
          margin: 0.5rem 0;
          padding: 0.75rem 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f5f5f5;
          color: black;
          font-size: 1rem;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .main-btn:hover {
          background-color: #eee;
        }

        .small-btn {
          background: #f5f5f5;
          border: 1px solid #ccc;
          padding: 0.4rem 0.75rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
          color: black;
        }

        .small-btn:hover {
          background-color: #eee;
        }

        .logout-btn {
          background-color: #8d171b;
          color: white;
          border: none;
        }

        .logout-btn:hover {
          background-color: #6f1317;
        }
      `}</style>
    </div>
  )
}
