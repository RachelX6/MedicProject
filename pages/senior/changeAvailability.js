import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingOverlay from '../../components/LoadingOverlay'

export default function SeniorAvailability() {
    const user = useUser();
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);       // for cancel button
    const [message, setMessage] = useState('');
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [idToName, setIdToName] = useState({});        // volunteer IDs to preferred names
    const [reservationLoading, setReservationLoading] = useState(true); // ✅ new

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

    useEffect(() => {
        if (!profile) return;

        const initData = async () => {
            try {
                // 1) Send permanent reservation
                await supabase.functions.invoke('add_reservation', { body: { type: 'permanent' } });

                // 2) Fetch sessions after reservation is processed
                const { data, error } = await supabase.functions.invoke('view_reservations', {
                    body: { status: 'pending' },
                });

                const reservations = data?.reservations;
                if (error || !Array.isArray(reservations)) {
                    throw new Error('Invalid response from view_reservations');
                }

                const mySessions = reservations.filter((s) => s.senior_id === profile.id);
                setUpcomingSessions(mySessions);

                // 3) Fetch volunteer names
                const volunteerIds = mySessions.map((s) => s.volunteer_id).filter(Boolean);
                const uniqueIds = Array.from(new Set(volunteerIds));

                if (uniqueIds.length > 0) {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profile')
                        .select('id, preferred_name')
                        .in('id', uniqueIds);

                    if (profilesError) {
                        console.error('Error fetching volunteer names:', profilesError);
                    } else {
                        const map = {};
                        profilesData.forEach((p) => {
                            map[p.id] = p.preferred_name;
                        });
                        setIdToName(map);
                    }
                }
            } catch (err) {
                console.error('Error fetching sessions:', err);
            } finally {
                setReservationLoading(false); // ✅ mark as done
            }
        };

        initData();
    }, [profile, supabase]);

    const handleCancel = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) return;
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.functions.invoke('update_reservations', {
                body: {
                    action: 'cancel',
                    reservation_id: reservationId,
                },
            });
            if (error) throw error;
            setMessage('Your session has been cancelled.');
            setUpcomingSessions((prev) => prev.filter((s) => s.id !== reservationId));
        } catch (err) {
            console.error('Error cancelling session:', err);
            setMessage('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!user || !profile || reservationLoading) {
    return <LoadingOverlay message="Loading your sessions..." />
}

    if (profile.user_role !== 'senior') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>This page is only available to seniors.</p>
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
    const fieldStyle = { margin: '0.5rem 0' };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px' }}>
            <h1 style={{ color: '#8d171b', marginBottom: '1.5rem' }}>Manage Your Sessions</h1>

            {message && <p style={{ color: '#c00', marginBottom: '1rem' }}>{message}</p>}

            {upcomingSessions.length === 0 ? (
                <p style={{ color: 'black' }}>You have no upcoming sessions.</p>
            ) : (
                upcomingSessions.map((session) => (
                    <div key={session.id} style={cardStyle}>
                        <p style={fieldStyle}><strong>Date:</strong> {new Date(session.date).toLocaleString()}</p>
                        <p style={fieldStyle}><strong>Volunteer:</strong> {idToName[session.volunteer_id] || session.volunteer_id}</p>
                        <button
                            onClick={() => handleCancel(session.id)}
                            disabled={loading}
                            style={{ backgroundColor: '#8d171b', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}
                        >
                            Cancel Session
                        </button>
                    </div>
                ))
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    onClick={() => router.push('/profile')}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#8d171b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    ← Back to Profile
                </button>
            </div>
        </div>
    );
}
