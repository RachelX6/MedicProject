// pages/profile.js
import dynamic from 'next/dynamic'
import useProfile from '../hooks/useProfile'

// code-split each role's component
const VolunteerProfile = dynamic(() => import('./volunteer/profile'), { ssr: false })
const SeniorProfile   = dynamic(() => import('./senior/profile'),   { ssr: false })

export default function ProfilePage() {
  const { profile, loading } = useProfile()

  if (loading) return <p>Loading…</p>
  if (!profile) return <p>Couldn’t load your profile. Please log in again.</p>

  return profile.user_role === 'volunteer'
    ? <VolunteerProfile profile={profile} />
    : <SeniorProfile   profile={profile} />
}
