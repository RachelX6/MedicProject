'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import LoadingOverlay from "../components/LoadingOverlay";

export default function SeniorComments() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [loading, setLoading] = useState(true);
    const [seniors, setSeniors] = useState([]);
    const [selectedSenior, setSelectedSenior] = useState(null);
    const [comments, setComments] = useState([]);

    // Load seniors
    useEffect(() => {
        if (!user) return;

        const loadSeniors = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("senior_profiles")
                .select("senior_id, public_senior_id");

            if (!error) setSeniors(data);

            setLoading(false);
        };

        loadSeniors();
    }, [user, supabase]);

    // Load comments for selected senior FROM RESERVATIONS
    useEffect(() => {
        if (!selectedSenior) return;

        const loadComments = async () => {
            const { data, error } = await supabase
                .from("reservations")
                .select("comment, created_at, volunteer_id")
                .eq("senior_id", selectedSenior)
                .not("comment", "is", null)   // ONLY rows with comments
                .order("created_at", { ascending: false });

            if (!error) setComments(data);
        };

        loadComments();
    }, [selectedSenior, supabase]);

    if (!user || loading) {
        return <LoadingOverlay message="Loading senior comments..." />;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
            <h1 style={{ color: "#8d171b", marginBottom: "1rem" }}>
                Senior Feedback
            </h1>

            <label style={{ fontWeight: "bold" }}>Select a senior:</label>

            <select
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    marginBottom: "1.5rem",
                }}
                onChange={(e) => setSelectedSenior(e.target.value)}
            >
                <option value="">Choose a senior…</option>

                {seniors.map((s) => (
                    <option key={s.senior_id} value={s.senior_id}>
                        {s.public_senior_id}
                    </option>
                ))}
            </select>

            {selectedSenior && (
                <div>
                    <h2 style={{ color: "#8d171b", marginBottom: "1rem" }}>
                        Comments for{" "}
                        {seniors.find((s) => s.senior_id === selectedSenior)?.public_senior_id}
                    </h2>

                    {comments.length === 0 ? (
                        <p>No comments yet for this senior.</p>
                    ) : (
                        comments.map((c, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: "#fff",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                    marginBottom: "1rem",
                                }}
                            >
                                <p>{c.comment}</p>
                                <small style={{ color: "#555" }}>
                                    {new Date(c.created_at).toLocaleDateString("en-CA")}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            )}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
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
                    ← Back to Profile
                </button>
            </div>

        </div>
    );
    
}
