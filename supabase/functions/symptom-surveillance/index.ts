import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_THRESHOLD = 20;
const TIME_WINDOW_HOURS = 72; // 3 days

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const cutoff = new Date(Date.now() - TIME_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    // Get symptom logs from the time window
    const { data: logs, error } = await admin
      .from("symptom_logs")
      .select("symptoms, matched_illness, matched_specialization, created_at")
      .gte("created_at", cutoff);

    if (error) throw error;

    // Count symptom combinations
    const symptomCounts: Record<string, { count: number; illness: string; specialization: string; firstSeen: string; lastSeen: string }> = {};

    for (const log of (logs || [])) {
      const key = log.symptoms.trim().toLowerCase();
      if (!symptomCounts[key]) {
        symptomCounts[key] = {
          count: 0,
          illness: log.matched_illness || "",
          specialization: log.matched_specialization || "",
          firstSeen: log.created_at,
          lastSeen: log.created_at,
        };
      }
      symptomCounts[key].count++;
      if (log.created_at > symptomCounts[key].lastSeen) {
        symptomCounts[key].lastSeen = log.created_at;
      }
      if (log.created_at < symptomCounts[key].firstSeen) {
        symptomCounts[key].firstSeen = log.created_at;
      }
    }

    // Find alerts (threshold exceeded)
    const alerts = Object.entries(symptomCounts)
      .filter(([, v]) => v.count >= ALERT_THRESHOLD)
      .map(([symptoms, data]) => ({
        symptoms,
        ...data,
      }));

    if (alerts.length > 0) {
      // Send notification to all admins
      const { data: adminRoles } = await admin
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      for (const adminRole of (adminRoles || [])) {
        for (const alert of alerts) {
          await admin.from("notifications").insert({
            user_id: adminRole.user_id,
            title: "⚠️ تنبيه رصد أعراض",
            message: `تم رصد تكرار الأعراض "${alert.symptoms}" ${alert.count} مرة خلال ${TIME_WINDOW_HOURS} ساعة. المرض المحتمل: ${alert.illness}. التخصص: ${alert.specialization}`,
            type: "surveillance_alert",
          });
        }
      }

      // Log alert email info (actual email sending would require email service)
      console.log("SURVEILLANCE ALERT - Would send email to alerts@medical-platform-demo.com:");
      for (const alert of alerts) {
        console.log(`- Symptoms: ${alert.symptoms}, Count: ${alert.count}, Period: ${alert.firstSeen} to ${alert.lastSeen}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      totalLogs: logs?.length || 0,
      alertsTriggered: alerts.length,
      alerts,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
