# LabGenius AI - Architecture Documentation

## System Overview

LabGenius AI is a full-stack web application for scientific research automation using AI. It consists of:

- **Frontend**: Next.js 16 with React 19, TypeScript
- **Backend**: Next.js API routes with Supabase PostgreSQL
- **AI**: OpenAI GPT-4 via Vercel AI SDK
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Authentication**: Supabase Auth with email/password

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Component Library**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: SWR for client-side caching
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (Vercel Edge Runtime compatible)
- **Framework**: Next.js 16 API Routes
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **ORM**: None (using raw SQL with proper parameterization)
- **AI**: AI SDK 6 with OpenAI

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Environment**: Node.js with Turbopack bundler

## Directory Structure

```
/vercel/share/v0-project/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── callback/           # OAuth callback
│   │   └── error/
│   ├── dashboard/               # Protected dashboard
│   │   ├── page.tsx            # Dashboard home
│   │   ├── experiments/         # Experiments list
│   │   ├── experiment/
│   │   │   └── [id]/          # Experiment details
│   │   └── settings/           # User settings
│   └── api/                     # API routes
│       └── experiments/
│           ├── plan/           # AI planning endpoint
│           ├── analyze/        # AI analysis endpoint
│           └── [id]/progress/  # Progress tracking
├── components/                  # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard-nav.tsx        # Dashboard navigation
│   ├── experiments-grid.tsx     # Experiments display
│   └── error-boundary.tsx       # Error boundary
├── lib/                         # Utilities
│   ├── supabase/                # Supabase client setup
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── proxy.ts             # Middleware
│   ├── errors.ts                # Error handling
│   ├── validation.ts            # Zod schemas
│   └── utils.ts                 # Common utilities
├── middleware.ts                # Next.js middleware
├── scripts/                     # Database setup
│   ├── 01_create_schema.sql     # Schema migration
│   └── setup.mjs                # Migration runner
├── public/                      # Static assets
├── ARCHITECTURE.md              # This file
├── DEPLOYMENT.md                # Deployment guide
└── TESTING.md                   # Testing guide
```

## Database Schema

### Core Tables

**users**
- Extends Supabase auth.users
- Stores user metadata and credits
- RLS: Users can only view/modify their own profile

**experiments**
- Main experiment records
- Tracks status, dates, and basic info
- RLS: Users can only access their own experiments

**experiment_runs**
- Individual runs of an experiment
- Tracks progress and status
- RLS: Users can only access their own runs

**experiment_results**
- Stores raw and processed data
- Links to runs
- RLS: Users can only view results from their experiments

**experiment_plans**
- AI-generated experiment plans
- Step-by-step procedures
- RLS: Users can only access plans for their experiments

**analysis_reports**
- AI-generated analysis of results
- Contains findings and recommendations
- RLS: Users can only view their own analyses

**usage_logs**
- Tracks API usage and credits
- For billing and monitoring
- RLS: Users can only view their own logs

**notifications**
- User notifications
- Read/unread status
- RLS: Users can only view their own notifications

## API Routes

### Authentication
- `POST /auth/sign-up` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `/auth/callback` - OAuth callback handler

### Experiments
- `GET /api/experiments` - List user's experiments
- `POST /api/experiments` - Create new experiment
- `GET /api/experiments/[id]` - Get experiment details
- `PUT /api/experiments/[id]` - Update experiment
- `DELETE /api/experiments/[id]` - Delete experiment

### AI Features
- `POST /api/experiments/plan` - Generate experiment plan
- `POST /api/experiments/analyze` - Analyze results
- `GET /api/experiments/[id]/progress` - Get progress
- `PUT /api/experiments/[id]/progress` - Update progress

## Security Architecture

### Authentication Flow
1. User signs up/logs in with Supabase Auth
2. Auth token stored in secure HTTP-only cookie
3. Middleware validates token on each request
4. Protected routes redirect to login if not authenticated
5. Token automatically refreshed

### Authorization
- Row-Level Security (RLS) enforced at database level
- Users can only access their own data
- Service role key used for admin operations
- API routes verify user ID before database operations

### Data Protection
- All passwords hashed by Supabase
- Sensitive data not logged
- Error messages don't reveal sensitive info
- API validation prevents injection attacks
- CORS configured for security

## Error Handling Architecture

### Error Hierarchy
```
APIError (base)
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── RateLimitError (429)
└── InternalServerError (500)
```

### Error Flow
1. Validation errors caught immediately
2. Auth/Auth errors return specific messages
3. Database errors caught and logged
4. All errors formatted consistently
5. User receives helpful error messages

## Data Flow

### Create Experiment Flow
```
User Input
   ↓
Form Validation (Zod)
   ↓
API Route (/api/experiments)
   ↓
Auth Check
   ↓
Database Insert
   ↓
Response to Client
   ↓
SWR Cache Update
   ↓
UI Re-render
```

### AI Planning Flow
```
User Triggers Plan Generation
   ↓
API Route (/api/experiments/plan)
   ↓
Validate Input
   ↓
Create AI Prompt
   ↓
Stream from OpenAI
   ↓
Return Response to Client
   ↓
Store in Database
   ↓
UI Updates with Results
```

## Performance Considerations

### Frontend Optimization
- Code splitting via dynamic imports
- Image optimization with Next.js Image
- SWR caching to reduce API calls
- Lazy loading of components
- CSS-in-JS generation optimized

### Backend Optimization
- Database indexes on common queries
- RLS policies evaluated efficiently
- Connection pooling via Supabase
- Streaming responses for AI features
- Proper error handling to avoid timeouts

### Database Optimization
- Indexes on user_id, status, created_at
- Foreign key constraints
- Proper pagination for large datasets
- Query result limiting

## Scalability Architecture

### Current Limits
- Single database instance (Supabase)
- No caching layer (would use Redis)
- No rate limiting (can add later)
- Limited to Vercel's serverless limits

### Future Scaling
1. **Add Redis** for session caching
2. **Implement rate limiting** via Upstash
3. **Database replicas** for read scaling
4. **CDN for static assets** 
5. **Separate admin APIs** for scaling
6. **Job queue** for async operations (Supabase queues)

## Monitoring & Logging

### Client-Side
- Console logs with [v0] prefix for debugging
- Error boundaries catch React errors
- Sentry for error tracking (future)

### Server-Side
- Console.error for important errors
- Request logging (future: structured logging)
- Database query logging (future)
- API performance metrics (future: Datadog/New Relic)

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Run dev server
pnpm dev

# Access at http://localhost:3000
```

### Code Organization
- One component per file
- Utility functions in lib/
- API routes follow REST conventions
- Database queries in separate functions
- Types in separate files when needed

## Testing Strategy

### Unit Tests (future)
- Validation functions
- Error handlers
- Utility functions

### Integration Tests (future)
- API routes with database
- Auth flows
- RLS policies

### E2E Tests (manual for now)
- User registration and login
- Experiment creation and management
- AI feature generation

## Deployment Architecture

### Development Environment
- Local machine with pnpm
- Supabase local (optional)
- Environment variables in .env.local

### Preview Environment
- Vercel preview deployment
- Uses production database
- Manual testing before merge

### Production Environment
- Vercel serverless functions
- Production Supabase project
- Environment variables from Vercel
- Automatic deployments on main branch push

## Future Enhancements

### Features
- Real-time collaboration
- File uploads/downloads
- Export results (PDF/CSV)
- Advanced analytics
- Mobile app
- API for third-party integration

### Infrastructure
- Redis caching layer
- Job queue for async tasks
- Email service integration
- Webhook support
- GraphQL API

### Observability
- Comprehensive logging
- Performance monitoring
- Error tracking with Sentry
- Analytics with PostHog
- Uptime monitoring
