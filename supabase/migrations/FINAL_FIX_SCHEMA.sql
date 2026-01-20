-- FINAL FIX SCHEMA
-- Run this in Supabase SQL Editor
-- This uses native Postgres syntax to safely add columns without complex blocks

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Organizations (if not exists)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Safely Add Columns to Profiles (Native Postgres)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Create Leads (if not exists)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    source TEXT DEFAULT 'manual',
    raw_data JSONB,
    score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    contacted_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ
);

-- 5. Create Campaigns (if not exists)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_industries TEXT[],
    target_locations TEXT[],
    scrape_schedule TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    leads_collected INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 6. Create Notifications (if not exists)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms', 'push')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    message TEXT,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_status ON public.leads(org_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_lead ON public.notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- 8. Policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop old to reset
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their org leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads for their org" ON public.leads;
DROP POLICY IF EXISTS "Users can update their org leads" ON public.leads;

-- Re-create
CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT TO authenticated
    USING ( id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING ( id = (SELECT auth.uid()) );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ( id = (SELECT auth.uid()) )
    WITH CHECK ( id = (SELECT auth.uid()) );

CREATE POLICY "Users can view their org leads" ON public.leads
    FOR SELECT TO authenticated
    USING ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can insert leads for their org" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

-- 9. Seed Data
INSERT INTO public.organizations (id, name, slug, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo', 'pro')
ON CONFLICT (id) DO NOTHING;
