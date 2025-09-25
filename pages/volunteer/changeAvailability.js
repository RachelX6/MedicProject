import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ChangeAvailability() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableSessions, setAvailableSessions] = useState([]);
  const [pendingSessions, setPendingSessions] = useState([]);

  // --- Helpers: 48-hour cancellation rule ---
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  const isCancelable = (dateStr) => {
    const start = new Date(dateStr).getTime();
    return (start - Date.now()) >= TWO_DAYS_MS;
  };

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('personal_profiles_view')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      setProfile(data);
    };

    fetchProfile();
  }, [user, supabase]);

  // Fetch reservations
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [cancelledResponse, pendingResponse] = await Promise.all([
          supabase.functions.invoke('view_reservations', { body: { status: 'cancelled-open', private: false } }),
          supabase.functions.invoke('view_reservations', { body: { status: 'pending', private: false } }),
        ]);

        const cancelled = cancelledResponse.data?.reservations || [];
        const pending = pendingResponse.data?.reservations || [];

        const now = new Date();

        // Filter to future sessions
        const futureCancelled = cancelled.filter(sess => new Date(sess.date) > now);
        const futurePending = pending
          .filter(sess => new Date(sess.date) > now)
          .filter(sess => sess.volunteer_id === user.id);

        setAvailableSessions(futureCancelled);
        setPendingSessions(futurePending);
      } catch (err) {
        console.error('Error fetching reservations:', err);
      }
    };

    if (user) fetchSessions();
  }, [supabase, user]);

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.functions.invoke('update_reservations', {
        body: { action: 'cancel', reservation_id: reservationId },
      });
      if (error) throw error;
      setMessage('Your availability has been updated.');
      setPendingSessions((prev) => prev.filter((s) => s.id !== reservationId));
    } catch (err) {
      console.error('Error canceling availability:', err);
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (calendarId) => {
    if (!window.confirm('Do you want to take up this slot?')) return;
    try {
      const { error } = await supabase.functions.invoke('add_reservation', {
        body: { type: 'temporary', reservation_id: calendarId.toString() },
      });
      if (error) throw error;
      alert('Slot successfully booked!');
      setAvailableSessions((prev) => prev.filter((s) => s.id !== calendarId));
    } catch (err) {
      console.error('Booking error:', err);
      alert('Could not book this slot.');
    }
  };

  if (!user || !profile) return <p>Loading...</p>;

  if (profile.user_role !== 'volunteer') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This page is only available to volunteers.</p>
      </div>
    );
  }

  const cardStyle = {
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };
  const fieldStyle = { margin: '0.5rem 0', color: 'black' };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px' }}>
      <h1 style={{ color: '#8d171b', marginBottom: '1.5rem' }}>Change Availability</h1>
      {/* Intro note */}
      <p style={{ color: 'black', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        On this page you can cancel upcoming sessions if you become unavailable.
        Please note that cancellations must be made <strong>at least 48 hours before</strong> the session starts,
        otherwise the senior may not have a volunteer for that session.
      </p>

      {message && <p style={{ color: '#c00', marginBottom: '1rem' }}>{message}</p>}

      <section>
        <h2 style={{ color: '#8d171b', marginBottom: '1rem' }}>Your Upcoming Sessions</h2>
        {pendingSessions.length === 0 ? (
          <p style={{ color: 'black' }}>No upcoming sessions to cancel.</p>
        ) : (
          pendingSessions.map((session) => {
            const canCancel = isCancelable(session.date);
            return (
              <div key={session.id} style={cardStyle}>
                <p style={fieldStyle}><strong>Senior:</strong> {session.senior_preferred_name}</p>
                <p style={fieldStyle}><strong>Senior Home:</strong> {session.senior_home}</p>
                <p style={fieldStyle}><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>

                {canCancel ? (
                  <button
                    onClick={() => handleCancel(session.id)}
                    disabled={loading}
                    style={{ backgroundColor: '#8d171b', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}
                  >
                    Cancel Availability
                  </button>
                ) : (
                  <p style={{ color: '#555', marginTop: '0.5rem' }}>
                    This session starts in under 48 hours and cannot be cancelled online.
                  </p>
                )}
              </div>
            );
          })
        )}
      </section>

      <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

      <section>
        <h2 style={{ color: '#8d171b', marginBottom: '1rem' }}>Available Unclaimed Sessions</h2>
        {availableSessions.length === 0 ? (
          <p style={{ color: 'black' }}>No unclaimed sessions available.</p>
        ) : (
          availableSessions.map((session) => (
            <div key={session.id} style={cardStyle}>
              <p style={fieldStyle}><strong>Senior:</strong> {session.senior_preferred_name}</p>
              <p style={fieldStyle}><strong>Senior Home:</strong> {session.senior_home}</p>
              <p style={fieldStyle}><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
              <button
                onClick={() => handleBook(session.id)}
                style={{ backgroundColor: '#8d171b', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}
              >
                Book This Slot
              </button>
            </div>
          ))
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => router.push('/profile')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#8d171b', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white' }}
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}
