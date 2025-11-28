'use client'

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
                const { data: resData } = await invokeFunction(supabase, 'view_reservations', { body: { status: 'pending' } })
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

                // Load total hours
                // Use helper which will attach user's token when available
                const { data: { total_hours } = {} } = await invokeFunction(supabase, 'get_total_hours', { method: 'GET', requireAuth: true })
                setTotalHours(total_hours ?? 0);

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
        <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
            <h1 style={{ color: "#8d171b", fontSize: "2rem", marginBottom: "1rem" }}>Timesheet</h1>

            {totalHours !== null && (
                <div style={{
                    marginBottom: "1.5rem",
                    padding: "0.75rem 1.25rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "1.1rem",
                    color: 'black'
                }}>
                    <strong>Total Hours Completed:</strong> {(totalHours / 60).toFixed(2)} hrs
                </div>
            )}

            {reservations.length === 0 ? (
                <p>No past or today’s reservations to log.</p>
            ) : (
                reservations.map(r => (
                    <div key={r.id} style={{
                        marginBottom: "2rem",
                        padding: "1rem",
                        background: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}>
                        <p><strong>Date:</strong> {new Date(r.date).toLocaleString("en-CA", {
                            dateStyle: "medium",
                            timeStyle: "short"
                        })}</p>

                        <textarea
                            placeholder="Describe your session..."
                            value={descriptions[r.id] || ""}
                            onChange={e => handleDescriptionChange(r.id, e.target.value)}
                            style={{
                                width: "100%",
                                minHeight: "80px",
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                            }}
                        />

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button onClick={() => handleSubmit(r.id)}>Submit</button>
                            <button
                                onClick={() => handleCancel(r.id)}
                                style={{ backgroundColor: "gray" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ))
            )}

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                    type="button"
                    onClick={() => window.location.href = "/profile"}
                    style={{
                        backgroundColor: "#8d171b",
                        color: "#fff",
                        padding: "0.65rem 1.8rem",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
