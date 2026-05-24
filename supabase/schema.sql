-- Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    role VARCHAR(100),
    team_size VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Audits Table
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    team_size INTEGER NOT NULL,
    primary_use_case VARCHAR(50) NOT NULL,
    total_current_spend DECIMAL(12, 2) NOT NULL,
    total_recommended_spend DECIMAL(12, 2) NOT NULL,
    total_monthly_savings DECIMAL(12, 2) NOT NULL,
    total_annual_savings DECIMAL(12, 2) NOT NULL,
    custom_summary TEXT,
    share_slug VARCHAR(100) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Audit Items Table
CREATE TABLE IF NOT EXISTS audit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    tool_id VARCHAR(50) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    current_plan_id VARCHAR(100) NOT NULL,
    current_plan_name VARCHAR(100) NOT NULL,
    current_seats INTEGER NOT NULL,
    current_spend DECIMAL(12, 2) NOT NULL,
    recommended_plan_id VARCHAR(100) NOT NULL,
    recommended_plan_name VARCHAR(100) NOT NULL,
    recommended_seats INTEGER NOT NULL,
    recommended_spend DECIMAL(12, 2) NOT NULL,
    savings DECIMAL(12, 2) NOT NULL,
    action VARCHAR(50) NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_audits_share_slug ON audits(share_slug);
CREATE INDEX IF NOT EXISTS idx_audits_lead_id ON audits(lead_id);
CREATE INDEX IF NOT EXISTS idx_audit_items_audit_id ON audit_items(audit_id);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_items ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Leads: Allow insert from anyone (anonymous submission), but only authenticated or system (Service Role) can read/update.
CREATE POLICY "Allow anonymous lead inserts" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role read" ON leads
    FOR SELECT USING (true);

-- Audits: Anyone can insert audits, anyone can read public audits (for shared reports).
CREATE POLICY "Allow anonymous audit inserts" ON audits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public audit reads" ON audits
    FOR SELECT USING (is_public = true);

-- Audit Items: Anyone can insert audit items, anyone can read if parent audit is public.
CREATE POLICY "Allow anonymous audit item inserts" ON audit_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public audit item reads" ON audit_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM audits 
            WHERE audits.id = audit_items.audit_id AND audits.is_public = true
        )
    );
