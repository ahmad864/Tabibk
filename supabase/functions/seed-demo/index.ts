import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_PASSWORD = "Demo@TabibakX9!";

const demoAccounts = [
  { phone: "+963999999999", email: "admin@demo.tabibak.local", name: "Admin Test", role: "admin" as const },
  { phone: "+963988888888", email: "ahmad@demo.tabibak.local", name: "د. أحمد محمد", role: "doctor" as const, spec: "طب قلبية", city: "دمشق", clinic: "شارع الحمراء", bio: "أخصائي أمراض القلب والأوعية الدموية بخبرة 15 سنة", diseases: ["أمراض القلب", "ارتفاع ضغط الدم", "تصلب الشرايين", "قصور القلب"] },
  { phone: "+963966666666", email: "sara@demo.tabibak.local", name: "د. سارة علي", role: "doctor" as const, spec: "جهاز هضمي", city: "حلب", clinic: "شارع النيل", bio: "متخصصة في أمراض الجهاز الهضمي والكبد بخبرة 10 سنوات", diseases: ["قرحة المعدة", "القولون العصبي", "التهاب الكبد", "ارتجاع المريء"] },
  { phone: "+963955555555", email: "ali@demo.tabibak.local", name: "د. علي حسن", role: "doctor" as const, spec: "طب أعصاب", city: "دمشق", clinic: "ساحة الأمويين", bio: "استشاري طب الأعصاب والدماغ بخبرة 12 سنة", diseases: ["الصداع النصفي", "الصرع", "التصلب اللويحي", "آلام الأعصاب"] },
  { phone: "+963944444444", email: "layla@demo.tabibak.local", name: "د. ليلى كريم", role: "doctor" as const, spec: "طب أطفال", city: "حمص", clinic: "شارع الجامعة", bio: "أخصائية طب الأطفال وحديثي الولادة بخبرة 8 سنوات", diseases: ["أمراض الأطفال العامة", "حساسية الأطفال", "نمو وتطور الطفل", "أمراض الجهاز التنفسي"] },
  { phone: "+963933333333", email: "omar@demo.tabibak.local", name: "د. عمر يوسف", role: "doctor" as const, spec: "طب جلدية", city: "اللاذقية", clinic: "شارع بغداد", bio: "أخصائي الأمراض الجلدية والتجميل بخبرة 10 سنوات", diseases: ["حب الشباب", "الأكزيما", "الصدفية", "أمراض الشعر"] },
  { phone: "+963922222222", email: "hani@demo.tabibak.local", name: "د. هاني سعد", role: "doctor" as const, spec: "طب عظمية", city: "دمشق", clinic: "شارع المزة", bio: "جراح عظام ومفاصل بخبرة 20 سنة", diseases: ["كسور العظام", "خشونة المفاصل", "آلام الظهر", "تمزق الأربطة"] },
  { phone: "+963977777777", email: "patient@demo.tabibak.local", name: "Patient Demo", role: "patient" as const },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const results: any[] = [];

    for (const acc of demoAccounts) {
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u: any) => u.email === acc.email);
      
      let userId: string;
      if (existing) {
        userId = existing.id;
      } else {
        const { data: newUser, error: signupErr } = await admin.auth.admin.createUser({
          email: acc.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          phone: acc.phone,
          phone_confirm: true,
          user_metadata: { full_name: acc.name },
        });
        if (signupErr) { results.push({ name: acc.name, error: signupErr.message }); continue; }
        userId = newUser.user.id;
      }

      await admin.from("profiles").upsert({
        user_id: userId,
        full_name: acc.name,
        phone: acc.phone,
      }, { onConflict: "user_id" });

      const { data: existingRole } = await admin.from("user_roles").select("id").eq("user_id", userId).eq("role", acc.role).single();
      if (!existingRole) {
        await admin.from("user_roles").insert({ user_id: userId, role: acc.role });
      }

      if (acc.role === "doctor" && acc.spec) {
        const { data: existingDoc } = await admin.from("doctors").select("id").eq("user_id", userId).single();
        if (!existingDoc) {
          await admin.from("doctors").insert({
            user_id: userId,
            full_name: acc.name,
            specialization: acc.spec,
            phone: acc.phone,
            city: acc.city,
            clinic_address: acc.clinic,
            bio: acc.bio,
            diseases_treated: acc.diseases,
            is_approved: true,
            is_active: true,
            working_hours_start: "08:00",
            working_hours_end: "16:00",
            slot_duration_minutes: 30,
            working_days: [0, 1, 2, 3, 4],
            rating: 4 + Math.random(),
            rating_count: Math.floor(Math.random() * 20) + 5,
          });
        }
      }

      results.push({ name: acc.name, role: acc.role, userId, status: "ok" });
    }

    return new Response(JSON.stringify({ success: true, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
