# Data Model: Stock Trading Learning Platform

**Feature**: Stock Trading Learning Platform  
**Date**: 2025-09-07  
**Phase**: 1 - Design & Contracts

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Portfolio : has
    User ||--o{ ClassMembership : belongs_to
    Class ||--o{ ClassMembership : contains
    Portfolio ||--|| StockPrice : references
    
    User {
        uuid id PK
        string email UK
        timestamp created_at
        timestamp email_confirmed_at
    }
    
    Portfolio {
        uuid id PK
        uuid user_id FK UK
        string stock_symbol FK
        decimal purchase_price
        integer shares
        decimal initial_value
        timestamp purchase_date
        timestamp created_at
    }
    
    StockPrice {
        string symbol PK
        string company_name
        decimal current_price
        decimal previous_close
        decimal day_change
        decimal day_change_percent
        string market_status
        timestamp last_updated
    }
    
    Class {
        uuid id PK
        string name
        string invite_code UK
        string semester
        date start_date
        date end_date
        boolean is_active
        timestamp created_at
    }
    
    ClassMembership {
        uuid id PK
        uuid class_id FK
        uuid user_id FK
        decimal starting_balance
        timestamp joined_at
    }
```

## Entity Definitions

### User
**Purpose**: Represents a student participant in the trading platform  
**Source**: Supabase auth.users table (extended)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique user identifier from auth.users |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Student email address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| email_confirmed_at | TIMESTAMP | NULL | Email verification timestamp |

**Business Rules**:
- Created automatically on signup via Supabase Auth
- Email must be verified before trading
- Cannot be deleted while portfolio exists

### Portfolio
**Purpose**: Records a student's one-time investment  
**Relationships**: Belongs to one User, references one StockPrice

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique portfolio identifier |
| user_id | UUID | FK, UNIQUE, NOT NULL | Reference to User |
| stock_symbol | VARCHAR(10) | FK, NOT NULL | TSX stock symbol (e.g., SHOP.TO) |
| purchase_price | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Price per share at purchase |
| shares | INTEGER | NOT NULL, CHECK > 0 | Number of shares purchased |
| initial_value | DECIMAL(10,2) | NOT NULL, DEFAULT 100000 | Starting balance ($100,000) |
| purchase_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | When investment was made |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Business Rules**:
- One portfolio per user (enforced by UNIQUE constraint on user_id)
- Cannot be updated after creation (trigger enforced)
- Initial value always $100,000
- All funds must be invested in single transaction

**Calculated Fields** (not stored):
- current_value = shares * current_price
- total_return = current_value - initial_value
- return_percentage = (total_return / initial_value) * 100

### StockPrice
**Purpose**: Caches current TSX stock prices  
**Relationships**: Referenced by Portfolio entries

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| symbol | VARCHAR(10) | PK, NOT NULL | TSX stock symbol with .TO suffix |
| company_name | VARCHAR(255) | NOT NULL | Full company name |
| current_price | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Latest stock price |
| previous_close | DECIMAL(10,2) | NULL | Previous day closing price |
| day_change | DECIMAL(10,2) | NULL | Price change from previous close |
| day_change_percent | DECIMAL(5,2) | NULL | Percentage change |
| market_status | VARCHAR(20) | DEFAULT 'closed' | 'open', 'closed', 'pre-market', 'after-hours' |
| last_updated | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last API fetch time |

**Business Rules**:
- Updated every 15 minutes during market hours
- Retains last known price when market closed
- Only stores stocks that students have invested in
- TTL of 15 minutes for cache invalidation

### Class
**Purpose**: Groups students for semester-long competition  
**Relationships**: Has many ClassMemberships

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique class identifier |
| name | VARCHAR(255) | NOT NULL | Class name (e.g., "FIN 101 Fall 2025") |
| invite_code | VARCHAR(20) | UNIQUE, NOT NULL | Code for students to join |
| semester | VARCHAR(50) | NOT NULL | Semester identifier |
| start_date | DATE | NOT NULL | Competition start date |
| end_date | DATE | NOT NULL | Competition end date |
| is_active | BOOLEAN | DEFAULT true | Whether class is currently running |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Class creation time |

**Business Rules**:
- Invite code generated automatically (6 alphanumeric characters)
- Class becomes inactive after end_date
- Students can only join active classes
- Historical data preserved after class ends

### ClassMembership
**Purpose**: Links students to their class  
**Relationships**: Belongs to one User and one Class

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique membership identifier |
| class_id | UUID | FK, NOT NULL | Reference to Class |
| user_id | UUID | FK, NOT NULL | Reference to User |
| starting_balance | DECIMAL(10,2) | DEFAULT 100000 | Initial virtual money |
| joined_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When student joined class |

**Business Rules**:
- Unique constraint on (class_id, user_id) - one membership per class
- Starting balance always $100,000
- Cannot leave class once joined
- Preserved for historical records

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_portfolio_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolio_stock_symbol ON portfolios(stock_symbol);
CREATE INDEX idx_class_membership_class_id ON class_memberships(class_id);
CREATE INDEX idx_class_membership_user_id ON class_memberships(user_id);
CREATE INDEX idx_class_invite_code ON classes(invite_code);
CREATE INDEX idx_stock_prices_last_updated ON stock_prices(last_updated);

-- Composite indexes for common queries
CREATE INDEX idx_class_membership_composite ON class_memberships(class_id, user_id);
```

## Views

### leaderboard_view
```sql
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
```

### portfolio_performance_view
```sql
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
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
CREATE POLICY "Users can view all portfolios"
    ON portfolios FOR SELECT
    USING (true);

CREATE POLICY "Users can create own portfolio"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Portfolios cannot be updated"
    ON portfolios FOR UPDATE
    USING (false);

CREATE POLICY "Portfolios cannot be deleted"
    ON portfolios FOR DELETE
    USING (false);

-- Class membership policies
CREATE POLICY "Users can view all class memberships"
    ON class_memberships FOR SELECT
    USING (true);

CREATE POLICY "Users can join classes"
    ON class_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Stock prices policies (read-only for all)
CREATE POLICY "Everyone can view stock prices"
    ON stock_prices FOR SELECT
    USING (true);

-- Classes policies (read-only for all)
CREATE POLICY "Everyone can view classes"
    ON classes FOR SELECT
    USING (true);
```

## Triggers and Functions

### Prevent Portfolio Modification
```sql
CREATE OR REPLACE FUNCTION prevent_portfolio_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Portfolios cannot be modified after creation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_portfolio_updates
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION prevent_portfolio_modification();
```

### Auto-create Portfolio Entry
```sql
CREATE OR REPLACE FUNCTION create_portfolio_on_investment()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate user doesn't already have a portfolio
    IF EXISTS (SELECT 1 FROM portfolios WHERE user_id = NEW.user_id) THEN
        RAISE EXCEPTION 'User already has a portfolio';
    END IF;
    
    -- Validate stock exists in stock_prices
    IF NOT EXISTS (SELECT 1 FROM stock_prices WHERE symbol = NEW.stock_symbol) THEN
        RAISE EXCEPTION 'Invalid stock symbol';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_portfolio_creation
    BEFORE INSERT ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION create_portfolio_on_investment();
```

### Update Stock Prices Cache
```sql
CREATE OR REPLACE FUNCTION should_update_stock_price(symbol TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    last_update TIMESTAMP;
BEGIN
    SELECT last_updated INTO last_update
    FROM stock_prices
    WHERE stock_prices.symbol = should_update_stock_price.symbol;
    
    -- Update if never updated or older than 15 minutes
    RETURN last_update IS NULL OR 
           last_update < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql;
```

## Migration Order

1. Create tables in order: Users (via Supabase Auth), Classes, StockPrices
2. Create ClassMemberships (depends on Users and Classes)
3. Create Portfolios (depends on Users and StockPrices)
4. Create indexes
5. Create views
6. Enable RLS and create policies
7. Create triggers and functions

## Validation Rules Summary

- Email format validation (handled by Supabase Auth)
- Stock symbol must exist in stock_prices table
- Purchase price and shares must be positive
- One portfolio per user
- User must belong to a class to invest
- Class invite code must be valid
- Dates must be logical (start_date < end_date)

---
*Data model defined: 2025-09-07*