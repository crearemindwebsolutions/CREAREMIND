-- 1. Create media table
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  public_id text NOT NULL,
  resource_type text NOT NULL DEFAULT 'image',
  format text,
  bytes bigint,
  original_filename text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own media" ON public.media
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.media
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.media
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view media" ON public.media
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.media
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Permissions
GRANT ALL ON public.media TO authenticated;
GRANT ALL ON public.media TO anon;
GRANT ALL ON public.media TO service_role;
