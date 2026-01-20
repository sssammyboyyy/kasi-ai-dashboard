-- 03_CONTEXT_FIX.sql
-- This script safely integrates with your existing schema.
-- Run this in Supabase SQL Editor.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HANDLE 'LEADS' CONFLICT
-- You have an existing 'leads' table with a different structure.
-- We will rename it to 'leads_legacy' to avoid breaking it, but allow us to create the NEW leads table.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        -- Check if it has column 'venue_name' which indicates it's the old table
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'venue_name') THEN
            ALTER TABLE public.leads RENAME TO leads_legacy;
        END IF;
    END IF;
END $$;

-- 3. ORGANIZATIONS (Use existing, add missing columns safe)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add 'slug' if missing
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 4. PROFILES (Use existing, add missing columns safe)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. NEW LEADS TABLE (Now safe to create)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Business Info
    business_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    
    -- Scrape Metadata
    source TEXT DEFAULT 'manual',
    raw_data JSONB,
    
    -- Scoring & Status
    score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notified_at TIMESTAMPTZ,
    contacted_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ
);

-- 6. CAMPAIGNS TABLE (New)
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

-- 7. NOTIFICATIONS TABLE (New)
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

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- 9. RLS POLICIES (Re-apply safely)

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop generic policies to allow clean creation
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their org leads" ON public.leads;

-- Create Policies
CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT TO authenticated
    USING ( id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING ( id = (SELECT auth.uid()) );

CREATE POLICY "Users can view their org leads" ON public.leads
    FOR SELECT TO authenticated
    USING ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can insert leads for their org" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );
