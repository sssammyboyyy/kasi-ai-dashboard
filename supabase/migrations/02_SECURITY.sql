-- PART 2: SECURITY
-- Run this script ONLY after Part 1 is successful.

-- 1. Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Clean old policies
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their org leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads for their org" ON public.leads;
DROP POLICY IF EXISTS "Users can update their org leads" ON public.leads;
DROP POLICY IF EXISTS "Users can manage their org campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view their lead notifications" ON public.notifications;

-- 3. Create New Policies

-- Organizations
CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT TO authenticated
    USING ( id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING ( id = (SELECT auth.uid()) );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ( id = (SELECT auth.uid()) )
    WITH CHECK ( id = (SELECT auth.uid()) );

-- Leads
CREATE POLICY "Users can view their org leads" ON public.leads
    FOR SELECT TO authenticated
    USING ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can insert leads for their org" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

CREATE POLICY "Users can update their org leads" ON public.leads
    FOR UPDATE TO authenticated
    USING ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) )
    WITH CHECK ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

-- Campaigns
CREATE POLICY "Users can manage their org campaigns" ON public.campaigns
    FOR ALL TO authenticated
    USING ( org_id IN (SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())) );

-- Notifications
CREATE POLICY "Users can view their lead notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (
        lead_id IN (
            SELECT id FROM public.leads WHERE org_id IN (
                SELECT org_id FROM public.profiles WHERE id = (SELECT auth.uid())
            )
        )
    );

-- 4. Create Functions

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get Lead Stats
CREATE OR REPLACE FUNCTION get_lead_stats(org_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND org_id = org_uuid) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT json_build_object(
        'total', COUNT(*),
        'new', COUNT(*) FILTER (WHERE status = 'new'),
        'today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)
    ) INTO result
    FROM public.leads
    WHERE org_id = org_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION get_lead_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_lead_stats(uuid) TO authenticated;

-- Handle New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
