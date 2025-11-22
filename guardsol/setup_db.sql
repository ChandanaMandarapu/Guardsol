-- 1. Create Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES scam_reports(id),
    disputer_address TEXT NOT NULL,
    reason TEXT NOT NULL,
    evidence_link TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create User Reputation Table
CREATE TABLE IF NOT EXISTS user_reputation (
    wallet_address TEXT PRIMARY KEY,
    reputation_score INTEGER DEFAULT 0,
    total_reports INTEGER DEFAULT 0,
    verified_reports INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add Dispute Columns to Scam Reports (Optional, for backward compatibility/fallback)
ALTER TABLE scam_reports 
ADD COLUMN IF NOT EXISTS disputed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
ADD COLUMN IF NOT EXISTS dispute_evidence TEXT;

-- 4. Enable Row Level Security (RLS) - Recommended
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public Read, Authenticated Insert)
-- Disputes
CREATE POLICY "Public disputes are viewable by everyone" 
ON disputes FOR SELECT USING (true);

CREATE POLICY "Users can insert disputes" 
ON disputes FOR INSERT WITH CHECK (true);

-- User Reputation
CREATE POLICY "Public reputation is viewable by everyone" 
ON user_reputation FOR SELECT USING (true);

-- (Optional) Trigger to update reputation automatically
-- This is advanced, but good to have. For now, we handle it in code.
