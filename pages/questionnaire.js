// pages/questionnaire.js
import { useEffect, useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import dynamic from "next/dynamic";

// Import dynamically using the new shared filename inside role folders
const VolunteerQuestionnaire = dynamic(
  () => import("./volunteer/personalityQuestionnaire"),
  { ssr: false }
);
const SeniorQuestionnaire = dynamic(
  () => import("./senior/personalityQuestionnaire"),
  { ssr: false }
);

export default function QuestionnairePage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchRole() {
      const { data, error } = await supabase
        .from("personal_profiles_view")
        .select("user_role")
        .eq("email", user.email)
        .single();

      if (error || !data) {
        console.error("Error fetching role:", error || "no data");
        setRole(null);
        setLoading(false);
        return;
      }

      setRole(data.user_role); // should be "volunteer" or "senior"
      setLoading(false);
    }

    fetchRole();
  }, [user]);

  if (!user || loading) return <p>Loading questionnaire…</p>;
  if (!role) return <p>Could not determine your role. Please contact support.</p>;

  return role === "volunteer"
    ? <VolunteerQuestionnaire />
    : <SeniorQuestionnaire />;
}
