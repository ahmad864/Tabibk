
-- Allow anonymous/unauthenticated users to submit doctor requests
DROP POLICY IF EXISTS "Authenticated can submit request" ON public.doctor_requests;
CREATE POLICY "Anyone can submit doctor request"
  ON public.doctor_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
