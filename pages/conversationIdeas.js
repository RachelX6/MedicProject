// pages/volunteer/ConversationIdeas.jsx
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ConversationIdeas() {
  const user = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [ideas, setIdeas] = useState([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  // ✅ Fetch ideas from Gemini Edge Function
  const fetchIdeas = async () => {
    setLoadingIdeas(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`${supabase.supabaseUrl}/functions/v1/find_common_activities`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error('Edge function error:', await res.json())
        return
      }

      const json = await res.json()
      setIdeas(json || [])
      localStorage.setItem("conversationIdeas", JSON.stringify(json))
    } catch (err) {
      console.error('Error fetching ideas:', err)
    } finally {
      setLoadingIdeas(false)
    }
  }

  // ✅ Load cached or fresh ideas
  useEffect(() => {
    const cached = localStorage.getItem("conversationIdeas")
    if (cached) {
      setIdeas(JSON.parse(cached))
      return
    }
    fetchIdeas()
  }, [])

  if (!user) {
    return <p>Loading your account...</p>
  }

  if (loadingIdeas) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '4rem auto',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <div className="loader" style={{ margin: '0 auto 1rem auto' }} />
        <p style={{ fontSize: '1.1rem', color: '#333' }}>
          Finding conversation ideas that match your interests…
        </p>
        <p style={{ fondSize: '0.95rem', color: '#666', marginTop: '0.5rem'}}>
          This may take a moment...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '2rem auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1 style={{ color: '#8d171b', marginBottom: '1.5rem' }}>
        Conversation Activity Ideas
      </h1>

      {ideas.length === 0 ? (
        <p>No conversation ideas returned yet.</p>
      ) : (
        ideas.map((idea, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h2
              style={{
                marginBottom: '0.5rem',
                fontSize: '1.2rem',
                color: '#333',
              }}
            >
              {idea.title}
            </h2>
            <p><strong>Description:</strong></p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
              {idea.description
                .split(/\d+\.\s/)
                .filter((part) => part.trim() !== '')
                .map((step, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    {step.trim()}
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => {
            localStorage.removeItem("conversationIdeas")
            fetchIdeas()
          }}
          style={{
            marginRight: '1rem',
            backgroundColor: '#0077cc',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🔄 Get New Ideas
        </button>

        <button
          onClick={() => router.push('/profile')}
          style={{
            backgroundColor: '#8d171b',
            color: 'white',
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ← Back to Profile
        </button>
      </div>
    </div>

   
  )
}
