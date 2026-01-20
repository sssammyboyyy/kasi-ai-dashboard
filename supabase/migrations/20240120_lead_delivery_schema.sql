-- Kasi AI Lead Delivery Schema
-- Run this migration in Supabase SQL Editor

-- ============================================
-- LEADS TABLE
-- ============================================
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

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_leads_org_status ON public.leads(org_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Targeting
    target_industries TEXT[],
    target_locations TEXT[],
    scrape_schedule TEXT, -- Cron expression
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    leads_collected INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
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

-- Index for notification tracking
CREATE INDEX IF NOT EXISTS idx_notifications_lead ON public.notifications(lead_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Leads: Users can only see leads for their organization
CREATE POLICY "Users can view their org leads" ON public.leads
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert leads for their org" ON public.leads
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their org leads" ON public.leads
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Campaigns: Similar org-based access
CREATE POLICY "Users can manage their org campaigns" ON public.campaigns
    FOR ALL USING (
        org_id IN (
            SELECT org_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Notifications: Access through lead ownership
CREATE POLICY "Users can view their lead notifications" ON public.notifications
    FOR SELECT USING (
        lead_id IN (
            SELECT id FROM public.leads WHERE org_id IN (
                SELECT org_id FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get lead stats
CREATE OR REPLACE FUNCTION get_lead_stats(org_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'new', COUNT(*) FILTER (WHERE status = 'new'),
        'contacted', COUNT(*) FILTER (WHERE status = 'contacted'),
        'qualified', COUNT(*) FILTER (WHERE status = 'qualified'),
        'converted', COUNT(*) FILTER (WHERE status = 'converted'),
        'avg_score', ROUND(AVG(score)::numeric, 1),
        'today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)
    ) INTO result
    FROM public.leads
    WHERE org_id = org_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
