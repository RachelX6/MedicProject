import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import LoadingOverlay from '../components/LoadingOverlay' // adjust path if needed

export default function Register() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const [form, setForm] = useState({
    first_name: '',
    preferred_name: '',
    last_name: '',
    phone_number: '',
    user_role: 'volunteer',
    gender: '',
    birthday: '',
    primary_language: '',
    secondary_language: '',
    senior_home: '',
    email: ''
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        first_name: user.user_metadata.first_name || '',
        last_name: user.user_metadata.last_name || '',
        preferred_name: user.user_metadata.full_name || user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const complete = async (e) => {
    e.preventDefault()

    for (const [key, value] of Object.entries(form)) {
      if (!value && key !== 'secondary_language') {
        alert(`Please fill out ${key.replace('_', ' ')}`)
        return
      }
    }

    const secondaryList = form.secondary_language
      ? form.secondary_language.split(',').map(s => s.trim())
      : []

    if (secondaryList.includes(form.primary_language)) {
      alert('Primary language cannot also be selected as a secondary language.')
      return
    }

    const payload = {
      profileData: {
        first_name: form.first_name,
        preferred_name: form.preferred_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        user_role: form.user_role,
        gender: form.gender,
        birthday: form.birthday,
        primary_language: form.primary_language,
        secondary_language: secondaryList,
        senior_home: form.senior_home.split(' - ')[0],
        email: form.email
      }
    }

    try {
      setLoading(true)
      const result = await supabase.functions.invoke('register_user', { body: payload })
      if (result.error) {
        console.error('register_user returned error:', result.error)
        alert('Could not complete registration.')
        return
      }
      router.push('/profile')
    } catch (err) {
      console.error('Invocation threw:', err)
      alert('Unexpected error—check console')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <LoadingOverlay message="Loading user..." />
  if (loading) return <LoadingOverlay message="Completing registration..." />

  return (
    <div className="form-container">
      <h1>One more step…</h1>
      <form onSubmit={complete}>
        {/* First Name */}
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        {/* Preferred Name */}
        <div className="form-group">
          <label htmlFor="preferred_name">Preferred Name</label>
          <input
            id="preferred_name"
            name="preferred_name"
            value={form.preferred_name}
            onChange={handleChange}
          />
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
            value={form.phone_number}
            onChange={handleChange}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault()
              }
            }}
          />
        </div>

        {/* User Role */}
        <div className="form-group">
          <label htmlFor="user_role">User Role</label>
          <select
            id="user_role"
            name="user_role"
            value={form.user_role}
            onChange={handleChange}
          >
            <option value="volunteer">Volunteer</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Birthday */}
        <div className="form-group">
          <label htmlFor="birthday">Birthday</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
          />
        </div>

        {/* Primary Language */}
        <div className="form-group">
          <label htmlFor="primary_language">Primary Language</label>
          <select
            id="primary_language"
            name="primary_language"
            value={form.primary_language}
            onChange={handleChange}
            required
          >
            <option value="">Select a primary language</option>
            {['English', 'Mandarin', 'Cantonese', 'Punjabi', 'Tagalog', 'Korean', 'Vietnamese', 'Hindi', 'Japanese', 'Spanish', 'Farsi', 'French'].map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Secondary Languages */}
        <div className="form-group">
          <label htmlFor="secondary_language">Secondary Languages (Ctrl/Cmd + Click)</label>
          <select
            multiple
            style={{ height: '150px' }}
            id="secondary_language"
            name="secondary_language"
            value={form.secondary_language.split(',')}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value)
              setForm(prev => ({ ...prev, secondary_language: selected.join(',') }))
            }}
          >
            {[
              'English',
              'Mandarin',
              'Cantonese',
              'Punjabi',
              'Tagalog',
              'Korean',
              'Vietnamese',
              'Hindi',
              'Japanese',
              'Spanish',
              'Farsi',
              'French',
              'Arabic',
              'Russian',
              'Portuguese',
              'German'
            ].map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Senior Home */}
        <div className="form-group">
          <label htmlFor="senior_home">Senior Home</label>
          <select
            id="senior_home"
            name="senior_home"
            value={form.senior_home}
            onChange={handleChange}
          >
            <option value="">Select a senior home</option>
            {[
              'Arbutus Care Center - 4505 Valley Dr, Vancouver, BC',
              'Casa Mia - 1920 SW Marine Dr, Vancouver, BC',
              'Opal by Element - 438 W King Edward Ave, Vancouver, BC',
              'Pinegrove Place - 11331 Mellis Dr, Richmond, BC',
              'Point Grey Private Hospital - 2423 Cornwall Ave, Vancouver, BC',
              'South Granville Lodge - 1550 W 62nd Ave, Vancouver, BC',
              'Tapestry - 3338 Wesbrook Mall, Vancouver, BC',
              'Terrace on 7th - 1570 W 7th Ave, Vancouver, BC'
            ].map(home => (
              <option key={home} value={home}>{home}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-btn">Complete Registration</button>
      </form>

      <style jsx>{`
        .form-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
          text-align: center;
          color: #8d171b;
          margin-bottom: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        label {
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #000000ff;
        }
        input,
        select {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit-btn {
          margin-top: 1rem;
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #8d171b;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .submit-btn:hover {
          background-color: #6f1317;
        }
      `}</style>
    </div>
  )
}
