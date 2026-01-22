-- ============================================================
-- KASI AI: MASTER SCHEMA (v2 - The Compounding Engine)
-- ============================================================
-- Run this in Supabase SQL Editor to create all tables.

-- 1. THE ASSET (Leads) -> Managed by The Swarm & The Core
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    website TEXT,
    email TEXT UNIQUE, -- The Gold (Unique for Upsert)
    phone TEXT,
    niche TEXT, -- e.g. "Commercial Cleaning"
    location TEXT,
    
    -- Base Intelligence (Calculated on Ingest by The Core)
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    score_reason TEXT, -- Why they got this score
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'enriched', 'contacted', 'replied', 'converted', 'lost')),
    
    -- Flywheel Intelligence (Updated by Outbound Feedback)
    engagement_score INTEGER DEFAULT 0,
    
    -- Revenue (The Endgame)
    deal_value_zar NUMERIC DEFAULT 0,
    converted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Raw scrape data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. THE ACTION (Outbound Logs) -> Managed by The Rainmaker
-- ============================================================
CREATE TABLE IF NOT EXISTS outbound_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    campaign_id TEXT NOT NULL,
    channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp', 'linkedin')),
    generated_copy TEXT, -- AI written message
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'opened', 'clicked', 'replied')),
    
    -- Flywheel Timestamps
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    
    metadata JSONB DEFAULT '{}'
);

-- 3. THE PULSE (System Metrics) -> Managed by The Auditor
-- ============================================================
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL, -- 'swarm', 'outbound', 'auditor', 'core'
    metric_type TEXT NOT NULL, -- 'leads_scraped', 'api_cost_usd', 'error_count', 'emails_sent'
    value NUMERIC NOT NULL,
    context JSONB, -- Extra details (e.g., { error_message: "..." })
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES FOR SPEED
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_lead ON outbound_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_metrics_agent ON system_metrics(agent_name, recorded_at DESC);

-- 5. ENABLE RLS (For Security)
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- NOTE: Policies can be added later. For now, the Service Role Key bypasses RLS.
