-- SCRIPT 0: SANITIZER (FIXED)
-- Only operates on tables that exist

-- 1. Disable RLS on existing tables
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Drop policies only if tables exist
DO $$ BEGIN
    -- Organizations policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
    END IF;
    
    -- Profiles policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    END IF;
    
    -- Leads policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        DROP POLICY IF EXISTS "Users can view their org leads" ON public.leads;
        DROP POLICY IF EXISTS "Users can insert leads for their org" ON public.leads;
        DROP POLICY IF EXISTS "Users can update their org leads" ON public.leads;
    END IF;
    
    -- Campaigns policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        DROP POLICY IF EXISTS "Users can manage their org campaigns" ON public.campaigns;
    END IF;
    
    -- Notifications policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DROP POLICY IF EXISTS "Users can view their lead notifications" ON public.notifications;
    END IF;
END $$;

-- 3. Drop indexes safely
DROP INDEX IF EXISTS idx_profiles_org_id;
DROP INDEX IF EXISTS idx_leads_org_status;

-- 4. Add org_id to profiles if missing
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
            -- First ensure organizations table exists
            CREATE TABLE IF NOT EXISTS public.organizations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                slug TEXT UNIQUE,
                plan TEXT DEFAULT 'free',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            -- Now add the column
            ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;
