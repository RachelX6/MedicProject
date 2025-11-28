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
          maxWidth: '700px',
          margin: '4rem auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          textAlign: 'center',
        }}
      >
        <div className="loader" style={{ margin: '0 auto 1.5rem auto' }} />
        <p style={{ fontSize: '1.1rem', color: '#171717', marginBottom: '0.5rem' }}>
          Finding conversation ideas that match your interests…
        </p>
        <p style={{ fontSize: '0.95rem', color: '#666' }}>
          This may take a moment...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '2rem auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h1 style={{ color: '#8d171b', marginBottom: '1.5rem', fontSize: '2rem' }}>
        Conversation Activity Ideas
      </h1>

      {ideas.length === 0 ? (
        <p>No conversation ideas returned yet.</p>
      ) : (
        ideas.map((idea, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: '#f8f9fa',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h2
              style={{
                marginBottom: '1rem',
                fontSize: '1.3rem',
                color: '#171717',
                fontWeight: '600',
              }}
            >
              {idea.title}
            </h2>
            <p style={{ color: '#171717', marginBottom: '0.5rem' }}><strong>Description:</strong></p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '0', color: '#171717' }}>
              {idea.description
                .split(/\d+\.\s/)
                .filter((part) => part.trim() !== '')
                .map((step, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
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
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#005fa3';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0077cc';
            e.currentTarget.style.transform = 'translateY(0)';
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
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#6f1317';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#8d171b';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Profile
        </button>
      </div>
    </div>


  )
}
