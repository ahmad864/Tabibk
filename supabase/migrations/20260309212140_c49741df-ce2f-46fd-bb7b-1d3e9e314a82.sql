
CREATE TABLE public.doctor_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  slot_time time without time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, day_of_week, slot_time)
);

ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor slots viewable by everyone" ON public.doctor_slots FOR SELECT TO public USING (true);

CREATE POLICY "Doctors can insert own slots" ON public.doctor_slots FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.doctors WHERE doctors.id = doctor_slots.doctor_id AND doctors.user_id = auth.uid())
);

CREATE POLICY "Doctors can delete own slots" ON public.doctor_slots FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE doctors.id = doctor_slots.doctor_id AND doctors.user_id = auth.uid())
);
