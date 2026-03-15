
-- Tighten doctor insert to authenticated only
DROP POLICY "Anyone can insert doctors" ON public.doctors;
CREATE POLICY "Authenticated can insert doctors" ON public.doctors FOR INSERT TO authenticated WITH CHECK (true);

-- Tighten notification insert to authenticated only  
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Doctor requests can stay open for registration flow but restrict to authenticated
DROP POLICY "Anyone can submit request" ON public.doctor_requests;
CREATE POLICY "Authenticated can submit request" ON public.doctor_requests FOR INSERT TO authenticated WITH CHECK (true);
