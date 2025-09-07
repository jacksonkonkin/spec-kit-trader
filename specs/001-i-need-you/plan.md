# Implementation Plan: Stock Trading Learning Platform

**Branch**: `001-i-need-you` | **Date**: 2025-09-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-i-need-you/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Educational stock trading simulator for classroom use where students invest $100,000 virtual currency in a single Toronto Stock Exchange stock and compete on a leaderboard over a semester. Technical approach: React frontend with Supabase backend for authentication and data persistence, deployed on Vercel.

## Technical Context
**Language/Version**: React 18+ (Frontend), PostgreSQL (Supabase)
**Primary Dependencies**: React, Supabase Client SDK, Material-UI/Ant Design, Recharts/Chart.js
**Storage**: PostgreSQL via Supabase (users, portfolios, stock prices cache)
**Testing**: Jest + React Testing Library (frontend), Supabase test helpers
**Target Platform**: Web browser (desktop/mobile responsive)
**Project Type**: web - frontend + backend via Supabase
**Performance Goals**: <2s page load, real-time leaderboard updates
**Constraints**: 30+ concurrent users, TSX market hours operation, one investment per user
**Scale/Scope**: 30-50 students per class, single semester duration

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend, supabase setup)
- Using framework directly? Yes - React + Supabase SDK
- Single data model? Yes - unified schema
- Avoiding patterns? Yes - no unnecessary abstractions

**Architecture**:
- EVERY feature as library? Frontend components modularized
- Libraries listed: 
  - auth-service (Supabase authentication wrapper)
  - portfolio-service (investment operations)
  - stock-service (TSX data fetching)
  - leaderboard-service (ranking calculations)
- CLI per library: N/A for web app
- Library docs: Component documentation planned

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Supabase test instance
- Integration tests for: auth flow, investment flow, leaderboard updates
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? Yes - console + Supabase logs
- Frontend logs → backend? Yes via Supabase
- Error context sufficient? Yes - user actions tracked

**Versioning**:
- Version number assigned? 1.0.0
- BUILD increments on every change? Yes
- Breaking changes handled? N/A for initial release

## Project Structure

### Documentation (this feature)
```
specs/001-i-need-you/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── hooks/
├── tests/
└── public/
```

**Structure Decision**: Option 2 - Web application structure (React frontend + Supabase backend)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - TSX data API selection and integration
   - Supabase authentication setup for classroom use
   - Real-time leaderboard implementation approach
   - Stock price caching strategy

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research TSX data APIs for educational use"
     Task: "Find best practices for Supabase auth in classroom apps"
     Task: "Research real-time leaderboard patterns with Supabase"
     Task: "Evaluate stock price caching strategies"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User (id, email, created_at)
   - Portfolio (user_id, stock_symbol, purchase_price, shares, purchase_date)
   - StockPrice (symbol, company_name, current_price, last_updated)
   - Class (id, name, semester, start_date, end_date)
   - ClassMembership (class_id, user_id, joined_at)

2. **Generate API contracts** from functional requirements:
   - POST /auth/signup - Create student account
   - GET /stocks - List TSX stocks
   - POST /portfolio/invest - Make one-time investment
   - GET /portfolio/{userId} - Get user portfolio
   - GET /leaderboard - Get class rankings
   - GET /stocks/{symbol}/price - Get current price

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - New student signup and receives $100,000
   - Student selects and purchases TSX stock
   - Leaderboard updates with new investment
   - Portfolio value updates with price changes

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh claude`
   - Add React, Supabase, TSX integration context
   - Update recent changes
   - Keep under 150 lines

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Supabase setup → Models → Services → UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*