/**
 * Determine if a doctor is currently active based on working hours and working days.
 */
export const isDoctorActive = (
  workingHoursStart?: string | null,
  workingHoursEnd?: string | null,
  workingDays?: number[] | null
): boolean => {
  const now = new Date();
  const currentDay = now.getDay();
  const days = workingDays ?? [0, 1, 2, 3, 4];

  if (!days.includes(currentDay)) return false;

  const start = workingHoursStart?.slice(0, 5) || "08:00";
  const end = workingHoursEnd?.slice(0, 5) || "16:00";

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};
