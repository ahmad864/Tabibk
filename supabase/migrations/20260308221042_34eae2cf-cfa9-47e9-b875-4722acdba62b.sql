
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Create doctor request status enum  
CREATE TYPE public.doctor_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table (for secure role checks)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  clinic_address TEXT,
  bio TEXT,
  diseases_treated TEXT[],
  avatar_url TEXT,
  certificate_url TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  working_hours_start TIME DEFAULT '08:00',
  working_hours_end TIME DEFAULT '16:00',
  working_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4],
  slot_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors viewable by everyone" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert doctors" ON public.doctors FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Doctor requests table
CREATE TABLE public.doctor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  clinic_address TEXT,
  avatar_url TEXT,
  certificate_url TEXT,
  status doctor_request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all requests" ON public.doctor_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can submit request" ON public.doctor_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update requests" ON public.doctor_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_doctor_requests_updated_at BEFORE UPDATE ON public.doctor_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view own appointments" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
);
CREATE POLICY "Patients can book" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors can update appointment status" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Patients can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-images', 'doctor-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-certificates', 'doctor-certificates', false);

CREATE POLICY "Doctor images are public" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-images');
CREATE POLICY "Anyone can upload doctor images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'doctor-images');
CREATE POLICY "Certificates viewable by admins" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-certificates');
CREATE POLICY "Anyone can upload certificates" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'doctor-certificates');

-- Function to update doctor rating
CREATE OR REPLACE FUNCTION public.update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.doctors
  SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE doctor_id = NEW.doctor_id),
      rating_count = (SELECT COUNT(*) FROM public.reviews WHERE doctor_id = NEW.doctor_id)
  WHERE id = NEW.doctor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rating_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_doctor_rating();
