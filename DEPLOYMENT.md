# LabGenius AI - Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup ✓
- [ ] Supabase project created and configured
- [ ] Database migrations executed successfully
- [ ] All tables created with correct structure
- [ ] RLS policies enabled on all tables
- [ ] Indexes created for performance optimization
- [ ] Foreign key constraints verified

### 2. Environment Variables
Ensure all required environment variables are configured in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTGRES_URL=postgresql://user:password@host:port/database
```

### 3. Authentication
- [ ] Supabase Auth configured
- [ ] Email/password auth enabled
- [ ] OAuth providers configured (if needed)
- [ ] Redirect URLs configured for auth callbacks
- [ ] Email confirmation enabled/configured

### 4. API & Security
- [ ] All API routes have proper authentication checks
- [ ] Error handling covers all endpoints
- [ ] Input validation implemented with Zod
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] No sensitive data in error messages

### 5. Frontend
- [ ] All components built and tested
- [ ] Error boundaries configured
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Accessibility checked

### 6. Code Quality
- [ ] Linting passes without errors
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No breaking changes

## Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "chore: prepare for deployment"
```

### Step 2: Run Build Test
```bash
pnpm build
```

### Step 3: Verify Tests Pass
```bash
# Run any automated tests
pnpm test
```

### Step 4: Deploy to Vercel
```bash
# Option 1: Using Vercel CLI
vercel deploy --prod

# Option 2: Push to GitHub and use GitHub integration
git push origin main
```

### Step 5: Verify Deployment
1. Visit your deployment URL
2. Test login/signup flow
3. Test dashboard functionality
4. Check API endpoints
5. Monitor error logs

### Step 6: Post-Deployment
- [ ] Update DNS records if using custom domain
- [ ] Configure monitoring/logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics
- [ ] Test email notifications
- [ ] Monitor performance metrics

## Database Migration on Deployment

The database schema needs to be set up before deployment. Run the migration script:

```bash
node scripts/setup.mjs
```

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Run migrations
supabase db push
```

## Environment Variables Setup

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all required variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - POSTGRES_URL

4. Ensure variables are available in all environments:
   - Development
   - Preview
   - Production

## RLS Policy Verification

Ensure all RLS policies are enabled in Supabase:

```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN (
  'users', 'experiments', 'experiment_runs', 
  'experiment_results', 'analysis_reports',
  'experiment_plans', 'usage_logs', 'notifications'
);
```

All should show `rowsecurity = true`.

## Monitoring & Observability

### Error Tracking
- Configure Sentry for error tracking
- Set up error notifications
- Review error logs weekly

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Watch server resource usage

### Application Monitoring
- Track user sign-ups and logins
- Monitor experiment creation rates
- Track API usage and credits spent

## Rollback Plan

If issues occur post-deployment:

1. **Quick Rollback**: Revert to previous version
   ```bash
   vercel rollback
   ```

2. **Database Rollback**: 
   - Don't run migrations on production database
   - Keep backups before making changes
   - Use Supabase's point-in-time recovery if available

3. **Communicate Issues**: Notify users of any outages

## Common Issues & Solutions

### Issue: Database Connection Fails
**Solution**: Verify POSTGRES_URL environment variable is correct and database is accessible

### Issue: Auth Redirect Fails
**Solution**: Ensure redirect URLs are configured in Supabase Auth settings

### Issue: APIs Return 401 Unauthorized
**Solution**: Check that Supabase keys are correct and NEXT_PUBLIC_ variables are accessible from frontend

### Issue: Build Fails with TypeScript Errors
**Solution**: Fix TypeScript errors and ensure all dependencies are installed

## Performance Optimization

Before deployment, consider:

1. **Image Optimization**
   - Use Next.js Image component
   - Optimize all images

2. **Code Splitting**
   - Leverage dynamic imports
   - Tree-shake unused code

3. **Database**
   - Ensure indexes are created
   - Review query performance
   - Set connection pooling

4. **Caching**
   - Configure HTTP caching headers
   - Use SWR for client-side caching

## Security Checklist

- [ ] All environment secrets are secure
- [ ] Database credentials not committed
- [ ] API keys rotated before deployment
- [ ] HTTPS enabled on all endpoints
- [ ] CORS configured properly
- [ ] No debug information in production
- [ ] Rate limiting implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Scaling Considerations

For future scaling:

1. **Database**: Consider connection pooling (PgBouncer)
2. **Cache**: Implement Redis for session/query caching
3. **API**: Add rate limiting and throttling
4. **Storage**: Use CDN for static assets
5. **Monitoring**: Set up comprehensive alerting

## Support & Documentation

- API Documentation: `/api/docs`
- User Guide: See `USER_GUIDE.md`
- Testing Guide: See `TESTING.md`
- Architecture: See `ARCHITECTURE.md`

## Contact & Support

For deployment issues:
1. Check error logs in Vercel dashboard
2. Review Supabase console for database errors
3. Check application monitoring systems
4. Review the TESTING.md for diagnostic steps
