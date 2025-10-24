import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoadingOverlay from '../../components/LoadingOverlay'

export default function Timesheet() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [profile, setProfile] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [totalHours, setTotalHours] = useState(null);
    const [descriptions, setDescriptions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user's profile
    useEffect(() => {
        if (!user) return;
        (async () => {
            const { data, error } = await supabase
                .from("personal_profiles_view")
                .select("user_role")
                .eq("email", user.email)
                .single();
            if (error) console.error("Error fetching profile:", error);
            else setProfile(data);
        })();
    }, [user, supabase]);

    // Fetch reservations & total hours for volunteers
    useEffect(() => {
        if (!user || profile === null) return;

        if (profile.user_role !== "volunteer") {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch reservations
                const { data: resData, error: resErr } = await supabase.functions.invoke(
                    "view_reservations",
                    { body: { status: "pending" } }
                );
                if (resErr) throw resErr;
                if (!resData?.reservations) throw new Error("No reservations array in response");

                // Only keep past or today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const filtered = resData.reservations.filter((r) => {
                    const d = new Date(r.date);
                    d.setHours(0, 0, 0, 0);
                    return d <= today;
                });

                setReservations(filtered);

                // Fetch total hours
                const { data: { session } } = await supabase.auth.getSession();
                const accessToken = session?.access_token;
                const hoursRes = await fetch(
                    `${supabase.supabaseUrl}/functions/v1/get_total_hours`,
                    { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } }
                );
                if (!hoursRes.ok) {
                    const errJson = await hoursRes.json();
                    throw new Error(errJson.error || "Failed to fetch total hours");
                }
                const { total_hours } = await hoursRes.json();
                setTotalHours(total_hours ?? 0);
            } catch (err) {
                console.error("Error loading timesheet data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, profile, supabase]);

    // Access guards
    if (!user || profile === null || loading) return <LoadingOverlay message="Loading your profile data" />;
    if (profile.user_role !== "volunteer") {
        return (
            <div style={{ textAlign: "center", margin: "3rem auto", maxWidth: "400px" }}>
                <p style={{ color: "crimson", fontSize: "1.2rem", fontWeight: "bold" }}>🚫 Access Denied</p>
                <p>This page is only available to volunteers.</p>
            </div>
        );
    }
    if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;

    // Handlers
    const handleChange = (id, value) => setDescriptions(prev => ({ ...prev, [id]: value }));
    const handleSubmit = async (id) => {
        try {
            const { error } = await supabase.functions.invoke("update_reservations", {
                body: { action: "complete", reservation_id: id, description: descriptions[id] || "" },
            });
            if (error) throw error;
            alert("Session marked as complete!");
        } catch (err) {
            console.error("Submit error:", err);
            alert("Error submitting timesheet.");
        }
    };
    const handleCancel = async (id) => {
        try {
            const { error } = await supabase.functions.invoke("update_reservations", {
                body: { action: "cancel", reservation_id: id },
            });
            if (error) throw error;
            alert("Session canceled.");
        } catch (err) {
            console.error("Cancel error:", err);
            alert("Error canceling session.");
        }
    };

    // Render
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
                        <p><strong>Date:</strong> {new Date(r.date).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</p>
                        <textarea
                            placeholder="What did you do during this session?"
                            value={descriptions[r.id] || ""}
                            onChange={e => handleChange(r.id, e.target.value)}
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
                            <button onClick={() => handleCancel(r.id)} style={{ backgroundColor: "gray" }}>Cancel</button>
                        </div>
                    </div>
                ))
            )}

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button
                    type="button"
                    onClick={() => window.location.href = "/"}
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
