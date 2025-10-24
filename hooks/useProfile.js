// hooks/useProfile.js
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export default function useProfile() {
  const user = useUser()
  const supabase = useSupabaseClient()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      setLoading(true)

      // Fetch from volunteer_profiles
      const { data: volunteer, error: vError } = await supabase
        .from('volunteer_profiles')
        .select('user_id, name, senior_home')
        .eq('user_id', user.id)
        .single()

      if (vError) {
        console.error('Error loading volunteer profile:', vError)
        setLoading(false)
        return
      }

      // Fetch private info (status, phone_number)
      const { data: privateData, error: pError } = await supabase
        .from('private_volunteer_profiles')
        .select('status, phone_number')
        .eq('user_id', user.id)
        .single()

      if (pError) {
        console.warn('No private volunteer info found (optional):', pError)
      }

      setProfile({
        ...volunteer,
        ...privateData,
        email: user.email
      })

      setLoading(false)
    }

    loadProfile()
  }, [user, supabase])

  return { profile, loading }
}
