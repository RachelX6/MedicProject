import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import LoadingOverlay from '../components/LoadingOverlay'
import { invokeFunction } from '../lib/supabaseFunctions'


export default function Register() {
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
    senior_home: '',
    email: ''
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        preferred_name: user.user_metadata?.full_name || user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const complete = async (e) => {
    e.preventDefault()

    // Validate required fields
    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        alert(`Please fill out ${key.replace('_', ' ')}`)
        return
      }
    }

    try {
      setLoading(true)

      // ✅ Call your Edge Function instead of direct insert
      // Call helper which uses client SDK when appropriate
      try {
        const { data } = await invokeFunction(supabase, 'register_new_user', {
          body: {
            profileData: {
              preferred_name: form.preferred_name,
              first_name: form.first_name,
              last_name: form.last_name,
              phone_number: form.phone_number,
              email: form.email,
              gender: form.gender,
              date_of_birth: form.birthday,
              // Backend receives key values (casa_mia, pinegrove, point_grey)
              senior_home: form.senior_home,
            },
          },
        })

        if (data?.error) {
          console.error('Edge Function returned error:', data)
          alert(data.error || 'Error saving profile.')
          return
        }
      } catch (err) {
        console.error('Edge Function error:', err)
        alert('Error saving profile: ' + (err.message || String(err)))
        return
      }

      alert('Profile registered successfully!')
      router.push('/profile')
    } catch (err) {
      console.error('Unexpected error:', err)
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
              if (!/[0-9]/.test(e.key)) e.preventDefault()
            }}
          />
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
            <option value="casa_mia">Casa Mia — 1920 SW Marine Dr, Vancouver, BC</option>
            <option value="pinegrove">Pinegrove Place — 11331 Mellis Dr, Richmond, BC</option>
            <option value="point_grey">Point Grey Private Hospital — 2423 Cornwall Ave, Vancouver, BC</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Complete Registration</button>
      </form>

      {/* ✅ Your original styling */}
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
          color: #000;
          background: #fff;
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
