// hooks/useProfile.js
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

// Custom hook that returns a merged public+private volunteer profile and loading state
export default function useProfile() {
  const user = useUser()
  const supabase = useSupabaseClient()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      setLoading(true)
      try {
        const [{ data: publicData, error: publicError }, { data: privateData, error: privateError }] = await Promise.all([
          supabase.from('volunteer_profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('private_volunteer_profiles').select('*').eq('user_id', user.id).single(),
        ])

        // tolerate empty results (PGRST116) and merge fields with private taking precedence for sensitive info
        const merged = {
          first_name: publicData?.first_name || null,
          last_name: publicData?.last_name || null,

          preferred_name: privateData?.preferred_name || publicData?.preferred_name || null,
          email: privateData?.email || null,
          phone_number: privateData?.phone_number || null,
          gender: privateData?.gender || null,
          birthday: privateData?.birthday || null,
          senior_home: publicData?.senior_home || null,
          // keep raw sources if needed
          _public: publicData || null,
          _private: privateData || null,
        }

        setProfile(merged)
      } catch (err) {
        console.error('Error loading profile:', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  return { profile, loading }
}
