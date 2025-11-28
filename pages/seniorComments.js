import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import LoadingOverlay from "../components/LoadingOverlay";
import seniorHomesData from '../data/seniorHomes.json';

export default function SeniorComments() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [loading, setLoading] = useState(true);
    const [selectedHome, setSelectedHome] = useState(null);
    const [seniors, setSeniors] = useState([]);
    const [filteredSeniors, setFilteredSeniors] = useState([]);
    const [selectedSenior, setSelectedSenior] = useState(null);
    const [comments, setComments] = useState([]);

    // Load all seniors
    useEffect(() => {
        if (!user) return;

        const loadSeniors = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("senior_profiles")
                .select("senior_id, public_senior_id, senior_home");

            if (!error) setSeniors(data);

            setLoading(false);
        };

        loadSeniors();
    }, [user, supabase]);

    // Filter seniors when home is selected
    useEffect(() => {
        if (!selectedHome) {
            setFilteredSeniors([]);
            setSelectedSenior(null);
            return;
        }

        const filtered = seniors.filter(s => s.senior_home === selectedHome);
        setFilteredSeniors(filtered);
        setSelectedSenior(null); // Reset senior selection when home changes
    }, [selectedHome, seniors]);

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

    // Get senior home names for dropdown
    const seniorHomes = Object.values(seniorHomesData);

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
                marginBottom: "1.5rem",
                fontSize: "2rem"
            }}>
                Senior Feedback
            </h1>

            {/* Step 1: Select Senior Home */}
            <div style={{ marginBottom: "2rem" }}>
                <label style={{
                    fontWeight: "bold",
                    color: "#171717",
                    display: "block",
                    marginBottom: "0.5rem"
                }}>Step 1: Select a senior home:</label>

                <select
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        marginBottom: "0.5rem",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        fontSize: "1rem",
                        color: "#171717",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                    value={selectedHome || ""}
                    onChange={(e) => setSelectedHome(e.target.value)}
                >
                    <option value="">Choose a senior home…</option>
                    {seniorHomes.map((home) => (
                        <option key={home.slug} value={home.slug}>
                            {home.fullName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Step 2: Select Senior (only shows after home is selected) */}
            {selectedHome && (
                <div style={{ marginBottom: "2rem" }}>
                    <label style={{
                        fontWeight: "bold",
                        color: "#171717",
                        display: "block",
                        marginBottom: "0.5rem"
                    }}>Step 2: Select a senior:</label>

                    <select
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            marginBottom: "0.5rem",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            fontSize: "1rem",
                            color: "#171717",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        value={selectedSenior || ""}
                        onChange={(e) => setSelectedSenior(e.target.value)}
                    >
                        <option value="">Choose a senior…</option>
                        {filteredSeniors.map((s) => (
                            <option key={s.senior_id} value={s.senior_id}>
                                {s.public_senior_id}
                            </option>
                        ))}
                    </select>

                    {filteredSeniors.length === 0 && (
                        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                            No seniors found for this home.
                        </p>
                    )}
                </div>
            )}

            {/* Comments Display */}
            {selectedSenior && (
                <div>
                    <h2 style={{
                        color: "#8d171b",
                        marginBottom: "1.5rem",
                        fontSize: "1.5rem"
                    }}>
                        Comments for{" "}
                        {filteredSeniors.find((s) => s.senior_id === selectedSenior)?.public_senior_id}
                    </h2>

                    {comments.length === 0 ? (
                        <p style={{ color: "#666" }}>No comments yet for this senior.</p>
                    ) : (
                        comments.map((c, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: "#f8f9fa",
                                    padding: "1.25rem",
                                    borderRadius: "8px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                    marginBottom: "1rem",
                                    border: "1px solid #e0e0e0",
                                }}
                            >
                                <p style={{
                                    color: "#171717",
                                    margin: "0 0 0.5rem 0",
                                    lineHeight: "1.6"
                                }}>{c.comment}</p>
                                <small style={{ color: "#666" }}>
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
                        padding: "0.75rem 2rem",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#6f1317";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#8d171b";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    ← Back to Profile
                </button>
            </div>

        </div>
    );

}
