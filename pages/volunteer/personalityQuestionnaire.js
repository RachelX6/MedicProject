import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import questionData from "../../data/questions.json";

export default function VolunteerQuestionnaire() {
    const supabase = useSupabaseClient();
    const user = useUser();

    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        const totalQs = questionData["volunteer"].reduce(
            (count, group) => count + group.questions.length,
            0
        );
        setResponses(new Array(totalQs).fill(null));
        setLoading(false);
    }, [user]);

    function handleResponseChange(idx, value) {
        const copy = [...responses];
        copy[idx] = value;
        setResponses(copy);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (responses.includes(null)) {
            alert("⚠️ Please answer all questions before submitting.");
            return;
        }

        const traitAverages = {};
        let offset = 0;

        questionData["volunteer"].forEach((group) => {
            const key = group.key;
            let sum = 0;
            const questionCount = group.questions.length;

            group.questions.forEach((q) => {
                const raw = responses[offset];
                const scored = q.reverse ? 6 - raw : raw;
                sum += scored;
                offset += 1;
            });

            traitAverages[key] = sum / questionCount;
        });

        const payload = {
            id: user.id,
            agreeableness: traitAverages["agreeableness"],
            conscientiousness: traitAverages["conscientiousness"],
            extraversion: traitAverages["extraversion"],
            neuroticism: traitAverages["neuroticism"],
            openness_to_experience: traitAverages["openness_to_experience"],
        };

        try {
            setIsSubmitting(true);
            const { error } = await supabase.functions.invoke("register_user_personality", {
                body: JSON.stringify(payload),
            });

            if (error) {
                console.error("Edge Function error:", error);
                alert("❗️ Could not save your scores. Please try again.");
            } else {
                alert("🎉 Your scores have been saved!");
            }
        } catch (err) {
            console.error("Unexpected invoke error:", err);
            alert("❗️ Unexpected error. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!user || loading) return <p>Loading questionnaire…</p>;

    const flatQuestions = questionData["volunteer"].flatMap((group) => group.questions);

    return (
        <div style={containerStyle}>
            <form onSubmit={handleSubmit}>
                <h1 style={headerStyle}>Questionnaire for Volunteers</h1>
                <p style={descStyle}>
                    Please answer the following questions as honestly as you can. For each statement, choose a number from <strong>1</strong> (strongly disagree) to <strong>5</strong> (strongly agree).
                    <br />
                    Your responses help us match you with someone whose personality is compatible with yours — so visits feel more comfortable and enjoyable for both of you!
                    <br /> 
                    Please make sure to fill out all the questions!
                </p>

                {flatQuestions.map((q, i) => (
                    <div key={i} style={cardStyle}>
                        <p style={questionTextStyle}>{i + 1}. {q.text}</p>
                        <div style={scaleStyle}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <label key={num} style={labelStyle(responses[i] === num)}>
                                    <input
                                        type="radio"
                                        name={`q${i}`}
                                        value={num}
                                        checked={responses[i] === num}
                                        onChange={() => handleResponseChange(i, num)}
                                        required
                                        style={{ display: "none" }}
                                    />
                                    {num}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{ textAlign: "center" }}>
                    <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
                        {isSubmitting ? "Saving…" : "Submit Answers"}
                    </button>
                </div>
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                        type="button"
                        onClick={() => window.location.href = "/profile"}
                        style={backButtonStyle}
                    >
                        ← Back to Profile
                    </button>
                </div>
            </form>
        </div>
    );
}

// Styles (shared with Senior)
const containerStyle = {
    maxWidth: "850px",
    margin: "2rem auto",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "2.5rem",
};
const headerStyle = {
    fontSize: "2rem",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#8d171b",
};
const descStyle = {
    textAlign: "center",
    color: "#444",
    marginBottom: "2rem",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
};
const cardStyle = {
    marginBottom: "1.2rem",
    padding: "1.2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #ddd",
};
const questionTextStyle = {
    fontWeight: "bold",
    fontSize: "1.05rem",
    marginBottom: "1rem",
    color: 'black',
};
const scaleStyle = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
};
const labelStyle = (selected) => ({
    padding: "0.4rem 0.75rem",
    borderRadius: "6px",
    backgroundColor: selected ? "#8d171b" : "#eee",
    color: selected ? "white" : "#333",
    cursor: "pointer",
    fontWeight: "bold",
    border: "1px solid #ccc",
});
const submitButtonStyle = {
    backgroundColor: "#8d171b",
    color: "white",
    padding: "0.75rem 2rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s ease",
};
const backButtonStyle = {
    backgroundColor: "#ccc",
    color: "#333",
    padding: "0.65rem 1.8rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    cursor: "pointer",
};
