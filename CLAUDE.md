# CLAUDE.md - Stock Trading Learning Platform

## Project Context
Educational stock trading simulator where students invest $100,000 virtual currency in Toronto Stock Exchange stocks and compete on a semester-long leaderboard.

## Tech Stack
- **Frontend**: React 18 + Vite + Material-UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **APIs**: Alpha Vantage (TSX data)
- **Deployment**: Vercel
- **Testing**: Jest + React Testing Library

## Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route pages
│   ├── services/      # API and business logic
│   └── hooks/         # Custom React hooks
backend/
└── supabase/
    ├── migrations/    # Database schema
    └── functions/     # Edge functions
```

## Key Features
1. One-time investment of $100,000 in single TSX stock
2. Real-time leaderboard for class competition
3. Portfolio tracking with live price updates
4. Class management with invite codes

## Database Schema
- `users` - Supabase auth.users
- `portfolios` - One per user, immutable after creation
- `stock_prices` - Cached TSX prices, 15-min updates
- `classes` - Semester groups
- `class_memberships` - User-class relationships

## API Patterns
```javascript
// Supabase client setup
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, anonKey)

// Example: Make investment
const { data, error } = await supabase
  .from('portfolios')
  .insert({ 
    stock_symbol: 'SHOP.TO',
    shares: calculateShares(100000, currentPrice)
  })
```

## Implementation Progress
**Total Tasks**: 95 | **Completed**: 0 | **Current Phase**: Setup & Infrastructure

### Phase Status
- ⏳ **Phase 3.1**: Setup & Infrastructure (T001-T007) - 0/7 complete
- ⏸️ **Phase 3.2**: Database Schema (T008-T015) - 0/8 complete
- ⏸️ **Phase 3.3**: TDD Tests (T016-T027) - 0/12 complete
- ⏸️ **Phase 3.4**: Core Services (T028-T045) - 0/18 complete
- ⏸️ **Phase 3.5**: Frontend Components (T046-T069) - 0/24 complete
- ⏸️ **Phase 3.6**: Routing & State (T070-T073) - 0/4 complete
- ⏸️ **Phase 3.7**: Integration (T074-T078) - 0/5 complete
- ⏸️ **Phase 3.8**: Polish & Optimization (T079-T088) - 0/10 complete
- ⏸️ **Phase 3.9**: Documentation & Deployment (T089-T095) - 0/7 complete

### Current Session Focus
**Next Tasks**: T001-T007 (Setup & Infrastructure)

### Last Completed Tasks
- None yet - ready to start implementation

### Environment Status
- [ ] Supabase project created
- [ ] React app initialized  
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Frontend dependencies installed

## Testing Requirements
- TDD: Write tests first
- Contract tests for API endpoints
- Integration tests for user flows
- Use real Supabase test instance

## Performance Goals
- Page load <2s
- Leaderboard update <500ms
- Support 50+ concurrent users

## Security Notes
- RLS policies on all tables
- Users can only create one portfolio
- Read-only access to others' data
- API keys in environment variables

## Common Commands
```bash
# Frontend
npm run dev          # Start development server
npm run test        # Run tests
npm run build       # Production build

# Supabase
supabase start      # Local development
supabase db push    # Apply migrations
supabase gen types  # Generate TypeScript types
```

## Session History
- **2025-09-07**: Created specification and implementation plan
- **2025-09-07**: Generated 95 tasks for MVP development
- **Next**: SESSION_1 - Setup & Infrastructure (T001-T007)

## Troubleshooting
- TSX symbols need `.TO` suffix
- Market hours: 9:30 AM - 4:00 PM ET
- One investment per user enforced by DB constraint
- Price updates every 15 minutes to respect API limits

---
*Last updated: 2025-09-07*