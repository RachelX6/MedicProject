import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import useProfile from "../../hooks/useProfile";
import LoadingOverlay from "../../components/LoadingOverlay";
import { useRouter } from "next/router";
import ErrorDisplay from "../../components/ErrorDisplay";

export default function CoordinatorDashboard() {
    const supabase = useSupabaseClient();
    const user = useUser();
    const { profile, loading: profileLoading } = useProfile();
    const router = useRouter();

    const [volunteers, setVolunteers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [exporting, setExporting] = useState(false);

    const formatHome = (home) => {
        if (!home) return "—";
        return home
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    // Check coordinator access
    useEffect(() => {
        if (!profileLoading && profile?.role !== "coordinator") {
            router.replace("/profile");
        }
    }, [profile, profileLoading, router]);

    // Load volunteers for this home
    useEffect(() => {
        if (!user || !profile?.senior_home || profile?.role !== "coordinator") return;

        const load = async () => {
            setLoading(true);

            // Get all volunteers at this home
            const { data: volData, error: volError } = await supabase
                .from("volunteer_profiles")
                .select("user_id, first_name, last_name, preferred_name, role")
                .eq("senior_home", profile.senior_home);

            if (!volError && volData) {
                // Also get private profile data (email, phone)
                const { data: privateData } = await supabase
                    .from("private_volunteer_profiles")
                    .select("user_id, email, phone_number")
                    .in("user_id", volData.map((v) => v.user_id));

                const merged = volData.map((v) => {
                    const priv = privateData?.find((p) => p.user_id === v.user_id);
                    return { ...v, email: priv?.email, phone_number: priv?.phone_number };
                });

                setVolunteers(merged);
            }

            setLoading(false);
        };

        load();
    }, [user, profile, supabase]);

    // Load reservations for selected date range
    useEffect(() => {
        if (!user || !profile?.senior_home || !startDate || !endDate) return;

        const loadReservations = async () => {
            const rangeStart = new Date(startDate + "T00:00:00Z").toISOString();
            const rangeEnd = new Date(endDate + "T23:59:59Z").toISOString();

            const { data, error } = await supabase
                .from("reservations")
                .select("*, volunteer_profiles(first_name, last_name, preferred_name)")
                .eq("senior_home", profile.senior_home)
                .gte("date", rangeStart)
                .lte("date", rangeEnd)
                .order("date", { ascending: true });

            if (!error) setReservations(data || []);
        };

        loadReservations();
    }, [user, profile, startDate, endDate, supabase]);

    const handleExportCSV = () => {
        setExporting(true);

        const headers = ["Volunteer Name", "Email", "Date", "Duration (min)", "Status", "Comment"];
        const rows = reservations.map((r) => [
            r.volunteer_profiles?.preferred_name || `${r.volunteer_profiles?.first_name || ""} ${r.volunteer_profiles?.last_name || ""}`.trim() || "Unknown",
            volunteers.find((v) => v.user_id === r.volunteer_id)?.email || "",
            new Date(r.date).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }),
            r.duration || 0,
            r.status || "",
            (r.comment || "").replace(/"/g, '""'),
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `volunteer_hours_${formatHome(profile.senior_home).replace(/ /g, "_")}_${startDate}_to_${endDate}.csv`;
        link.click();

        setExporting(false);
    };

    if (!user || profileLoading || loading) {
        return <LoadingOverlay message="Loading coordinator dashboard..." />;
    }

    if (profile?.role !== "coordinator") {
        return null; // Will redirect via useEffect
    }

    return (
        <div style={{
            maxWidth: "900px",
            margin: "2rem auto",
            padding: "2.5rem",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #8d171b 0%, #b91d24 100%)",
                color: "white",
                padding: "2rem",
                borderRadius: "10px",
                marginBottom: "2rem",
            }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", margin: 0 }}>
                    🏥 Coordinator Dashboard
                </h1>
                <p style={{ margin: 0, opacity: 0.9 }}>
                    Overview for {formatHome(profile.senior_home)}
                </p>
            </div>

            <ErrorDisplay 
                message={error} 
                onDismiss={() => setError(null)} 
            />

            {/* Volunteers Section */}
            <section style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ color: "#8d171b", marginBottom: "1rem", fontSize: "1.5rem" }}>
                    👥 Volunteers ({volunteers.length})
                </h2>

                {volunteers.length === 0 ? (
                    <p style={{ color: "#666" }}>No volunteers assigned to this home yet.</p>
                ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {volunteers.map((v) => (
                            <div key={v.user_id} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "1rem 1.25rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                            }}>
                                <div>
                                    <strong style={{ color: "#171717", fontSize: "1.05rem" }}>
                                        {v.preferred_name || `${v.first_name || ""} ${v.last_name || ""}`.trim() || "—"}
                                    </strong>
                                    {v.role === "coordinator" && (
                                        <span style={{
                                            marginLeft: "0.5rem",
                                            fontSize: "0.75rem",
                                            padding: "0.15rem 0.5rem",
                                            backgroundColor: "#8d171b",
                                            color: "white",
                                            borderRadius: "10px",
                                        }}>Coordinator</span>
                                    )}
                                </div>
                                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                                    {v.email && <span style={{ marginRight: "1rem" }}>📧 {v.email}</span>}
                                    {v.phone_number && <span>📞 {v.phone_number}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Hours Section */}
            <section>
                <h2 style={{ color: "#8d171b", marginBottom: "1rem", fontSize: "1.5rem" }}>
                    📊 Volunteer Hours
                </h2>

                <div style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-end",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                }}>
                    <div>
                        <label style={{
                            fontWeight: "bold",
                            color: "#171717",
                            display: "block",
                            marginBottom: "0.25rem",
                            fontSize: "0.9rem",
                        }}>From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "1rem",
                                color: "#171717",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            fontWeight: "bold",
                            color: "#171717",
                            display: "block",
                            marginBottom: "0.25rem",
                            fontSize: "0.9rem",
                        }}>To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            style={{
                                padding: "0.6rem",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "1rem",
                                color: "#171717",
                            }}
                        />
                    </div>

                    <button
                        onClick={handleExportCSV}
                        disabled={exporting || reservations.length === 0}
                        style={{
                            backgroundColor: reservations.length === 0 ? "#ccc" : "#27ae60",
                            color: "white",
                            padding: "0.6rem 1.5rem",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: reservations.length === 0 ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        {exporting ? "Exporting..." : "📥 Download CSV"}
                    </button>
                </div>

                {reservations.length === 0 ? (
                    <p style={{ color: "#666", textAlign: "center", padding: "1.5rem 0" }}>
                        No entries for the selected date range.
                    </p>
                ) : (
                    <>
                        <div style={{
                            marginBottom: "1rem",
                            padding: "0.75rem 1rem",
                            backgroundColor: "#f0f8f0",
                            borderRadius: "8px",
                            border: "1px solid #c3e6c3",
                            color: "#171717",
                        }}>
                            <strong>Total:</strong>{" "}
                            {(reservations.reduce((sum, r) => sum + (r.duration || 0), 0) / 60).toFixed(1)} hrs
                            ({reservations.length} entries)
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "0.95rem",
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #8d171b" }}>
                                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#8d171b" }}>Volunteer</th>
                                        <th style={{ textAlign: "left", padding: "0.75rem", color: "#8d171b" }}>Time</th>
                                        <th style={{ textAlign: "center", padding: "0.75rem", color: "#8d171b" }}>Duration</th>
                                        <th style={{ textAlign: "center", padding: "0.75rem", color: "#8d171b" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((r) => (
                                        <tr key={r.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                                            <td style={{ padding: "0.75rem", color: "#171717" }}>
                                                {r.volunteer_profiles?.preferred_name || `${r.volunteer_profiles?.first_name || ""} ${r.volunteer_profiles?.last_name || ""}`.trim() || "—"}
                                            </td>
                                            <td style={{ padding: "0.75rem", color: "#666" }}>
                                                {new Date(r.date).toLocaleTimeString("en-CA", { timeStyle: "short" })}
                                            </td>
                                            <td style={{ padding: "0.75rem", textAlign: "center", color: "#171717" }}>
                                                {r.duration ? `${(r.duration / 60).toFixed(1)} hrs` : "—"}
                                            </td>
                                            <td style={{ padding: "0.75rem", textAlign: "center" }}>
                                                <span style={{
                                                    padding: "0.2rem 0.6rem",
                                                    borderRadius: "12px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "500",
                                                    backgroundColor: r.status === "complete" ? "#d4edda" : r.status === "pending" ? "#fff3cd" : "#f0f0f0",
                                                    color: r.status === "complete" ? "#155724" : r.status === "pending" ? "#856404" : "#666",
                                                }}>
                                                    {r.status || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

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
