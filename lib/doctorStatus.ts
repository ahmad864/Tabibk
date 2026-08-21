/**
 * Determine if a doctor is currently marked active.
 * هذا القرار يدوي بالكامل بيد الطبيب (أو الأدمن) عبر عمود is_active،
 * ولا علاقة له بساعات الدوام (working_hours) — تلك تُستخدم فقط لتحديد
 * الأوقات المتاحة للحجز.
 */
export const isDoctorActive = (isActive?: boolean | null): boolean => {
  return !!isActive;
};
