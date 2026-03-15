
CREATE TABLE public.symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symptoms text NOT NULL,
  matched_illness text,
  matched_specialization text,
  patient_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert symptom logs" ON public.symptom_logs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view symptom logs" ON public.symptom_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
