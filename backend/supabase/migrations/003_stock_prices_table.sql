-- T010: Stock prices table migration
-- Creates the stock_prices table for caching TSX stock data

CREATE TABLE IF NOT EXISTS stock_prices (
    symbol VARCHAR(10) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL CHECK (current_price > 0),
    previous_close DECIMAL(10,2) NULL,
    day_change DECIMAL(10,2) NULL,
    day_change_percent DECIMAL(5,2) NULL,
    market_status VARCHAR(20) DEFAULT 'closed',
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE stock_prices
ADD CONSTRAINT check_symbol_format
CHECK (symbol ~ '^[A-Z]+\.TO$');

ALTER TABLE stock_prices
ADD CONSTRAINT check_company_name_not_empty
CHECK (trim(company_name) != '');

ALTER TABLE stock_prices
ADD CONSTRAINT check_market_status
CHECK (market_status IN ('open', 'closed', 'pre-market', 'after-hours'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_last_updated ON stock_prices(last_updated);
CREATE INDEX IF NOT EXISTS idx_stock_prices_market_status ON stock_prices(market_status);
CREATE INDEX IF NOT EXISTS idx_stock_prices_company_name ON stock_prices(company_name);

-- Function to check if stock price needs update (15 minute TTL)
CREATE OR REPLACE FUNCTION should_update_stock_price(stock_symbol TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    last_update TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT last_updated INTO last_update
    FROM stock_prices
    WHERE symbol = stock_symbol;
    
    -- Update if never updated or older than 15 minutes
    RETURN last_update IS NULL OR 
           last_update < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to get stock price with staleness check
CREATE OR REPLACE FUNCTION get_current_stock_price(stock_symbol TEXT)
RETURNS TABLE(
    symbol VARCHAR(10),
    company_name VARCHAR(255),
    current_price DECIMAL(10,2),
    previous_close DECIMAL(10,2),
    day_change DECIMAL(10,2),
    day_change_percent DECIMAL(5,2),
    market_status VARCHAR(20),
    last_updated TIMESTAMP WITH TIME ZONE,
    is_stale BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.symbol,
        sp.company_name,
        sp.current_price,
        sp.previous_close,
        sp.day_change,
        sp.day_change_percent,
        sp.market_status,
        sp.last_updated,
        (sp.last_updated < NOW() - INTERVAL '15 minutes') as is_stale
    FROM stock_prices sp
    WHERE sp.symbol = stock_symbol;
END;
$$ LANGUAGE plpgsql;