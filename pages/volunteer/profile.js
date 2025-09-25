// components/VolunteerProfile.js
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function VolunteerProfile({ profile }) {
  const supabase = useSupabaseClient()
  const router = useRouter()

  if (!profile) {
    return <p style={{ color: 'black', textAlign: 'center' }}>Loading your profile...</p>
  }

  const [completedInterests, setCompletedInterests] = useState(false)
  const [completedPersonality, setCompletedPersonality] = useState(false)
  const [showScreeningLink, setShowScreeningLink] = useState(false)

  useEffect(() => {
    if (!profile) return;
    // 1) send permanent reservation once
    supabase.functions
      .invoke('add_reservation', { body: { type: 'permanent' } })
      .catch(console.error)

    // 2) check “interests” table for any row with this user.id
    supabase
      .from('interests')
      .select('id')
      .eq('id', profile.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setCompletedInterests(true)
      })

    // 3) check “volunteer_personality” for this user.id
    supabase
      .from('volunteer_personality')
      .select('id')
      .eq('id', profile.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setCompletedPersonality(true)
      })

    // 4) show screening link if still pending
    setShowScreeningLink(profile.user_status === 'pending')
  }, [profile, supabase])

  const hasTodos =
    !completedInterests ||
    !completedPersonality ||
    showScreeningLink

  const borderColor =
    profile.user_status === 'rejected' ? 'red' :
      profile.user_status === 'pending' ? 'goldenrod' :
        'transparent'

  const handleLogout = () => {
    supabase.auth.signOut().then(() => router.push('/'))
  }

  return (
    <div style={{
      maxWidth: '800px',
      color: 'black',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : undefined,
    }}>
      {/* Header */}
      <section style={{ position: 'relative', borderBottom: '1px solid #ccc', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#8d171b', fontSize: '2rem' }}>
          Hi {profile.preferred_name}!
        </h1>
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          {profile.user_status === 'pending' && <span style={{ color: 'goldenrod' }}>⏳ Pending</span>}
          {profile.user_status === 'rejected' && <span style={{ color: 'red' }}>❌ Rejected</span>}
          <button
            onClick={() => router.push('/volunteer/settings')}
            style={{
              color: 'black',
              background: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '0.4rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            ⚙️ Settings
          </button>
          <button onClick={() => router.push('/editProfile')} style={{
            color: 'black',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '0.4rem 0.75rem',
            cursor: 'pointer'
          }}>
            ✏️ Edit Profile
          </button>
        </div>
        {/* Basic Info */}
        <div style={{ marginTop: '1rem', lineHeight: '1.5', paddingBottom: '1rem' }}>
          <p><strong>Preferred Name:</strong> {profile.preferred_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Birthday:</strong> {profile.birthday}</p>
          <p><strong>Primary Language:</strong> {profile.primary_language}</p>
          <p><strong>Secondary Languages:</strong> {(profile.secondary_language || []).join(', ')}</p>
          <p><strong>Senior Home:</strong> {profile.senior_home}</p>
        </div>
      </section>

      {/* Guide (expanded) */}
      <section style={{ borderBottom: '1px solid #ccc', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <h2 style={{ color: '#8d171b' }}>📝 Guide</h2>
        <ul style={{ paddingLeft: '1rem', lineHeight: '1.6', listStyle: 'none' }}>
          <GuideItem
            icon="😊"
            title="You will be matched with a senior"
            body={
              <>
                After you complete your questionnaires and screening, our team will match you with a senior.
                If you need to update your own details, use the <strong>✏️ Edit Profile</strong> button at the top right.
              </>
            }
          />
          <GuideItem
            icon="💬"
            title="Conversation Ideas"
            body={
              <>
                This page gives you ideas that may help during sessions — whether it’s starting conversations,
                trying an activity, or getting to know the senior better. The suggestions are generated based on
                the senior’s chosen interests, so they are tailored to them.
              </>
            }
          />
          <GuideItem
            icon="📅"
            title="Change Availability"
            body={
              <>
                If you are unavailable for an upcoming session, go to the <strong>📆 Change Availability</strong> page to cancel. Please cancel as early as possible — it must be done
                <strong> at least 2 days before</strong> the session, to ensure the senior has a volunteer for that session. 
              </>
            }
          />
          <GuideItem
            icon="📖"
            title="View Upcoming Sessions"
            body={
              <>
                This is your schedule. Review the dates and times for your upcoming visits so you are on time.
                If you are unavailable for a session, go to <strong>📆 Change Availability</strong> .
              </>
            }
          />
          <GuideItem
            icon="📬"
            title="Email Preferences"
            body={
              <>
                Choose how you want to get notifications about new openings.
                Go to <strong>⚙️ Settings</strong> to update your email preferences so you do not miss important updates.
              </>
            }
            cta={
              <button
                onClick={() => router.push('/volunteer/settings')}
                style={linkButtonStyle}
              >
                Open Settings
              </button>
            }
          />
          <GuideItem
            icon="🔒"
            title="Account Status (Security Check)"
            body={
              <>
                Your account will show as pending at the top of your profile until we have received the results of your security check. While your account is <strong>Pending</strong>,
                you can still explore the portal and complete your questionnaires, but you will not be able to begin sessions until the check is complete.
              </>
            }
          />
        </ul>
      </section>

      {/* To-Do List */}
      {hasTodos && (
        <section style={{ borderBottom: '1px solid #ccc', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#8d171b' }}>📋 To-Do List</h2>
          <ul style={{ paddingLeft: '1rem', marginBottom: '1.5rem'}}>
            {!completedInterests && <li>✅ Fill out Interests Questionnaire</li>}
            {!completedPersonality && <li>✅ Complete Personality Questionnaire</li>}
            {showScreeningLink && (
              <li>
                🔗 Complete screening:{' '}
                <a
                  href="https://justice.gov.bc.ca/screening/crrpa/org-access"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0645AD', textDecoration: 'underline' }}
                >
                  link
                </a>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Navigation */}
      <section style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#8d171b' }}>📂 Navigation</h2>
        <StyledButton onClick={() => router.push('/questionnaire')}>
          🌱 Personality Questionnaire
        </StyledButton>
        <StyledButton onClick={() => router.push('/interestsQuestionnaire')}>
          🎯 Interests Questionnaire
        </StyledButton>
        <StyledButton onClick={() => router.push('/volunteer/changeAvailability')}>
          📆 Change Availability
        </StyledButton>
        <StyledButton onClick={() => router.push('/volunteer/conversationIdeas')}>
          💭 Conversation Ideas
        </StyledButton>
        <StyledButton onClick={() => router.push('/volunteer/timesheet')}>
          🕑 Timesheet
        </StyledButton>
      </section>

      {/* Logout */}
      <section style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handleLogout} style={{
          backgroundColor: '#8d171b',
          color: '#fff',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Log Out
        </button>
      </section>
    </div>
  )
}

function GuideItem({ icon, title, body, cta }) {
  return (
    <li style={{ marginBottom: '0.9rem' }}>
      <div style={{ fontWeight: 600 }}>
        {icon} <span>{title}</span>
      </div>
      <p style={{ margin: '0.3rem 0 0 1.75rem', fontSize: '0.95rem' }}>
        {body}
      </p>
      {cta ? (
        <div style={{ margin: '0.5rem 0 0 1.75rem' }}>
          {cta}
        </div>
      ) : null}
    </li>
  )
}

const linkButtonStyle = {
  backgroundColor: '#f5f5f5',
  border: '1px solid #ccc',
  padding: '0.4rem 0.75rem',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  color: 'black'
}

const buttonStyle = {
  backgroundColor: '#f5f5f5',
  color: 'black',
  border: '1px solid #ccc',
  padding: '0.75rem 1rem',
  borderRadius: '5px',
  cursor: 'pointer',
  textAlign: 'left'
}

function StyledButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        padding: '0.75rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        textAlign: 'left',
        color: 'black',
        transition: 'background 0.2s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#eee')}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
    >
      {children}
    </button>
  )
}
