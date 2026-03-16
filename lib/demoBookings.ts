// مخزن الحجوزات التجريبية المشتركة في الذاكرة
// يُستخدم من booking-modal و doctor-dashboard

export interface DemoBooking {
  id: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  patientId: string
  patientName: string
  patientPhone: string
  status: 'pending' | 'confirmed' | 'rejected'
  createdAt: string
}

// المخزن المشترك
export const demoBookingsStore: DemoBooking[] = []

export function addDemoBooking(booking: Omit<DemoBooking, 'id' | 'createdAt'>): DemoBooking {
  const newBooking: DemoBooking = {
    ...booking,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  demoBookingsStore.push(newBooking)
  return newBooking
}

export function updateDemoBookingStatus(id: string, status: 'confirmed' | 'rejected') {
  const booking = demoBookingsStore.find((b) => b.id === id)
  if (booking) booking.status = status
  return booking
}

export function getDemoBookingsForDoctor(doctorId: string): DemoBooking[] {
  return demoBookingsStore.filter((b) => b.doctorId === doctorId)
}

export function getDemoBookedSlotsForDate(doctorId: string, date: string): string[] {
  return demoBookingsStore
    .filter((b) => b.doctorId === doctorId && b.date === date && b.status !== 'rejected')
    .map((b) => b.time)
}
