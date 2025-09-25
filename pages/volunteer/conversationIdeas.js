import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ConversationIdeas() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [matched, setMatched] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Helper: fetch new ideas from Gemini
  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${supabase.supabaseUrl}/functions/v1/find_common_activities`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Edge function error:', await res.json());
        return;
      }

      const json = await res.json();
      setIdeas(json || []);

      // Save to cache
      localStorage.setItem("conversationIdeas", JSON.stringify(json));
    } catch (err) {
      console.error('Error fetching ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  // 1️⃣ Check if user is matched
  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    supabase
      .from('profile')
      .select('matched_with_id')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading profile:', error);
        } else {
          setMatched(data?.matched_with_id !== null);
        }
      })
      .finally(() => setLoadingProfile(false));
  }, [user, supabase]);

  // 2️⃣ If matched, load ideas (check cache first)
  useEffect(() => {
    if (!matched) return;

    const cached = localStorage.getItem("conversationIdeas");
    if (cached) {
      setIdeas(JSON.parse(cached));
      return;
    }

    fetchIdeas(); // fetch new if no cache
  }, [matched]);

  // 3️⃣ Access guard
  if (!user || loadingProfile) {
    return <p>Loading…</p>;
  }

  if (!matched) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ color: 'crimson', fontSize: '1.2rem', fontWeight: 'bold' }}>
          🚫 Access Denied
        </p>
        <p>This page is only available to matched volunteers.</p>
        <button
          onClick={() => router.push('/profile')}
          style={{
            marginTop: '1rem',
            backgroundColor: '#8d171b',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ← Back to Profile
        </button>
      </div>
    );
  }

  // 4️⃣ Volunteer view
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
          Finding conversation ideas that match your interests and personality…
        </p>
        <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.5rem' }}>
          This may take a few seconds — thank you for your patience!
        </p>
      </div>
    );
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
        <p>No conversation ideas returned.</p>
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
        {/* Refresh button to get new ideas */}
        <button
          onClick={() => {
            localStorage.removeItem("conversationIdeas"); // clear cache
            fetchIdeas(); // fetch fresh without reload
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
  );
}
