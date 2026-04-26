# LabGenius AI - Scientific Research Automation Platform

An AI-powered web application for automating scientific experiment design, planning, execution tracking, and analysis.

## 🎯 Features

### Core Functionality
- **AI-Powered Experiment Planning**: Generate detailed experimental procedures using GPT-4
- **Real-Time Progress Tracking**: Monitor experiment execution with live status updates
- **AI Analysis & Insights**: Automated analysis of results with statistical insights
- **Experiment Management**: Create, organize, and track multiple experiments
- **User Dashboard**: Centralized hub for all experiment management
- **Credit System**: Track API usage and AI feature consumption

### Technical Features
- **Secure Authentication**: Email/password and OAuth support via Supabase
- **Row-Level Security**: Database-level access control for data privacy
- **Error Handling**: Comprehensive error handling with validation
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Real-time Updates**: WebSocket support for live notifications (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Supabase project
- OpenAI API key

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations (see DEPLOYMENT.md)
node scripts/setup.mjs

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Project Structure

```
app/                 # Next.js app directory with pages and API routes
components/          # Reusable React components
lib/                 # Utilities, Supabase clients, validation, error handling
scripts/             # Database migrations and setup scripts
public/              # Static assets
```

## 🔧 Configuration

### Environment Variables

Required environment variables (set in `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTGRES_URL=your-postgres-url
```

### API Keys
- Supabase project credentials
- OpenAI API key (set in Vercel or locally)

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and technical architecture
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[TESTING.md](./TESTING.md)** - Testing procedures and checklist
- **[DATABASE.md](./docs/DATABASE.md)** - Database schema documentation

## 🗄️ Database

The application uses Supabase PostgreSQL with the following main tables:

- **users** - User profiles and metadata
- **experiments** - Experiment records
- **experiment_runs** - Individual experiment executions
- **experiment_results** - Experimental data and results
- **experiment_plans** - AI-generated experiment procedures
- **analysis_reports** - AI-generated analysis and insights
- **usage_logs** - API usage tracking
- **notifications** - User notifications

All tables have Row-Level Security (RLS) policies enforced.

## 🔐 Security

- User authentication via Supabase Auth
- Row-Level Security for data isolation
- Input validation with Zod schemas
- Secure error handling without information leakage
- API authentication required for all endpoints
- SQL injection prevention through parameterized queries

## 🎨 UI Components

The application uses:
- **shadcn/ui** - High-quality component library
- **Radix UI** - Headless UI components
- **Lucide Icons** - Modern icon set
- **Tailwind CSS v4** - Utility-first styling
- **Recharts** - Charts and data visualization

## 🤖 AI Integration

Uses OpenAI GPT-4 for:
- Experiment plan generation
- Results analysis
- Statistical insights
- Recommendations

Via Vercel AI SDK 6 with streaming support.

## 🧪 Testing

### Manual Testing Checklist
- Authentication flows (sign up, login, logout)
- Experiment creation and management
- AI plan generation
- Result analysis
- Error scenarios
- Security (authorization checks)
- Responsive design

See [TESTING.md](./TESTING.md) for detailed testing procedures.

## 📊 Performance

### Optimization Strategies
- Code splitting via dynamic imports
- SWR caching for client-side data
- Database indexing on frequently queried fields
- Streaming responses for AI features
- Image optimization with Next.js Image

### Performance Targets
- Page load: < 3 seconds
- API response: < 2 seconds
- Lighthouse score: > 90

## 🚢 Deployment

### To Vercel
```bash
vercel deploy --prod
```

### To Custom Server
Requires Node.js 18+ with environment variables configured.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

## 🔄 Development Workflow

### Making Changes
1. Create a feature branch
2. Make changes and test locally
3. Run `pnpm build` to verify build
4. Create pull request
5. Deploy to preview on merge
6. Deploy to production manually

### Code Quality
- Linting: `pnpm lint`
- Build: `pnpm build`
- Dev: `pnpm dev`
- Type checking: Built into build process

## 🐛 Troubleshooting

### Common Issues

**Database connection fails**
- Verify POSTGRES_URL is correct
- Check Supabase project is active

**Auth redirect fails**
- Ensure redirect URL is configured in Supabase
- Check NEXT_PUBLIC_SUPABASE_URL is correct

**API returns 401**
- Verify Supabase keys are correct
- Check authentication middleware

**Build fails**
- Clear `node_modules` and `.next`
- Run `pnpm install` again
- Check TypeScript errors

See [DEPLOYMENT.md](./DEPLOYMENT.md#common-issues--solutions) for more solutions.

## 🎓 API Documentation

### Authentication
- `POST /auth/sign-up` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/callback` - OAuth callback

### Experiments
- `GET /api/experiments` - List user's experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments/[id]` - Get experiment details
- `PUT /api/experiments/[id]` - Update experiment
- `DELETE /api/experiments/[id]` - Delete experiment

### AI Features
- `POST /api/experiments/plan` - Generate experiment plan
- `POST /api/experiments/analyze` - Analyze results
- `GET /api/experiments/[id]/progress` - Get progress status
- `PUT /api/experiments/[id]/progress` - Update progress

All API routes require authentication and validate input with Zod schemas.

## 📈 Analytics & Monitoring

### Built-In Logging
- Console logs with `[v0]` prefix for debugging
- Error logging for all failed operations
- Database query logging (development)

### Future Monitoring
- Sentry for error tracking
- PostHog for analytics
- Datadog for performance monitoring
- Custom dashboard for usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary and confidential.

## 👨‍💻 Development Team

Built with Vercel v0 AI code generation.

## 📞 Support

For issues and questions:
1. Check documentation in `/docs`
2. Review error messages and logs
3. See TESTING.md and DEPLOYMENT.md guides
4. Open an issue in the repository

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core experiment management
- ✅ AI planning and analysis
- ✅ User authentication
- ✅ Database and API

### Phase 2 (Planned)
- Real-time collaboration
- File uploads and exports
- Advanced analytics
- Mobile app

### Phase 3 (Future)
- Third-party integrations
- API for external tools
- Advanced reporting
- Team management

## 🙏 Acknowledgments

- Built with Next.js 16
- Powered by Supabase
- AI via OpenAI GPT-4
- UI components from shadcn/ui
- Styling with Tailwind CSS

---

**Last Updated**: April 26, 2026

**Version**: 1.0.0

**Status**: Ready for deployment
