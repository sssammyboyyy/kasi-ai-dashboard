-- ========================================================
-- 1. CLEANUP & DEDUPLICATION (Run Once First)
-- ========================================================

-- Identify duplicates (Optional view)
-- SELECT website, COUNT(*) FROM prospects GROUP BY website HAVING COUNT(*) > 1;

-- Delete duplicates (Keep the latest scrape)
DELETE FROM prospects
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (partition BY website ORDER BY scraped_at DESC) as rnum
        FROM prospects
        WHERE website IS NOT NULL
    ) t
    WHERE t.rnum > 1
);

-- Add Constraint (Safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prospects_website_key') THEN
        ALTER TABLE prospects ADD CONSTRAINT prospects_website_key UNIQUE (website);
    END IF;
END $$;


-- ========================================================
-- 2. CRM CORE SCHEMA
-- ========================================================

-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORGANIZATIONS (Multi-tenancy Root)
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    plan text DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    created_at timestamp DEFAULT now()
);

-- PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    org_id uuid REFERENCES public.organizations(id),
    full_name text,
    avatar_url text,
    role text DEFAULT 'client_admin', -- 'platform_admin', 'client_admin', 'sales_agent'
    onboarding_status text DEFAULT 'pending',
    updated_at timestamp DEFAULT now()
);

-- CONTACTS (The CRM Leads - Separate from Raw Prospects)
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations(id) NOT NULL,
    
    -- Contact Info
    full_name text,
    email text,
    phone text,
    linkedin_url text,
    company_name text,
    
    -- CRM Status
    status text DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost'
    value_amount decimal(10,2),
    
    -- Source Data
    source text DEFAULT 'manual', -- 'scraped', 'survey', 'csv'
    enrichment_data jsonb DEFAULT '{}',
    
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- CAMPAIGNS (Automation)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id uuid REFERENCES public.organizations(id) NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    type text DEFAULT 'email', -- 'email', 'whatsapp'
    config jsonb DEFAULT '{}', -- Templates, Schedule
    stats jsonb DEFAULT '{"sent": 0, "opened": 0, "clicked": 0}',
    created_at timestamp DEFAULT now()
);

-- ========================================================
-- 3. AUTOMATION & SECURITY (RLS)
-- ========================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for MVP)

-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organization Members can view their Organization
CREATE POLICY "Members view org" ON organizations
    FOR SELECT USING (
        id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Contacts Visibility
CREATE POLICY "Members view contacts" ON contacts
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Members insert contacts" ON contacts
    FOR INSERT WITH CHECK (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Members update contacts" ON contacts
    FOR UPDATE USING (
        org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    );

-- Triggers for User Creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new signups (Safety check if exists)
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();
