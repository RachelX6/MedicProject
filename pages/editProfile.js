import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import useProfile from '../hooks/useProfile'
import seniorHomesData from '../data/seniorHomes.json'
import { invokeFunction } from '../lib/supabaseFunctions'
import ErrorDisplay from '../components/ErrorDisplay'

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
    senior_home: '',
    email: ''
  })

  const [validationError, setValidationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        preferred_name: profile.preferred_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        senior_home: profile.senior_home || '',
        email: profile.email || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setValidationError('')
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setValidationError('')
    setIsSubmitting(true)

    // ─── MANDATORY CHECK ──────────────────────────────────────────────
    // Check if any field is empty or just whitespace
    const isAnyFieldEmpty = Object.values(form).some(value => !value || value.trim() === '')

    if (isAnyFieldEmpty) {
      setValidationError('Please fill in all fields.')
      setIsSubmitting(false)
      return
    }

    // ─── "ILLEGAL" DATA CHECK ─────────────────────────────────────────
    const phoneRegex = /^[0-9\- ]+$/
    if (!phoneRegex.test(form.phone_number)) {
      setValidationError('Illegal characters in phone number. Please use only numbers.')
      setIsSubmitting(false)
      return
    }

    if (!form.email.includes('@')) {
      setValidationError('Please enter a valid email address.')
      setIsSubmitting(false)
      return
    }

    try {
      const payload = {}
      Object.keys(form).forEach(key => {
        payload[key] = form[key].trim()
      })

      const { data, error } = await invokeFunction(supabase, 'update_user_profile', {
        body: { profileData: payload },
        requireAuth: true
      })

      if (error) throw error

      alert('Profile updated successfully!')
      router.push('/profile')
    } catch (error) {
      console.error('Update failed:', error)
      setValidationError('Failed to update: ' + (error.message || String(error)))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>

  // Helper to render label with red star
  const RequiredLabel = ({ text, htmlFor }) => (
    <label htmlFor={htmlFor} style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem' }}>
      {text} <span style={{ color: '#8d171b' }}>*</span>
    </label>
  )

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
      <div style={{ padding: '2rem 2.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#8d171b', fontSize: '1.8rem' }}>Edit Profile</h1>
        <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '0.95rem' }}>
          Update your personal details and assignments below.
        </p>

        <ErrorDisplay 
          message={validationError} 
          onDismiss={() => setValidationError('')} 
        />

        <form onSubmit={handleSubmit}>
        {['first_name', 'preferred_name', 'last_name', 'email', 'phone_number'].map((name) => (
          <div key={name} style={{ marginBottom: '1.5rem', color: 'black' }}>
            <RequiredLabel
              htmlFor={name}
              text={name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            />
            <input
              type={name === 'email' ? 'email' : 'text'}
              id={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '6px',
                border: validationError && (!form[name] || form[name].trim() === '') ? '2px solid #f87171' : '1px solid #ccc',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: '2rem', color: 'black' }}>
          <RequiredLabel htmlFor="senior_home" text="Senior Home" />
          <select
            id="senior_home"
            name="senior_home"
            value={form.senior_home}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: validationError && !form.senior_home ? '2px solid #f87171' : '1px solid #ccc',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Select a senior home</option>
            {Object.values(seniorHomesData).map((home) => (
              <option key={home.slug} value={home.slug}>
                {home.name} — {home.address}
              </option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#a3a3a3' : '#8d171b',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginRight: '1rem',
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/profile')}
            style={{
              backgroundColor: '#ccc',
              color: '#333',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}