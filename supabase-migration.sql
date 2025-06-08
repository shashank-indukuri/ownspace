-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table that syncs with auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weddings table
CREATE TABLE IF NOT EXISTS public.weddings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bride_name VARCHAR NOT NULL,
  groom_name VARCHAR NOT NULL,
  wedding_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue VARCHAR NOT NULL,
  venue_address TEXT,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'active',
  rsvp_code VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guest categories table
CREATE TABLE IF NOT EXISTS public.guest_categories (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  color VARCHAR NOT NULL DEFAULT '#D4AF37',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table
CREATE TABLE IF NOT EXISTS public.guests (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.guest_categories(id) ON DELETE SET NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  rsvp_status VARCHAR NOT NULL DEFAULT 'pending',
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  plus_one_name VARCHAR,
  dietary_restrictions TEXT,
  notes TEXT,
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  rsvp_submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication logs table
CREATE TABLE IF NOT EXISTS public.communication_logs (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES public.guests(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  subject VARCHAR,
  message TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own weddings" ON public.weddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weddings" ON public.weddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weddings" ON public.weddings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weddings" ON public.weddings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own guest categories" ON public.guest_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = guest_categories.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own guest categories" ON public.guest_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = guest_categories.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own guests" ON public.guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = guests.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own guests" ON public.guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = guests.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own communication logs" ON public.communication_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = communication_logs.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own communication logs" ON public.communication_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.weddings 
      WHERE weddings.id = communication_logs.wedding_id 
      AND weddings.user_id = auth.uid()
    )
  );

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();