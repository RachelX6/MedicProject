import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { invokeFunction } from '../lib/supabaseFunctions'
import LoadingOverlay from '../components/LoadingOverlay';

export default function Timesheet() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [reservations, setReservations] = useState([]);
    const [totalHours, setTotalHours] = useState(null);
    const [descriptions, setDescriptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load volunteer reservations + hours
    useEffect(() => {
        if (!user) return;

        const load = async () => {
            setLoading(true);
            try {
                // Fetch volunteer's reservations using helper
                const { data: resData } = await invokeFunction(supabase, 'view_reservations', { body: { filters: { status: 'pending' } } })
                if (!resData?.reservations) throw new Error('No reservations returned')

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // past or today only
                const filtered = resData.reservations.filter((r) => {
                    const d = new Date(r.date);
                    d.setHours(0, 0, 0, 0);
                    return d <= today;
                });

                setReservations(filtered);

                // Load total hours - wrapped in try-catch in case function doesn't exist
                try {
                    const { data: { total_minutes } = {} } = await invokeFunction(supabase, 'get_total_hours', { method: 'GET', requireAuth: true })
                    setTotalHours(total_minutes ?? 0); // Store minutes, will convert to hours in display
                } catch (hourErr) {
                    console.warn('get_total_hours function not available:', hourErr);
                    setTotalHours(0); // Default to 0 if function doesn't exist
                }

            } catch (err) {
                console.error("Timesheet error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user, supabase]);

    // Loading screen
    if (!user || loading)
        return <LoadingOverlay message="Loading your timesheet data..." />;

    if (error)
        return <p style={{ color: "crimson" }}>Error: {error}</p>;

    // Handlers
    const handleDescriptionChange = (id, value) => {
        setDescriptions(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (id) => {
        try {
            const { data } = await invokeFunction(supabase, 'update_reservations', { body: { action: 'complete', reservation_id: id, description: descriptions[id] || '' } })
            const error = data?.error

            if (error) throw error;
            alert("Session marked as complete!");
        } catch (err) {
            console.error("Submit error:", err);
            alert("Error submitting timesheet.");
        }
    };

    const handleCancel = async (id) => {
        try {
            const { data } = await invokeFunction(supabase, 'update_reservations', { body: { action: 'cancel', reservation_id: id } })
            const error = data?.error
            if (error) throw error
            alert('Session canceled.')
        } catch (err) {
            console.error('Cancel error:', err)
            alert('Error canceling session.')
        }
    };

    return (
        <div style={{
            maxWidth: "750px",
            margin: "2rem auto",
            padding: "2.5rem",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}>
            <h1 style={{
                color: "#8d171b",
                fontSize: "2rem",
                marginBottom: "1.5rem"
            }}>Timesheet</h1>

            {totalHours !== null && (
                <div style={{
                    marginBottom: "2rem",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "1.1rem",
                    color: '#171717',
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                    <strong>Total Hours Completed:</strong> {(totalHours / 60).toFixed(2)} hrs ({totalHours} minutes)
                </div>
            )}

            {reservations.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center" }}>No past or today's reservations to log.</p>
            ) : (
                reservations.map(r => (
                    <div key={r.id} style={{
                        marginBottom: "2rem",
                        padding: "1.5rem",
                        background: "#ffffff",
                        borderRadius: "10px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        border: "1px solid #e0e0e0",
                    }}>
                        <p style={{
                            marginBottom: "1rem",
                            color: "#171717",
                            fontWeight: "500"
                        }}>
                            <strong>Date:</strong> {new Date(r.date).toLocaleString("en-CA", {
                                dateStyle: "medium",
                                timeStyle: "short"
                            })}
                        </p>

                        <textarea
                            placeholder="Describe your session..."
                            value={descriptions[r.id] || ""}
                            onChange={e => handleDescriptionChange(r.id, e.target.value)}
                            style={{
                                width: "100%",
                                minHeight: "100px",
                                marginBottom: "1rem",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                resize: "vertical",
                                color: "#171717",
                                backgroundColor: "#f8f9fa",
                            }}
                        />

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                onClick={() => handleSubmit(r.id)}
                                style={{
                                    flex: 1,
                                    backgroundColor: "#8d171b",
                                    color: "white",
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#6f1317";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#8d171b";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >Submit</button>
                            <button
                                onClick={() => handleCancel(r.id)}
                                style={{
                                    flex: 1,
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#5a6268";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#6c757d";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ))
            )}

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                    type="button"
                    onClick={() => window.location.href = "/profile"}
                    style={{
                        backgroundColor: "#ffffff",
                        color: "#8d171b",
                        padding: "0.75rem 2rem",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
