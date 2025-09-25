import { useState } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const interestOptions = [
  "Gardening",
  "Literature",
  "Arts & Crafts",
  "Music",
  "Fitness",
];

export default function InterestsQuestionnaire() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [interests, setInterests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("User not signed in");

    const payload = {
      interestsData: {
        id: user.id,
        gardening: interests.includes("Gardening"),
        literature: interests.includes("Literature"),
        visual_arts: interests.includes("Arts & Crafts"),
        music: interests.includes("Music"),
        fitness: interests.includes("Fitness"),
      },
    };

    try {
      setIsSubmitting(true);
      const result = await supabase.functions.invoke('register_user_interests', {
        body: payload,
      });

      if (result.error) {
        console.error('register_user_interests error:', result.error);
        alert('Could not save interests.');
        return;
      }

      alert('🎉 Interests saved!');
    } catch (err) {
      console.error('Invocation failed:', err);
      alert('Unexpected error—check console');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '2rem auto',
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '2.5rem',
      }}
    >
      <form onSubmit={handleSubmit}>
        <h1
          style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            textAlign: 'center',
            color: '#8d171b',
          }}
        >
          Interests Questionnaire
        </h1>

        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#444', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Select any interests that apply to you. We’ll try to match you with seniors who share similar interests.
          If none apply, that’s okay — just leave everything unchecked and press <strong>Submit</strong>.
        </p>


        {interestOptions.map((interest, i) => (
          <div
            key={i}
            style={{
              marginBottom: '1.2rem',
              padding: '1.2rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd',
              color: 'black'
            }}
          >
            <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
              />
              {interest}
            </label>
          </div>
        ))}

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: '#8d171b',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
          >
            {isSubmitting ? 'Saving…' : 'Submit Interests'}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => window.location.href = "/profile"}
            style={{
              backgroundColor: "#ccc",
              color: "#333",
              padding: "0.65rem 1.8rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ← Back to Profile
          </button>
        </div>
      </form>
    </div>
  );
}