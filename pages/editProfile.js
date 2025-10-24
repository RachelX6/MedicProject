'use client'

import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function EditProfile() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    availability: ''
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      const { data, error } = await supabase
        .from('private_volunteer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error) {
        console.error(error)
        setMessage('Error loading profile')
      } else if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          availability: data.availability || ''
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('private_volunteer_profiles')
      .upsert({ user_id: user.id, ...profile })

    if (error) {
      console.error(error)
      setMessage('Error updating profile')
    } else {
      setMessage('Profile updated successfully')
      router.push('/profile')
    }
  }

  if (loading) return <p>Loading profile...</p>

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
      {message && <p className="text-blue-600 mb-4">{message}</p>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Availability</label>
          <input
            type="text"
            value={profile.availability}
            onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Save Changes
        </button>
      </form>
    </div>
  )
}
