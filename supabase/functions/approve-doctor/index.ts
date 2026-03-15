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

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await anonClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: roleCheck } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
    if (!roleCheck) throw new Error("Not admin");

    const { requestId, action } = await req.json();
    if (!requestId || !["approved", "rejected"].includes(action)) {
      throw new Error("Invalid request");
    }

    // Update request status
    const { error: updateErr } = await admin.from("doctor_requests").update({ status: action, reviewed_by: user.id }).eq("id", requestId);
    if (updateErr) throw updateErr;

    if (action === "approved") {
      // Get request details
      const { data: request, error: fetchErr } = await admin.from("doctor_requests").select("*").eq("id", requestId).single();
      if (fetchErr || !request) throw fetchErr || new Error("Request not found");

      // Create auth user with phone
      const email = `doctor_${requestId.slice(0, 8)}@tabibak.local`;
      const password = "Doctor@Tabibak2024!";

      const { data: existingUsers } = await admin.auth.admin.listUsers();
      let userId: string;
      const existingUser = existingUsers?.users?.find((u: any) => u.phone === request.phone);

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          phone: request.phone,
          phone_confirm: true,
          email_confirm: true,
          user_metadata: { full_name: request.full_name },
        });
        if (createErr) throw createErr;
        userId = newUser.user.id;
      }

      // Create profile
      await admin.from("profiles").upsert({
        user_id: userId,
        full_name: request.full_name,
        phone: request.phone,
        avatar_url: request.avatar_url,
      }, { onConflict: "user_id" });

      // Add doctor role
      const { data: existingRole } = await admin.from("user_roles").select("id").eq("user_id", userId).eq("role", "doctor").single();
      if (!existingRole) {
        await admin.from("user_roles").insert({ user_id: userId, role: "doctor" });
      }

      // Create doctor record
      const { data: existingDoc } = await admin.from("doctors").select("id").eq("phone", request.phone).single();
      if (existingDoc) {
        await admin.from("doctors").update({
          user_id: userId,
          is_approved: true,
          is_active: true,
          avatar_url: request.avatar_url,
          certificate_url: request.certificate_url,
        }).eq("id", existingDoc.id);
      } else {
        await admin.from("doctors").insert({
          user_id: userId,
          full_name: request.full_name,
          specialization: request.specialization,
          phone: request.phone,
          city: request.city,
          clinic_address: request.clinic_address,
          avatar_url: request.avatar_url,
          certificate_url: request.certificate_url,
          is_approved: true,
          is_active: true,
        });
      }

      return new Response(JSON.stringify({ success: true, userId, email, password }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
