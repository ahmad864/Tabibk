// Demo account phone-to-email mapping for OTP bypass
export const DEMO_PASSWORD = "Demo@TabibakX9!";

export const DEMO_ACCOUNTS: Record<string, { email: string; name: string; role: string }> = {
  "+963999999999": { email: "admin@demo.tabibak.local", name: "Admin Test", role: "admin" },
  "+963988888888": { email: "ahmad@demo.tabibak.local", name: "د. أحمد محمد", role: "doctor" },
  "+963977777777": { email: "patient@demo.tabibak.local", name: "Patient Demo", role: "patient" },
  "+963966666666": { email: "sara@demo.tabibak.local", name: "د. سارة علي", role: "doctor" },
  "+963955555555": { email: "ali@demo.tabibak.local", name: "د. علي حسن", role: "doctor" },
  "+963944444444": { email: "layla@demo.tabibak.local", name: "د. ليلى كريم", role: "doctor" },
  "+963933333333": { email: "omar@demo.tabibak.local", name: "د. عمر يوسف", role: "doctor" },
  "+963922222222": { email: "hani@demo.tabibak.local", name: "د. هاني سعد", role: "doctor" },
};

export const isDemoPhone = (phone: string): boolean => {
  return phone in DEMO_ACCOUNTS;
};

export const getDemoAccount = (phone: string) => {
  return DEMO_ACCOUNTS[phone] || null;
};

export const formatPhone = (p: string) => {
  const cleaned = p.replace(/\D/g, "");
  if (cleaned.startsWith("09") && cleaned.length === 10) return "+963" + cleaned.slice(1);
  if (cleaned.startsWith("963")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+963" + cleaned.slice(1);
  return "+963" + cleaned;
};
