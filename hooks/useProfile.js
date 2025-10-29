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

      // Fetch the volunteer’s private profile
      const { data, error } = await supabase
        .from('private_volunteer_profiles')
        .select('user_id, status, phone_number, email, birthday, gender')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading volunteer profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [user, supabase])

  return { profile, loading }
}
