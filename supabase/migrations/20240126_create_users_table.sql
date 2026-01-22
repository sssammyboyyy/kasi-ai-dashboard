-- Create users table for Kasi AI customers
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT, -- WhatsApp number
    business_name TEXT,
    niche TEXT, -- e.g. Commercial Cleaning
    location TEXT, -- e.g. Johannesburg
    credits INTEGER DEFAULT 25, -- The free leads promise
    onboarding_data JSONB, -- Full survey dump
    status TEXT DEFAULT 'active' -- active, churned, banned
);

-- RLS Policies (Optional but recommended)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "Service role full access" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');
