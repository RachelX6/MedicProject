// hooks/useProfile.js
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

export default function useProfile() {
  const user     = useUser()
  const supabase = useSupabaseClient()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('personal_profiles_view')
      .select(`
        id,
        email,
        user_role,
        user_status,
        first_name,
        last_name,
        preferred_name,
        phone_number,
        gender,
        birthday,
        primary_language,
        secondary_language,
        senior_home
      `)
      .eq('email', user.email)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Error loading profile', error)
        else       setProfile(data)
      })
      .finally(() => setLoading(false))
  }, [user, supabase])

  return { profile, loading }
}
