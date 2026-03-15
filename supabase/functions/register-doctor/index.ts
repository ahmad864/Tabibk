import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { full_name, specialization, phone, city, clinic_address, avatar_url, certificate_url } = await req.json();

    if (!full_name || !specialization || !phone) {
      throw new Error("Missing required fields");
    }

    // Check if a doctor with this phone already exists
    const { data: existingDoc } = await admin.from("doctors").select("id, user_id").eq("phone", phone).single();
    if (existingDoc?.user_id) {
      // Doctor already exists, return credentials for login
      return new Response(JSON.stringify({ 
        success: true, 
        userId: existingDoc.user_id,
        email: `doctor_${phone.replace("+", "")}@tabibak.local`,
        password: "Doctor@Tabibak2024!",
        existing: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create auth user
    const email = `doctor_${phone.replace("+", "")}@tabibak.local`;
    const password = "Doctor@Tabibak2024!";

    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      phone,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createErr) throw createErr;
    const userId = newUser.user.id;

    // Create profile
    await admin.from("profiles").upsert({
      user_id: userId,
      full_name,
      phone,
      avatar_url,
    }, { onConflict: "user_id" });

    // Add doctor role
    await admin.from("user_roles").insert({ user_id: userId, role: "doctor" });

    // Create doctor record (immediately approved and active)
    if (existingDoc) {
      await admin.from("doctors").update({
        user_id: userId,
        is_approved: true,
        is_active: true,
        avatar_url,
        certificate_url,
      }).eq("id", existingDoc.id);
    } else {
      await admin.from("doctors").insert({
        user_id: userId,
        full_name,
        specialization,
        phone,
        city,
        clinic_address,
        avatar_url,
        certificate_url,
        is_approved: true,
        is_active: true,
      });
    }

    // Also create a doctor_request record for admin reference
    await admin.from("doctor_requests").insert({
      full_name,
      specialization,
      phone,
      city,
      clinic_address,
      avatar_url,
      certificate_url,
      status: "approved",
    });

    return new Response(JSON.stringify({ success: true, userId, email, password }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
