import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

export default function EditProfile() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setForm({
        ...data,
        secondary_language: data.secondary_language?.join(', ') || '',
      })
    }

    fetchProfile()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const secondaryList = form.secondary_language
      ? form.secondary_language.split(',').map(s => s.trim())
      : []

    const updatedProfile = { ...form, secondary_language: secondaryList }

    const { error } = await supabase
      .from('profile')
      .update(updatedProfile)
      .eq('email', form.email)

    if (error) {
      console.error('Update failed:', error)
      alert('Failed to update profile.')
    } else {
      alert('Profile updated successfully!')
      router.push('/') // go to dashboard instead of profile
    }
  }

  if (!user) return <p>Loading...</p>

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
