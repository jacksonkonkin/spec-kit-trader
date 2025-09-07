-- T014: Views and triggers migration
-- Creates views for leaderboards and portfolio performance, plus additional triggers

-- Leaderboard view for class competitions
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    cm.class_id,
    u.id as user_id,
    u.email,
    p.stock_symbol,
    sp.company_name,
    p.purchase_price,
    p.shares,
    p.initial_value,
    sp.current_price,
    (p.shares * sp.current_price) as current_value,
    ((p.shares * sp.current_price) - p.initial_value) as total_return,
    (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) as return_percentage,
    p.purchase_date,
    cm.joined_at,
    RANK() OVER (PARTITION BY cm.class_id ORDER BY 
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value) DESC
    ) as rank
FROM class_memberships cm
JOIN auth.users u ON cm.user_id = u.id
LEFT JOIN portfolios p ON u.id = p.user_id
LEFT JOIN stock_prices sp ON p.stock_symbol = sp.symbol
WHERE p.id IS NOT NULL;

-- Portfolio performance view for individual tracking
CREATE OR REPLACE VIEW portfolio_performance_view AS
SELECT 
    p.user_id,
    p.stock_symbol,
    sp.company_name,
    p.purchase_price,
    p.shares,
    p.initial_value,
    sp.current_price,
    sp.previous_close,
    sp.day_change,
    sp.day_change_percent,
    (p.shares * sp.current_price) as current_value,
    ((p.shares * sp.current_price) - p.initial_value) as total_return,
    (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) as return_percentage,
    sp.market_status,
    sp.last_updated,
    p.purchase_date
FROM portfolios p
JOIN stock_prices sp ON p.stock_symbol = sp.symbol;

-- Class summary view for overview stats
CREATE OR REPLACE VIEW class_summary_view AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.invite_code,
    c.semester,
    c.start_date,
    c.end_date,
    c.is_active,
    COUNT(cm.id) as total_members,
    COUNT(p.id) as members_with_investments,
    AVG(CASE WHEN p.id IS NOT NULL THEN 
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) 
        ELSE NULL END
    ) as average_return_percentage,
    MAX(CASE WHEN p.id IS NOT NULL THEN 
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) 
        ELSE NULL END
    ) as best_return_percentage,
    MIN(CASE WHEN p.id IS NOT NULL THEN 
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) 
        ELSE NULL END
    ) as worst_return_percentage
FROM classes c
LEFT JOIN class_memberships cm ON c.id = cm.class_id
LEFT JOIN portfolios p ON cm.user_id = p.user_id
LEFT JOIN stock_prices sp ON p.stock_symbol = sp.symbol
GROUP BY c.id, c.name, c.invite_code, c.semester, c.start_date, c.end_date, c.is_active;

-- Stock popularity view to see which stocks are most invested in
CREATE OR REPLACE VIEW stock_popularity_view AS
SELECT 
    sp.symbol,
    sp.company_name,
    sp.current_price,
    sp.day_change,
    sp.day_change_percent,
    COUNT(p.id) as investment_count,
    SUM(p.shares) as total_shares_invested,
    SUM(p.initial_value) as total_value_invested,
    AVG((p.shares * sp.current_price) - p.initial_value) as average_return_amount,
    AVG(((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) as average_return_percentage
FROM stock_prices sp
LEFT JOIN portfolios p ON sp.symbol = p.stock_symbol
GROUP BY sp.symbol, sp.company_name, sp.current_price, sp.day_change, sp.day_change_percent
ORDER BY investment_count DESC NULLS LAST;

-- User portfolio summary view
CREATE OR REPLACE VIEW user_portfolio_summary_view AS
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created_at,
    CASE WHEN p.id IS NOT NULL THEN true ELSE false END as has_portfolio,
    p.stock_symbol,
    sp.company_name,
    p.purchase_price,
    p.shares,
    p.initial_value,
    sp.current_price,
    CASE WHEN p.id IS NOT NULL THEN (p.shares * sp.current_price) ELSE NULL END as current_value,
    CASE WHEN p.id IS NOT NULL THEN ((p.shares * sp.current_price) - p.initial_value) ELSE NULL END as total_return,
    CASE WHEN p.id IS NOT NULL THEN (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) ELSE NULL END as return_percentage,
    p.purchase_date,
    COUNT(cm.id) as class_memberships_count
FROM auth.users u
LEFT JOIN portfolios p ON u.id = p.user_id
LEFT JOIN stock_prices sp ON p.stock_symbol = sp.symbol
LEFT JOIN class_memberships cm ON u.id = cm.user_id
GROUP BY u.id, u.email, u.created_at, p.id, p.stock_symbol, sp.company_name, 
         p.purchase_price, p.shares, p.initial_value, sp.current_price, p.purchase_date;

-- Trigger to automatically deactivate classes past their end date
CREATE OR REPLACE FUNCTION auto_deactivate_expired_classes()
RETURNS TRIGGER AS $$
BEGIN
    -- This will run on any UPDATE to the classes table
    -- Check if any active classes have passed their end date
    UPDATE classes 
    SET is_active = false
    WHERE is_active = true 
    AND end_date < CURRENT_DATE;
    
    RETURN NULL; -- For AFTER triggers, the return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs daily to deactivate expired classes
-- Note: This is a simple approach. In production, you might want to use a scheduled job instead
CREATE OR REPLACE TRIGGER auto_deactivate_expired_classes_trigger
    AFTER INSERT OR UPDATE ON classes
    FOR EACH STATEMENT
    EXECUTE FUNCTION auto_deactivate_expired_classes();

-- Function to refresh materialized views (if we decide to use them later)
CREATE OR REPLACE FUNCTION refresh_performance_stats()
RETURNS void AS $$
BEGIN
    -- This function can be called periodically to update performance stats
    -- For now, it's just a placeholder since we're using regular views
    -- In the future, we might convert some views to materialized views for performance
    
    -- Example: REFRESH MATERIALIZED VIEW IF EXISTS leaderboard_materialized_view;
    
    -- Log the refresh (optional)
    RAISE NOTICE 'Performance stats refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock price last_updated timestamp
CREATE OR REPLACE FUNCTION update_stock_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_stock_price_timestamp_trigger
    BEFORE UPDATE ON stock_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_price_timestamp();