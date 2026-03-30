import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { invokeFunction } from '../lib/supabaseFunctions'
import LoadingOverlay from '../components/LoadingOverlay';
import useProfile from '../hooks/useProfile';
import { useRouter } from 'next/router';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Timesheet() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const { profile } = useProfile();
    const router = useRouter();

    const [reservations, setReservations] = useState([]);
    const [totalHours, setTotalHours] = useState(null);
    const [descriptions, setDescriptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Manual entry state
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualDuration, setManualDuration] = useState("60");
    const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
    const [manualTime, setManualTime] = useState("10:00");
    const [manualSenior, setManualSenior] = useState("");
    const [manualComment, setManualComment] = useState("");
    const [seniors, setSeniors] = useState([]);
    const [submittingManual, setSubmittingManual] = useState(false);

    const durationOptions = [
        { value: "0", label: "0 min" },
        { value: "30", label: "30 min" },
        { value: "60", label: "1 hr" },
        { value: "90", label: "1.5 hrs" },
        { value: "120", label: "2 hrs" },
        { value: "150", label: "2.5 hrs" },
        { value: "180", label: "3 hrs" },
    ];

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
    }, [user, supabase, refreshTrigger]);

    // Load seniors for manual entry dropdown
    useEffect(() => {
        if (!user || !profile?.senior_home) return;

        const loadSeniors = async () => {
            const { data, error } = await supabase
                .from("senior_profiles")
                .select("senior_id, public_senior_id")
                .eq("senior_home", profile.senior_home);

            if (!error && data) setSeniors(data);
        };

        loadSeniors();
    }, [user, profile, supabase]);

    if (!user || loading)
        return <LoadingOverlay message="Loading your timesheet data..." />;

    // Handlers
    const handleDescriptionChange = (id, value) => {
        setDescriptions(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (id) => {
        try {
            setSubmitError(null);
            const { data } = await invokeFunction(supabase, 'update_reservations', { body: { action: 'complete', reservation_id: id, description: descriptions[id] || '' } })
            const error = data?.error

            if (error) throw error;
            alert("Session marked as complete!");
            setRefreshTrigger(v => v + 1);
        } catch (err) {
            console.error("Submit error:", err);
            setSubmitError("Error submitting timesheet: " + (err.message || String(err)));
        }
    };

    const handleCancel = async (id) => {
        try {
            setSubmitError(null);
            const { data } = await invokeFunction(supabase, 'update_reservations', { body: { action: 'cancel', reservation_id: id } })
            const error = data?.error
            if (error) throw error
            alert('Session canceled.')
            setRefreshTrigger(v => v + 1);
        } catch (err) {
            console.error('Cancel error:', err)
            setSubmitError('Error canceling session: ' + (err.message || String(err)));
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setSubmittingManual(true);

        try {
            const dateTime = new Date(`${manualDate}T${manualTime}:00`).toISOString();

            const { data } = await invokeFunction(supabase, 'add_manual_timesheet', {
                requireAuth: true,
                body: {
                    senior_id: manualSenior || null,
                    date: dateTime,
                    duration: parseInt(manualDuration),
                    comment: manualComment || null,
                }
            });

            if (data?.error) throw new Error(data.error);

            alert("Timesheet entry added successfully!");
            setManualComment("");
            setManualSenior("");
            setShowManualForm(false);
            setSubmitError(null);

            // Fetch rather than reload
            setRefreshTrigger(v => v + 1);
        } catch (err) {
            console.error("Manual submit error:", err);
            setSubmitError("Error adding timesheet entry: " + (err.message || String(err)));
        } finally {
            setSubmittingManual(false);
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

            <ErrorDisplay 
                message={error || submitError} 
                onDismiss={() => {
                    setError(null);
                    setSubmitError(null);
                }} 
            />

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

            {/* Manual Entry Toggle */}
            <div style={{ marginBottom: "2rem" }}>
                <button
                    onClick={() => setShowManualForm(!showManualForm)}
                    style={{
                        backgroundColor: showManualForm ? "#6c757d" : "#8d171b",
                        color: "white",
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "1rem",
                        width: "100%",
                    }}
                >
                    {showManualForm ? "✕ Cancel Manual Entry" : "＋ Add Manual Timesheet Entry"}
                </button>
            </div>

            {/* Manual Entry Form */}
            {showManualForm && (
                <form onSubmit={handleManualSubmit} style={{
                    marginBottom: "2.5rem",
                    padding: "1.5rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "10px",
                    border: "2px solid #8d171b20",
                }}>
                    <h3 style={{
                        color: "#8d171b",
                        marginBottom: "1.25rem",
                        fontSize: "1.2rem",
                    }}>Manual Timesheet Entry</h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        {/* Duration */}
                        <div>
                            <label style={{
                                fontWeight: "bold",
                                color: "#171717",
                                display: "block",
                                marginBottom: "0.3rem",
                                fontSize: "0.9rem",
                            }}>Duration *</label>
                            <select
                                value={manualDuration}
                                onChange={(e) => setManualDuration(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.6rem",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "1rem",
                                    color: "#171717",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                {durationOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Senior */}
                        <div>
                            <label style={{
                                fontWeight: "bold",
                                color: "#171717",
                                display: "block",
                                marginBottom: "0.3rem",
                                fontSize: "0.9rem",
                            }}>Senior (optional)</label>
                            <select
                                value={manualSenior}
                                onChange={(e) => setManualSenior(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "1rem",
                                    color: "#171717",
                                    backgroundColor: "#ffffff",
                                }}
                            >
                                <option value="">No specific senior</option>
                                {seniors.map(s => (
                                    <option key={s.senior_id} value={s.senior_id}>{s.public_senior_id}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label style={{
                                fontWeight: "bold",
                                color: "#171717",
                                display: "block",
                                marginBottom: "0.3rem",
                                fontSize: "0.9rem",
                            }}>Date *</label>
                            <input
                                type="date"
                                value={manualDate}
                                onChange={(e) => setManualDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.6rem",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "1rem",
                                    color: "#171717",
                                    backgroundColor: "#ffffff",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label style={{
                                fontWeight: "bold",
                                color: "#171717",
                                display: "block",
                                marginBottom: "0.3rem",
                                fontSize: "0.9rem",
                            }}>Time *</label>
                            <input
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "0.6rem",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "1rem",
                                    color: "#171717",
                                    backgroundColor: "#ffffff",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{
                            fontWeight: "bold",
                            color: "#171717",
                            display: "block",
                            marginBottom: "0.3rem",
                            fontSize: "0.9rem",
                        }}>Comment (optional)</label>
                        <textarea
                            placeholder="Describe your session..."
                            value={manualComment}
                            onChange={(e) => setManualComment(e.target.value)}
                            style={{
                                width: "100%",
                                minHeight: "80px",
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "1rem",
                                fontFamily: "inherit",
                                resize: "vertical",
                                color: "#171717",
                                backgroundColor: "#ffffff",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submittingManual}
                        style={{
                            width: "100%",
                            backgroundColor: "#27ae60",
                            color: "white",
                            padding: "0.75rem",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: submittingManual ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            opacity: submittingManual ? 0.6 : 1,
                        }}
                    >
                        {submittingManual ? "Submitting..." : "✓ Submit Timesheet Entry"}
                    </button>
                </form>
            )}

            {/* Existing Reservations */}
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
                    onClick={() => router.push("/profile")}
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
