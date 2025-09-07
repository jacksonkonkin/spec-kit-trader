-- T011: Portfolios table migration
-- Creates the portfolios table for recording student investments

CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL REFERENCES stock_prices(symbol),
    purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price > 0),
    shares INTEGER NOT NULL CHECK (shares > 0),
    initial_value DECIMAL(10,2) NOT NULL DEFAULT 100000 CHECK (initial_value = 100000),
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stock_symbol ON portfolios(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_purchase_date ON portfolios(purchase_date);

-- Function to validate portfolio creation
CREATE OR REPLACE FUNCTION validate_portfolio_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate user doesn't already have a portfolio
    IF EXISTS (SELECT 1 FROM portfolios WHERE user_id = NEW.user_id AND id != NEW.id) THEN
        RAISE EXCEPTION 'User already has a portfolio';
    END IF;
    
    -- Validate stock exists in stock_prices
    IF NOT EXISTS (SELECT 1 FROM stock_prices WHERE symbol = NEW.stock_symbol) THEN
        RAISE EXCEPTION 'Invalid stock symbol: %', NEW.stock_symbol;
    END IF;
    
    -- Validate that user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create portfolio';
    END IF;
    
    -- Ensure the user_id matches the authenticated user
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot create portfolio for another user';
    END IF;
    
    -- Validate that shares * purchase_price approximately equals initial_value
    -- Allow for small rounding differences
    IF ABS((NEW.shares * NEW.purchase_price) - NEW.initial_value) > 1.00 THEN
        RAISE EXCEPTION 'Investment must use full initial value of $100,000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent portfolio modification
CREATE OR REPLACE FUNCTION prevent_portfolio_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Portfolios cannot be modified after creation';
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER validate_portfolio_creation
    BEFORE INSERT ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION validate_portfolio_creation();

CREATE TRIGGER no_portfolio_updates
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION prevent_portfolio_modification();

-- Function to calculate portfolio performance
CREATE OR REPLACE FUNCTION get_portfolio_performance(portfolio_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    stock_symbol VARCHAR(10),
    company_name VARCHAR(255),
    purchase_price DECIMAL(10,2),
    shares INTEGER,
    initial_value DECIMAL(10,2),
    current_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    total_return DECIMAL(10,2),
    return_percentage DECIMAL(5,2),
    purchase_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.stock_symbol,
        sp.company_name,
        p.purchase_price,
        p.shares,
        p.initial_value,
        sp.current_price,
        (p.shares * sp.current_price) as current_value,
        ((p.shares * sp.current_price) - p.initial_value) as total_return,
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) as return_percentage,
        p.purchase_date
    FROM portfolios p
    JOIN stock_prices sp ON p.stock_symbol = sp.symbol
    WHERE p.user_id = portfolio_user_id;
END;
$$ LANGUAGE plpgsql;