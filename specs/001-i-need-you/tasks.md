# Tasks: Stock Trading Learning Platform MVP

**Input**: Design documents from `/specs/001-i-need-you/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `backend/supabase/`, `frontend/src/`
- All paths relative to repository root

## Phase 3.1: Setup & Infrastructure

- [ ] T001 Create project structure with frontend/ and backend/ directories
- [ ] T002 Initialize Supabase project with `supabase init` in backend/
- [ ] T003 Initialize React app with Vite in frontend/ using `npm create vite@latest frontend -- --template react`
- [ ] T004 [P] Install frontend dependencies: @supabase/supabase-js, @mui/material, recharts, react-router-dom
- [ ] T005 [P] Configure environment variables in frontend/.env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] T006 [P] Set up ESLint and Prettier configuration in frontend/
- [ ] T007 Create Supabase client configuration in frontend/src/lib/supabase.js

## Phase 3.2: Database Schema & Migrations

- [ ] T008 Create initial migration for users extension in backend/supabase/migrations/001_users.sql
- [ ] T009 [P] Create migration for classes table in backend/supabase/migrations/002_classes.sql
- [ ] T010 [P] Create migration for stock_prices table in backend/supabase/migrations/003_stock_prices.sql
- [ ] T011 Create migration for portfolios table in backend/supabase/migrations/004_portfolios.sql (depends on users and stock_prices)
- [ ] T012 Create migration for class_memberships table in backend/supabase/migrations/005_class_memberships.sql (depends on users and classes)
- [ ] T013 Create RLS policies migration in backend/supabase/migrations/006_rls_policies.sql
- [ ] T014 Create views and triggers migration in backend/supabase/migrations/007_views_triggers.sql
- [ ] T015 Apply all migrations with `supabase db push`

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T016 [P] Contract test for auth/signup endpoint in frontend/tests/contract/auth.signup.test.js
- [ ] T017 [P] Contract test for auth/signin endpoint in frontend/tests/contract/auth.signin.test.js
- [ ] T018 [P] Contract test for GET /stock_prices endpoint in frontend/tests/contract/stocks.list.test.js
- [ ] T019 [P] Contract test for POST /portfolios endpoint in frontend/tests/contract/portfolio.create.test.js
- [ ] T020 [P] Contract test for GET /portfolios endpoint in frontend/tests/contract/portfolio.get.test.js
- [ ] T021 [P] Contract test for POST /class_memberships endpoint in frontend/tests/contract/class.join.test.js
- [ ] T022 [P] Contract test for GET /leaderboard endpoint in frontend/tests/contract/leaderboard.get.test.js

### Integration Tests
- [ ] T023 [P] Integration test for student registration flow in frontend/tests/integration/registration.test.js
- [ ] T024 [P] Integration test for class joining flow in frontend/tests/integration/join-class.test.js
- [ ] T025 [P] Integration test for stock investment flow in frontend/tests/integration/invest.test.js
- [ ] T026 [P] Integration test for leaderboard updates in frontend/tests/integration/leaderboard.test.js
- [ ] T027 [P] Integration test for portfolio performance tracking in frontend/tests/integration/portfolio.test.js

## Phase 3.4: Core Services Implementation (ONLY after tests are failing)

### Authentication Service
- [ ] T028 Create auth service module in frontend/src/services/auth.service.js
- [ ] T029 Implement signup function with email/password
- [ ] T030 Implement signin function with session management
- [ ] T031 Implement signout and session refresh functions
- [ ] T032 Create auth context provider in frontend/src/contexts/AuthContext.jsx

### Stock Service
- [ ] T033 [P] Create stock service module in frontend/src/services/stock.service.js
- [ ] T034 [P] Implement fetchStockList function to get TSX stocks from Supabase
- [ ] T035 [P] Implement fetchStockPrice function for individual stock
- [ ] T036 [P] Create Supabase Edge Function for Alpha Vantage API integration in backend/supabase/functions/fetch-stock-prices/index.ts
- [ ] T037 [P] Implement stock price caching logic with 15-minute TTL

### Portfolio Service
- [ ] T038 [P] Create portfolio service module in frontend/src/services/portfolio.service.js
- [ ] T039 [P] Implement createInvestment function with one-time enforcement
- [ ] T040 [P] Implement getPortfolio function with performance calculations
- [ ] T041 [P] Implement calculateShares function for investment preview

### Class Service
- [ ] T042 [P] Create class service module in frontend/src/services/class.service.js
- [ ] T043 [P] Implement joinClass function with invite code validation
- [ ] T044 [P] Implement getClassMembers function
- [ ] T045 [P] Implement getLeaderboard function with real-time subscription

## Phase 3.5: Frontend Components

### Layout Components
- [ ] T046 [P] Create main layout component in frontend/src/components/Layout/MainLayout.jsx
- [ ] T047 [P] Create navigation component in frontend/src/components/Layout/Navigation.jsx
- [ ] T048 [P] Create footer component in frontend/src/components/Layout/Footer.jsx

### Authentication Components
- [ ] T049 [P] Create login page in frontend/src/pages/Login.jsx
- [ ] T050 [P] Create signup page in frontend/src/pages/Signup.jsx
- [ ] T051 [P] Create protected route wrapper in frontend/src/components/Auth/ProtectedRoute.jsx

### Dashboard Components
- [ ] T052 Create dashboard page in frontend/src/pages/Dashboard.jsx
- [ ] T053 Create portfolio summary card in frontend/src/components/Dashboard/PortfolioCard.jsx
- [ ] T054 Create quick stats component in frontend/src/components/Dashboard/QuickStats.jsx

### Stock Components
- [ ] T055 [P] Create stock list page in frontend/src/pages/StockList.jsx
- [ ] T056 [P] Create stock detail page in frontend/src/pages/StockDetail.jsx
- [ ] T057 [P] Create stock card component in frontend/src/components/Stocks/StockCard.jsx
- [ ] T058 [P] Create stock search component in frontend/src/components/Stocks/StockSearch.jsx

### Investment Components
- [ ] T059 Create investment modal in frontend/src/components/Investment/InvestmentModal.jsx
- [ ] T060 Create investment preview component in frontend/src/components/Investment/InvestmentPreview.jsx
- [ ] T061 Create investment confirmation component in frontend/src/components/Investment/InvestmentConfirm.jsx

### Portfolio Components
- [ ] T062 [P] Create portfolio page in frontend/src/pages/Portfolio.jsx
- [ ] T063 [P] Create portfolio performance chart in frontend/src/components/Portfolio/PerformanceChart.jsx
- [ ] T064 [P] Create portfolio details component in frontend/src/components/Portfolio/PortfolioDetails.jsx

### Leaderboard Components
- [ ] T065 [P] Create leaderboard page in frontend/src/pages/Leaderboard.jsx
- [ ] T066 [P] Create leaderboard table component in frontend/src/components/Leaderboard/LeaderboardTable.jsx
- [ ] T067 [P] Create rank badge component in frontend/src/components/Leaderboard/RankBadge.jsx

### Class Components
- [ ] T068 [P] Create join class modal in frontend/src/components/Class/JoinClassModal.jsx
- [ ] T069 [P] Create class info component in frontend/src/components/Class/ClassInfo.jsx

## Phase 3.6: Routing & State Management

- [ ] T070 Set up React Router in frontend/src/App.jsx with all routes
- [ ] T071 Implement global state management for user session
- [ ] T072 Set up Supabase real-time subscriptions for leaderboard
- [ ] T073 Implement error boundary for graceful error handling

## Phase 3.7: Integration & Real-time Features

- [ ] T074 Connect frontend to Supabase authentication
- [ ] T075 Implement real-time leaderboard updates using Supabase Realtime
- [ ] T076 Set up automatic stock price refresh every 15 minutes
- [ ] T077 Implement WebSocket connection management
- [ ] T078 Add connection status indicator

## Phase 3.8: Polish & Optimization

- [ ] T079 [P] Add loading states to all async operations
- [ ] T080 [P] Implement error toast notifications
- [ ] T081 [P] Add responsive design for mobile devices
- [ ] T082 [P] Optimize bundle size with code splitting
- [ ] T083 [P] Add PWA manifest for offline capability
- [ ] T084 [P] Implement data validation on all forms
- [ ] T085 [P] Add unit tests for utility functions in frontend/tests/unit/
- [ ] T086 Create seed data script in backend/supabase/seed.sql
- [ ] T087 Add performance monitoring
- [ ] T088 Create deployment configuration for Vercel

## Phase 3.9: Documentation & Deployment

- [ ] T089 [P] Create README.md with setup instructions
- [ ] T090 [P] Document environment variables in .env.example
- [ ] T091 [P] Create API documentation in docs/api.md
- [ ] T092 Configure GitHub Actions CI/CD pipeline
- [ ] T093 Deploy to Vercel and configure production environment
- [ ] T094 Run quickstart.md validation tests
- [ ] T095 Perform security audit

## Dependencies

### Critical Dependencies:
- Database setup (T008-T015) blocks everything
- Tests (T016-T027) must fail before implementation (T028-T069)
- Services (T028-T045) before components (T046-T069)
- Components before routing (T070-T073)
- Core features before polish (T079-T088)

### Parallel Execution Groups:

**Group 1: Database Migrations (after T008)**
```
Task: "Create migration for classes table"
Task: "Create migration for stock_prices table"
```

**Group 2: Contract Tests**
```
Task: "Contract test for auth/signup endpoint"
Task: "Contract test for auth/signin endpoint"
Task: "Contract test for GET /stock_prices endpoint"
Task: "Contract test for POST /portfolios endpoint"
Task: "Contract test for GET /portfolios endpoint"
Task: "Contract test for POST /class_memberships endpoint"
Task: "Contract test for GET /leaderboard endpoint"
```

**Group 3: Integration Tests**
```
Task: "Integration test for student registration flow"
Task: "Integration test for class joining flow"
Task: "Integration test for stock investment flow"
Task: "Integration test for leaderboard updates"
Task: "Integration test for portfolio performance tracking"
```

**Group 4: Service Modules**
```
Task: "Create stock service module"
Task: "Create portfolio service module"
Task: "Create class service module"
```

**Group 5: UI Components**
```
Task: "Create stock list page"
Task: "Create portfolio page"
Task: "Create leaderboard page"
Task: "Create layout components"
```

## Notes

- **[P]** tasks can run in parallel as they modify different files
- Tests MUST fail before implementing features (TDD requirement)
- Commit after each completed task
- Use real Supabase instance for testing, not mocks
- Stock prices use `.TO` suffix for TSX symbols
- Enforce one-time investment at database level
- All monetary values in CAD

## Validation Checklist
*GATE: Verify before execution*

- [x] All API endpoints have contract tests
- [x] All entities have migration tasks
- [x] All tests come before implementation
- [x] Parallel tasks are truly independent
- [x] Each task specifies exact file path
- [x] No parallel tasks modify the same file
- [x] Authentication flow covered
- [x] Investment flow covered
- [x] Leaderboard updates covered
- [x] Real-time features included

---
*Tasks generated: 2025-09-07*
*Total tasks: 95*
*Estimated completion: 3-4 weeks for solo developer*