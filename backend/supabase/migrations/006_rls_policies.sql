-- T013: RLS policies migration
-- Enables Row Level Security and creates security policies for all tables

-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
-- Users can view all portfolios (for leaderboard functionality)
DROP POLICY IF EXISTS "Users can view all portfolios" ON portfolios;
CREATE POLICY "Users can view all portfolios"
    ON portfolios FOR SELECT
    USING (true);

-- Users can only create their own portfolio
DROP POLICY IF EXISTS "Users can create own portfolio" ON portfolios;
CREATE POLICY "Users can create own portfolio"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Portfolios cannot be updated (immutable after creation)
DROP POLICY IF EXISTS "Portfolios cannot be updated" ON portfolios;
CREATE POLICY "Portfolios cannot be updated"
    ON portfolios FOR UPDATE
    USING (false);

-- Portfolios cannot be deleted
DROP POLICY IF EXISTS "Portfolios cannot be deleted" ON portfolios;
CREATE POLICY "Portfolios cannot be deleted"
    ON portfolios FOR DELETE
    USING (false);

-- Class membership policies
-- Users can view all class memberships (for leaderboard functionality)
DROP POLICY IF EXISTS "Users can view all class memberships" ON class_memberships;
CREATE POLICY "Users can view all class memberships"
    ON class_memberships FOR SELECT
    USING (true);

-- Users can only create their own class memberships
DROP POLICY IF EXISTS "Users can join classes" ON class_memberships;
CREATE POLICY "Users can join classes"
    ON class_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Class memberships cannot be updated
DROP POLICY IF EXISTS "Class memberships cannot be updated" ON class_memberships;
CREATE POLICY "Class memberships cannot be updated"
    ON class_memberships FOR UPDATE
    USING (false);

-- Class memberships cannot be deleted
DROP POLICY IF EXISTS "Class memberships cannot be deleted" ON class_memberships;
CREATE POLICY "Class memberships cannot be deleted"
    ON class_memberships FOR DELETE
    USING (false);

-- Classes policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "Everyone can view classes" ON classes;
CREATE POLICY "Everyone can view classes"
    ON classes FOR SELECT
    USING (true);

-- Only service role can manage classes
DROP POLICY IF EXISTS "Service role can manage classes" ON classes;
CREATE POLICY "Service role can manage classes"
    ON classes FOR ALL
    USING (auth.role() = 'service_role');

-- Stock prices policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "Everyone can view stock prices" ON stock_prices;
CREATE POLICY "Everyone can view stock prices"
    ON stock_prices FOR SELECT
    USING (true);

-- Only service role can manage stock prices
DROP POLICY IF EXISTS "Service role can manage stock prices" ON stock_prices;
CREATE POLICY "Service role can manage stock prices"
    ON stock_prices FOR ALL
    USING (auth.role() = 'service_role');

-- Additional security functions
-- Function to check if user owns portfolio
CREATE OR REPLACE FUNCTION user_owns_portfolio(portfolio_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM portfolios
        WHERE id = portfolio_uuid
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is member of class
CREATE OR REPLACE FUNCTION user_is_class_member(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM class_memberships
        WHERE class_id = class_uuid
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can view class details
CREATE OR REPLACE FUNCTION user_can_view_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- All authenticated users can view classes
    -- but in the future we might want to restrict this
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;