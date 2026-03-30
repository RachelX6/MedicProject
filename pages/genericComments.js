import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import LoadingOverlay from "../components/LoadingOverlay";
import useProfile from "../hooks/useProfile";
import { useRouter } from "next/router";
import ErrorDisplay from "../components/ErrorDisplay";

export default function GenericComments() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const { profile } = useProfile();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [category, setCategory] = useState("general");
    const [submitting, setSubmitting] = useState(false);
    const [filterCategory, setFilterCategory] = useState("all");
    const [submitError, setSubmitError] = useState(null);

    const categories = [
        { value: "general", label: "💬 General" },
        { value: "suggestion", label: "💡 Suggestion" },
        { value: "concern", label: "⚠️ Concern" },
        { value: "question", label: "❓ Question" },
    ];

    // Load all generic comments
    useEffect(() => {
        if (!user) return;

        const load = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("generic_comments")
                .select("*, volunteer_profiles(preferred_name, first_name)")
                .order("created_at", { ascending: false });

            if (!error) setComments(data || []);
            setLoading(false);
        };

        load();
    }, [user, supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmitting(true);
        setSubmitError(null);
        const { error } = await supabase.from("generic_comments").insert({
            volunteer_id: user.id,
            senior_home: profile?.senior_home || null,
            comment: newComment.trim(),
            category,
        });

        if (error) {
            setSubmitError("Error posting comment: " + error.message);
        } else {
            setNewComment("");
            // Reload comments
            const { data } = await supabase
                .from("generic_comments")
                .select("*, volunteer_profiles(preferred_name, first_name)")
                .order("created_at", { ascending: false });
            setComments(data || []);
        }
        setSubmitting(false);
    };

    const filtered = filterCategory === "all"
        ? comments
        : comments.filter((c) => c.category === filterCategory);

    if (!user || loading) {
        return <LoadingOverlay message="Loading comments..." />;
    }

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
                marginBottom: "0.5rem",
                fontSize: "2rem"
            }}>
                💬 General Comments
            </h1>
            <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.5" }}>
                Share your thoughts, suggestions, or concerns. Comments are visible to all volunteers across all homes.
            </p>

            <ErrorDisplay 
                message={submitError} 
                onDismiss={() => setSubmitError(null)} 
            />

            {/* Write Comment Form */}
            <form onSubmit={handleSubmit} style={{
                marginBottom: "2.5rem",
                padding: "1.5rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
            }}>
                <label style={{
                    fontWeight: "bold",
                    color: "#171717",
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "1.1rem",
                }}>Write a Comment</label>

                <textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        minHeight: "100px",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        fontSize: "1rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                        color: "#171717",
                        backgroundColor: "#ffffff",
                        marginBottom: "1rem",
                        boxSizing: "border-box",
                    }}
                />

                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            fontSize: "1rem",
                            color: "#171717",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        {categories.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        style={{
                            backgroundColor: "#8d171b",
                            color: "white",
                            padding: "0.6rem 1.5rem",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: submitting ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </form>

            {/* Filter */}
            <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => setFilterCategory("all")}
                    style={{
                        padding: "0.4rem 1rem",
                        borderRadius: "20px",
                        border: filterCategory === "all" ? "2px solid #8d171b" : "1px solid #e0e0e0",
                        backgroundColor: filterCategory === "all" ? "#8d171b" : "#ffffff",
                        color: filterCategory === "all" ? "#ffffff" : "#171717",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                    }}
                >All</button>
                {categories.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => setFilterCategory(c.value)}
                        style={{
                            padding: "0.4rem 1rem",
                            borderRadius: "20px",
                            border: filterCategory === c.value ? "2px solid #8d171b" : "1px solid #e0e0e0",
                            backgroundColor: filterCategory === c.value ? "#8d171b" : "#ffffff",
                            color: filterCategory === c.value ? "#ffffff" : "#171717",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "0.9rem",
                            transition: "all 0.2s",
                        }}
                    >{c.label}</button>
                ))}
            </div>

            {/* Comments List */}
            {filtered.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", padding: "2rem 0" }}>
                    No comments yet. Be the first to share!
                </p>
            ) : (
                filtered.map((c) => (
                    <div key={c.id} style={{
                        background: "#f8f9fa",
                        padding: "1.25rem",
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        marginBottom: "1rem",
                        border: "1px solid #e0e0e0",
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.75rem",
                        }}>
                            <span style={{
                                fontWeight: "600",
                                color: "#8d171b",
                                fontSize: "0.95rem",
                            }}>
                                {c.volunteer_profiles?.preferred_name || c.volunteer_profiles?.first_name || "Volunteer"}
                            </span>
                            <span style={{
                                fontSize: "0.8rem",
                                color: "#999",
                                padding: "0.2rem 0.6rem",
                                backgroundColor: "#f0f0f0",
                                borderRadius: "12px",
                            }}>
                                {categories.find(cat => cat.value === c.category)?.label || "💬 General"}
                            </span>
                        </div>
                        <p style={{
                            color: "#171717",
                            margin: "0 0 0.5rem 0",
                            lineHeight: "1.6"
                        }}>{c.comment}</p>
                        <small style={{ color: "#666" }}>
                            {new Date(c.created_at).toLocaleDateString("en-CA", { dateStyle: "medium" })}
                            {c.senior_home && ` • ${c.senior_home.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`}
                        </small>
                    </div>
                ))
            )}

            {/* Back Button */}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                    type="button"
                    onClick={() => router.push("/profile")}
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
