import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import useProfile from '../hooks/useProfile'

export default function EditProfile() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { profile, loading } = useProfile()

  const [form, setForm] = useState({
    first_name: '',
    preferred_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    birthday: '',
    primary_language: '',
    secondary_language: '',
    senior_home: '',
    email: ''
  })

  // Prefill form when profile data loads
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        preferred_name: profile.preferred_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        gender: profile.gender || '',
        birthday: profile.birthday || '',
        primary_language: profile._private?.primary_language || '',
        secondary_language: profile._private?.secondary_language?.join(', ') || '',
        senior_home: profile.senior_home || '',
        email: profile.email || ''
      })
    }
  }, [profile])


  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) return

    const secondaryList = form.secondary_language
      ? form.secondary_language.split(',').map(s => s.trim())
      : []

    try {
      // Update public profile (volunteer_profiles)
      const { error: publicError } = await supabase
        .from('volunteer_profiles')
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          preferred_name: form.preferred_name,
          senior_home: form.senior_home,
        })
        .eq('user_id', user.id)

      if (publicError) throw publicError

      // Update private profile (private_volunteer_profiles)
      const { error: privateError } = await supabase
        .from('private_volunteer_profiles')
        .update({
          preferred_name: form.preferred_name,
          email: form.email,
          phone_number: form.phone_number,
          gender: form.gender,
          birthday: form.birthday,
          primary_language: form.primary_language,
          secondary_language: secondaryList,
        })
        .eq('user_id', user.id)

      if (privateError) throw privateError

      alert('Profile updated successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update profile: ' + error.message)
    }
  }

  if (!user || loading) return <p>Loading...</p>

  const seniorHomes = [
    'Arbutus Care Center', 'Casa Mia', 'Opal by Element', 'Pinegrove Place',
    'Point Grey Private Hospital', 'South Granville Lodge', 'Tapestry', 'Terrace on 7th'
  ]

  return (
    <div style={{
      maxWidth: '650px',
      margin: '3rem auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    }}>
      <h1 style={{ color: '#8d171b', marginBottom: '2rem', textAlign: 'center' }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSubmit}>
        {['first_name', 'preferred_name', 'last_name', 'email', 'phone_number', 'birthday'].map((name) => (
          <div key={name} style={{ marginBottom: '1.5rem', color: 'black' }}>
            <label htmlFor={name} style={{ fontWeight: 'bold' }}>
              {name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </label><br />
            <input
              type={name === 'email' ? 'email' : name === 'birthday' ? 'date' : 'text'}
              id={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '0.3rem',
              }}
            />
          </div>
        ))}

        {/* Gender */}
        <div style={{ marginBottom: '1.5rem', color: 'black' }}>
          <label htmlFor="gender" style={{ fontWeight: 'bold' }}>Gender</label><br />
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginTop: '0.3rem',
            }}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Languages */}
        <div style={{ marginBottom: '1.5rem', color: 'black' }}>
          <label htmlFor="primary_language" style={{ fontWeight: 'bold' }}>Primary Language</label><br />
          <select
            id="primary_language"
            name="primary_language"
            value={form.primary_language}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginTop: '0.3rem',
            }}
          >
            <option value="">Select primary language</option>
            {['English', 'Mandarin', 'Cantonese', 'Punjabi', 'Tagalog', 'Korean', 'Vietnamese', 'Hindi', 'Japanese', 'Spanish', 'Farsi', 'French'].map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem', color: 'black' }}>
          <label htmlFor="secondary_language" style={{ fontWeight: 'bold' }}>
            Secondary Languages (comma-separated)
          </label><br />
          <input
            id="secondary_language"
            name="secondary_language"
            value={form.secondary_language}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginTop: '0.3rem',
            }}
          />
        </div>

        {/* Senior Home */}
        <div style={{ marginBottom: '2rem', color: 'black' }}>
          <label htmlFor="senior_home" style={{ fontWeight: 'bold' }}>Senior Home</label><br />
          <select
            id="senior_home"
            name="senior_home"
            value={form.senior_home}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginTop: '0.3rem',
            }}
          >
            <option value="">Select a senior home</option>
            {seniorHomes.map(home => (
              <option key={home} value={home}>{home}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button type="submit" style={{
            backgroundColor: '#8d171b',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginRight: '1rem',
          }}>Save Changes</button>

          <button type="button" onClick={() => router.push('/')} style={{
            backgroundColor: '#ccc',
            color: '#333',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
