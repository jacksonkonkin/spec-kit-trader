# Research Findings: Stock Trading Learning Platform

**Feature**: Stock Trading Learning Platform  
**Date**: 2025-09-07  
**Phase**: 0 - Research & Analysis

## Executive Summary
Research conducted to resolve technical unknowns for implementing a classroom stock trading simulator with TSX data integration, Supabase backend, and real-time leaderboard features.

## Research Areas

### 1. TSX Data API Selection

**Decision**: Alpha Vantage API with Yahoo Finance fallback  
**Rationale**: 
- Alpha Vantage provides free tier with 500 API calls/day
- Covers all TSX stocks with `.TO` suffix
- 15-minute delayed data acceptable for educational use
- Yahoo Finance as backup for redundancy

**Alternatives Considered**:
- TMX Money API: No public API available
- IEX Cloud: Limited TSX coverage
- Polygon.io: Expensive for TSX data
- Web scraping: Unreliable and against ToS

**Implementation Notes**:
- Cache prices in Supabase to minimize API calls
- Batch update all stocks every 15 minutes during market hours
- Use `.TO` suffix for TSX symbols (e.g., `SHOP.TO`)

### 2. Supabase Authentication for Classroom Use

**Decision**: Email/password auth with magic link option  
**Rationale**:
- Simple for students without SSO complexity
- Magic links reduce password reset issues
- Supabase handles email verification
- Row Level Security (RLS) prevents data tampering

**Alternatives Considered**:
- School SSO: Too complex for MVP
- Social auth: Privacy concerns in educational setting
- Custom auth: Unnecessary with Supabase capabilities

**Implementation Notes**:
- Enable email confirmation in Supabase dashboard
- Set up RLS policies for portfolio protection
- Use auth.users table with profile extension
- Implement class invite codes for enrollment

### 3. Real-time Leaderboard Implementation

**Decision**: Supabase Realtime with materialized view  
**Rationale**:
- Built-in WebSocket support in Supabase
- Materialized view for performance
- Automatic updates on portfolio changes
- Scales to 50+ concurrent users easily

**Alternatives Considered**:
- Polling: Inefficient and higher latency
- Server-Sent Events: More complex setup
- Firebase: Additional service dependency

**Implementation Notes**:
```sql
-- Materialized view for leaderboard
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.email,
  p.stock_symbol,
  p.purchase_price,
  p.shares,
  s.current_price,
  ((s.current_price - p.purchase_price) * p.shares) as profit,
  ((s.current_price - p.purchase_price) / p.purchase_price * 100) as return_percentage
FROM portfolios p
JOIN auth.users u ON p.user_id = u.id
JOIN stock_prices s ON p.stock_symbol = s.symbol
ORDER BY return_percentage DESC;

-- Refresh trigger on stock price updates
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4. Stock Price Caching Strategy

**Decision**: PostgreSQL table with 15-minute TTL  
**Rationale**:
- Reduces API calls dramatically
- Consistent data for all users
- Simple invalidation logic
- Handles market hours automatically

**Alternatives Considered**:
- Redis cache: Overkill for this scale
- In-memory cache: Lost on restart
- No caching: Would exceed API limits

**Implementation Notes**:
```sql
-- Stock prices table with TTL
CREATE TABLE stock_prices (
  symbol TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  previous_close DECIMAL(10,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  market_status TEXT DEFAULT 'closed'
);

-- Background job for price updates
CREATE OR REPLACE FUNCTION update_stock_prices()
RETURNS void AS $$
DECLARE
  stock RECORD;
BEGIN
  FOR stock IN SELECT DISTINCT stock_symbol FROM portfolios
  LOOP
    -- Call edge function to fetch from Alpha Vantage
    PERFORM update_single_stock_price(stock.stock_symbol);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 5. Market Hours Handling

**Decision**: Show last closing price with "Market Closed" indicator  
**Rationale**:
- Students can view portfolios anytime
- Clear indication of data freshness
- TSX hours: 9:30 AM - 4:00 PM ET
- Handles weekends and holidays gracefully

**Implementation Notes**:
- Store market status in stock_prices table
- Display timestamp of last update
- Color code for open/closed status
- Countdown timer to next market open

### 6. One-Time Investment Enforcement

**Decision**: Database constraint with UI state management  
**Rationale**:
- PostgreSQL CHECK constraint ensures single investment
- Frontend disables invest button after purchase
- Clear messaging about one-time nature
- No ability to sell or change

**Implementation Notes**:
```sql
-- Ensure one investment per user
ALTER TABLE portfolios 
ADD CONSTRAINT one_investment_per_user UNIQUE (user_id);

-- Trigger to prevent updates
CREATE OR REPLACE FUNCTION prevent_portfolio_update()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Portfolio cannot be modified after investment';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7. Mid-Semester Student Handling

**Decision**: Full $100,000 at current market prices  
**Rationale**:
- Fair opportunity for late joiners
- Maintains competitive balance
- Simple rule to explain
- Tracks join date for context

**Implementation Notes**:
- Store join_date in class_membership
- Display join date on leaderboard
- Calculate returns from individual purchase date
- No retroactive pricing advantage

## Technology Stack Confirmation

### Frontend
- **React 18.2+**: Latest stable version
- **Vite**: Fast build tool and dev server
- **Material-UI v5**: Component library for rapid development
- **Recharts**: For portfolio performance charts
- **@supabase/supabase-js**: Official SDK

### Backend (Supabase)
- **PostgreSQL 15**: Latest Supabase version
- **PostgREST**: Auto-generated APIs
- **Realtime**: WebSocket subscriptions
- **Auth**: Built-in authentication
- **Edge Functions**: For API integrations

### External Services
- **Alpha Vantage API**: Primary stock data
- **Yahoo Finance**: Backup data source
- **Vercel**: Frontend hosting
- **GitHub Actions**: CI/CD pipeline

## Security Considerations

### Data Protection
- Row Level Security (RLS) on all tables
- Users can only modify own portfolio
- Read-only access to others' data
- API keys in environment variables

### Rate Limiting
- Supabase: 1000 requests/hour included
- Alpha Vantage: 500 requests/day (free tier)
- Implement client-side throttling
- Server-side request queuing

## Performance Targets

### Metrics
- Initial page load: <2 seconds
- Leaderboard update: <500ms
- Stock price refresh: Every 15 minutes
- Concurrent users: 50+

### Optimization Strategies
- Materialized views for complex queries
- Index on frequently queried columns
- Lazy loading for non-critical components
- Progressive Web App for offline viewing

## Deployment Strategy

### Development
1. Local Supabase instance for development
2. Seed data with fake students and stocks
3. Mock API responses for testing

### Staging
1. Supabase free tier project
2. Vercel preview deployments
3. Limited API calls for testing

### Production
1. Supabase Pro tier if scaling needed
2. Vercel production deployment
3. Custom domain configuration
4. Monitoring and alerting setup

## Resolved Clarifications

From the original spec, the following have been resolved:

1. **User limit**: 30-50 students typical, system can handle more
2. **Authentication**: Email/password with magic links
3. **Data retention**: One semester + 30 days archive
4. **Semester end**: Archive and prepare for reset
5. **Teacher roles**: Future enhancement (not MVP)
6. **Price updates**: Every 15 minutes during market hours
7. **Market closed**: Show last price with status indicator
8. **Investment changes**: Not allowed - truly one-time
9. **Mid-semester joins**: Full $100k at current prices

## Next Steps

With research complete, ready to proceed to Phase 1:
- Design data model based on findings
- Create API contracts for identified endpoints
- Generate test scenarios from requirements
- Build quickstart guide for validation

---
*Research completed: 2025-09-07*