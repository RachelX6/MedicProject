import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import LoadingOverlay from '../components/LoadingOverlay'

export default function Register() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    senior_home: '',
  })

  const [seniorHomes, setSeniorHomes] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch list of senior homes for dropdown
  useEffect(() => {
    const fetchSeniorHomes = async () => {
      const { data, error } = await supabase.from('senior_homes').select('*')
      if (error) console.error('Error loading senior homes:', error)
      else setSeniorHomes(data)
    }
    fetchSeniorHomes()
  }, [supabase])

  // Pre-fill email or name from Supabase user metadata
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        full_name: user.user_metadata.full_name || '',
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const complete = async (e) => {
    e.preventDefault()

    if (!form.full_name || !form.phone_number || !form.senior_home) {
      alert('Please fill out all required fields.')
      return
    }

    try {
      setLoading(true)

      // 1️⃣ Create or update volunteer_profiles
      const { error: profileError } = await supabase
        .from('volunteer_profiles')
        .upsert({
          user_id: user.id,
          full_name: form.full_name,
          senior_home: form.senior_home,
        })

      if (profileError) throw profileError

      // 2️⃣ Create or update private_volunteer_profiles
      const { error: privateError } = await supabase
        .from('private_volunteer_profiles')
        .upsert({
          user_id: user.id,
          phone_number: form.phone_number,
          status: 'active', // default status
        })

      if (privateError) throw privateError

      router.push('/profile')
    } catch (err) {
      console.error('Error completing registration:', err)
      alert('Could not complete registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <LoadingOverlay message="Loading user..." />
  if (loading) return <LoadingOverlay message="Saving your profile..." />

  return (
    <div className="form-container">
      <h1>Complete Your Volunteer Profile</h1>
      <form onSubmit={complete}>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="full_name">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            pattern="[0-9]*"
            maxLength={15}
            value={form.phone_number}
            onChange={handleChange}
            required
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
            required
          >
            <option value="">Select a senior home</option>
            {seniorHomes.map(home => (
              <option key={home.id} value={home.name}>
                {home.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-btn">Save Profile</button>
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
          color: #000;
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
        }
        .submit-btn:hover {
          background-color: #6f1317;
        }
      `}</style>
    </div>
  )
}
