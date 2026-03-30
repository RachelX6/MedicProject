import { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import LoadingOverlay from "../components/LoadingOverlay";
import useProfile from "../hooks/useProfile";
import { useRouter } from "next/router";
import ErrorDisplay from "../components/ErrorDisplay";

export default function AddSenior() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();

    const [publicSeniorId, setPublicSeniorId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const formatHome = (home) => {
        if (!home) return "—";
        return home
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!publicSeniorId.trim() || !user || !profile?.senior_home) return;

        setSubmitting(true);

        const { error } = await supabase.from("senior_profiles").insert({
            public_senior_id: publicSeniorId.trim(),
            senior_home: profile.senior_home,
        });

        if (error) {
            if (error.code === "23505") {
                setSubmitError("A senior with this ID already exists.");
            } else {
                setSubmitError("Error adding senior: " + error.message);
            }
        } else {
            alert("Senior added successfully!");
            setPublicSeniorId("");
        }

        setSubmitting(false);
    };

    if (!user || profileLoading) {
        return <LoadingOverlay message="Loading..." />;
    }

    if (!profile?.senior_home) {
        return (
            <div style={{
                maxWidth: "600px",
                margin: "2rem auto",
                padding: "2.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                textAlign: "center",
            }}>
                <h1 style={{ color: "#8d171b", marginBottom: "1rem" }}>Add Senior</h1>
                <p style={{ color: "#666" }}>
                    You need to select a senior home in your profile before you can add seniors.
                </p>
                <button
                    onClick={() => router.push("/editProfile")}
                    style={{
                        marginTop: "1rem",
                        backgroundColor: "#8d171b",
                        color: "white",
                        padding: "0.75rem 2rem",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Edit Profile
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "600px",
            margin: "2rem auto",
            padding: "2.5rem",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}>
            <h1 style={{
                color: "#8d171b",
                marginBottom: "0.5rem",
                fontSize: "2rem",
            }}>
                Add Senior
            </h1>

            <ErrorDisplay 
                message={submitError} 
                onDismiss={() => setSubmitError(null)} 
            />

            <p style={{ color: "#666", marginBottom: "2rem", lineHeight: "1.5" }}>
                Add a senior to <strong style={{ color: "#171717" }}>{formatHome(profile.senior_home)}</strong>.
                The senior will be automatically assigned to your home.
            </p>

            <form onSubmit={handleSubmit} style={{
                padding: "1.5rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
            }}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{
                        fontWeight: "bold",
                        color: "#171717",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}>
                        Senior ID (public identifier)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Senior-001 or Margaret S."
                        value={publicSeniorId}
                        onChange={(e) => setPublicSeniorId(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            fontSize: "1rem",
                            color: "#171717",
                            backgroundColor: "#ffffff",
                            boxSizing: "border-box",
                        }}
                    />
                    <small style={{ color: "#888", marginTop: "0.25rem", display: "block" }}>
                        This is the name or ID used to identify the senior in the system.
                    </small>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{
                        fontWeight: "bold",
                        color: "#171717",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}>
                        Senior Home
                    </label>
                    <div style={{
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "#f0f0f0",
                        color: "#171717",
                    }}>
                        {formatHome(profile.senior_home)} (auto-assigned)
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !publicSeniorId.trim()}
                    style={{
                        width: "100%",
                        backgroundColor: "#8d171b",
                        color: "white",
                        padding: "0.75rem",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        cursor: submitting ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        opacity: submitting ? 0.6 : 1,
                    }}
                >
                    {submitting ? "Adding..." : "Add Senior"}
                </button>
            </form>

            {/* Back Button */}
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
                    ← Back to Profile
                </button>
            </div>
        </div>
    );
}
