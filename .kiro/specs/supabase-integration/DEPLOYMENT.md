# CommuniTree Deployment Guide

This guide covers deploying CommuniTree to production with Supabase as the backend.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Supabase Setup](#production-supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [RLS Policy Verification](#rls-policy-verification)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Backup and Recovery](#backup-and-recovery)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass locally (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] All environment variables documented
- [ ] Database migrations tested in staging
- [ ] RLS policies reviewed and tested
- [ ] Authentication flows tested end-to-end
- [ ] Real-time subscriptions tested
- [ ] Error handling verified
- [ ] Performance optimizations applied
- [ ] Security audit completed

---

## Production Supabase Setup

### 1. Create Production Project

1. Log in to [supabase.com](https://supabase.com)
2. Create a new project for production:
   - **Name**: CommuniTree Production
   - **Database Password**: Use a strong, unique password (store in password manager)
   - **Region**: Select region closest to your primary user base
   - **Pricing Plan**: Choose based on expected usage (Pro recommended for production)

3. Wait for project initialization (1-2 minutes)

### 2. Configure Project Settings

#### Database Settings

1. Go to **Settings** → **Database**
2. Configure connection pooling:
   - **Pool Mode**: Transaction (recommended for serverless)
   - **Pool Size**: Start with default, adjust based on load
3. Enable **Point-in-Time Recovery** (PITR) for data protection

#### API Settings

1. Go to **Settings** → **API**
2. Review and configure:
   - **JWT expiry**: Default 3600 seconds (1 hour) is recommended
   - **Refresh token expiry**: Default 2592000 seconds (30 days)
3. Copy your production credentials:
   - **Project URL**
   - **anon public key**
   - **service_role key** (keep this secret, never expose to frontend)

#### Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure email settings:
   - **Enable Email Confirmations**: Recommended for production
   - **SMTP Settings**: Configure custom SMTP for branded emails (optional)
3. Configure security:
   - **Enable Captcha**: Recommended to prevent bot signups
   - **Rate Limiting**: Enable to prevent abuse
4. Set **Site URL** to your production domain (e.g., `https://communitree.app`)
5. Add **Redirect URLs** for authentication callbacks

#### Real-time Settings

1. Go to **Database** → **Replication**
2. Enable replication for tables that need real-time:
   - `chat_messages` (INSERT)
   - `chat_threads` (UPDATE)
3. Configure rate limits if needed

---

## Environment Configuration

### Production Environment Variables

Create a production environment configuration with these variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Application Configuration
VITE_APP_ENV=production
VITE_APP_URL=https://communitree.app

# Optional: Analytics, Monitoring
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GA_TRACKING_ID=your-google-analytics-id
```

### Environment Variable Management

**For Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable with scope set to "Production"
3. Redeploy after adding variables

**For Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add each variable
3. Trigger new deployment

**For AWS Amplify:**
1. Go to App Settings → Environment Variables
2. Add each variable
3. Redeploy application

**Security Best Practices:**
- Never commit production credentials to version control
- Use different Supabase projects for development, staging, and production
- Rotate API keys periodically
- Use secret management services for sensitive values (AWS Secrets Manager, HashiCorp Vault)
- Limit access to production environment variables to authorized team members only

---

## Database Migration

### Running Migrations in Production

**Important**: Always test migrations in a staging environment first.

#### Option 1: Manual Migration via Dashboard

1. Go to Supabase Dashboard → **SQL Editor**
2. Run migration files in order:

```sql
-- 1. Create tables
-- Copy and run: migrations/001_create_tables.sql

-- 2. Create functions and triggers
-- Copy and run: migrations/002_create_functions.sql

-- 3. Create RLS policies
-- Copy and run: migrations/003_create_rls_policies.sql
```

3. After each migration:
   - Review execution results
   - Check for errors
   - Verify tables/functions created correctly

#### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to production project
supabase link --project-ref your-production-project-ref

# Push migrations
supabase db push

# Verify migration status
supabase migration list
```

### Migration Rollback Plan

If a migration fails:

1. **Immediate Action**: Do not proceed with deployment
2. **Assess Impact**: Check which tables/functions were affected
3. **Rollback Strategy**:
   - For table creation: Drop the table if no data exists
   - For function changes: Restore previous function definition
   - For RLS policies: Disable problematic policy, fix, and re-enable
4. **Fix and Retry**: Correct the migration script and re-run

### Post-Migration Verification

```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify all functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

---

## RLS Policy Verification

Row Level Security is critical for data protection. Verify all policies are working correctly.

### 1. Enable RLS on All Tables

```sql
-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`.

### 2. Test RLS Policies

Create test users and verify access controls:

```sql
-- Create test user (via Supabase Auth UI or API)
-- Then test as that user:

-- Test 1: User can only see their own profile
SELECT * FROM users WHERE id = auth.uid();

-- Test 2: User cannot see other users' profiles
SELECT * FROM users WHERE id != auth.uid();
-- Should return empty or permission denied

-- Test 3: User can view verified NGOs
SELECT * FROM ngos WHERE verification_status = 'verified';

-- Test 4: User can only view their own RSVPs
SELECT * FROM rsvps WHERE user_id = auth.uid();

-- Test 5: User can view events they organize
SELECT * FROM events 
WHERE organizer_type = 'user' AND organizer_id = auth.uid();
```

### 3. Test Unauthorized Access

Attempt operations that should fail:

```sql
-- As User A, try to update User B's profile (should fail)
UPDATE users 
SET display_name = 'Hacked' 
WHERE id = '<user-b-id>';

-- As User A, try to view User B's RSVPs (should fail)
SELECT * FROM rsvps WHERE user_id = '<user-b-id>';

-- As User A, try to update User B's event (should fail)
UPDATE events 
SET title = 'Hacked Event' 
WHERE organizer_id = '<user-b-id>';
```

### 4. Policy Audit Checklist

- [ ] Users table: Users can only read/update own profile
- [ ] NGOs table: Public read for verified, restricted write
- [ ] Events table: Public read, organizer-only write
- [ ] RSVPs table: User can only manage own RSVPs
- [ ] Chat threads: Participants-only access
- [ ] Chat messages: Thread participants-only access
- [ ] Venues table: Public read, admin-only write
- [ ] Trust points history: Read-only for users

### 5. Common RLS Issues

**Issue**: "Permission denied" for legitimate operations
- **Solution**: Review policy conditions, ensure auth.uid() is correctly used

**Issue**: Users can see data they shouldn't
- **Solution**: Add more restrictive WHERE clauses to policies

**Issue**: Policies conflict with each other
- **Solution**: Use USING clause for SELECT, WITH CHECK for INSERT/UPDATE

---

## Frontend Deployment

### Build Configuration

1. Update `package.json` build script if needed:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

2. Build the production bundle:
```bash
npm run build
```

3. Test the production build locally:
```bash
npm run preview
```

### Deployment Platforms

#### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure:
   - Set environment variables in Vercel dashboard
   - Configure custom domain
   - Enable automatic deployments from Git

#### Netlify Deployment

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Configure `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### AWS Amplify Deployment

1. Connect repository to AWS Amplify
2. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Add environment variables in Amplify console

### Post-Deployment Frontend Checks

- [ ] Application loads without errors
- [ ] Authentication works (signup, login, logout)
- [ ] Data loads from Supabase
- [ ] Real-time chat updates work
- [ ] RSVP functionality works
- [ ] Trust points update correctly
- [ ] All routes accessible
- [ ] Mobile responsive design works
- [ ] No console errors

---

## Post-Deployment Verification

### 1. Smoke Tests

Run these tests immediately after deployment:

```bash
# Test authentication
curl -X POST https://your-project-ref.supabase.co/auth/v1/signup \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test database connection
curl https://your-project-ref.supabase.co/rest/v1/ngos?verification_status=eq.verified \
  -H "apikey: your-anon-key"
```

### 2. End-to-End User Flows

Test critical user journeys:

1. **New User Flow**:
   - Sign up with email/password
   - Verify email (if enabled)
   - Complete profile
   - Browse events
   - RSVP to event

2. **Existing User Flow**:
   - Log in
   - View profile with trust points
   - Browse NGOs
   - Start chat with NGO
   - Send message (verify real-time)

3. **Event Organizer Flow**:
   - Create event
   - View RSVPs
   - Update event details
   - Mark attendance

### 3. Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Database queries < 500ms
- [ ] Real-time latency < 1 second
- [ ] No memory leaks in long sessions

### 4. Security Checks

- [ ] HTTPS enabled
- [ ] No sensitive data in console logs
- [ ] API keys not exposed in frontend
- [ ] RLS policies enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active

---

## Backup and Recovery

### Automated Backups

Supabase Pro and above includes automated backups:

1. Go to **Settings** → **Database** → **Backups**
2. Verify backup schedule:
   - **Daily backups**: Retained for 7 days
   - **Weekly backups**: Retained for 4 weeks
   - **Monthly backups**: Retained for 3 months (Enterprise)

### Manual Backup

Create manual backups before major changes:

```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or using pg_dump directly
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup.sql
```

### Point-in-Time Recovery (PITR)

For Pro plans and above:

1. Go to **Settings** → **Database** → **Backups**
2. Enable PITR if not already enabled
3. To restore:
   - Select restore point (any time in last 7 days)
   - Create new project from backup
   - Verify data integrity
   - Update application to point to new project

### Disaster Recovery Plan

**Scenario 1: Data Corruption**
1. Identify corruption scope and time
2. Use PITR to restore to point before corruption
3. Create new project from backup
4. Update environment variables to new project
5. Redeploy application

**Scenario 2: Accidental Data Deletion**
1. Immediately stop all write operations
2. Use PITR or latest backup to restore
3. Verify restored data
4. Resume operations

**Scenario 3: Complete Project Loss**
1. Create new Supabase project
2. Restore from latest backup
3. Run migrations to ensure schema is current
4. Update environment variables
5. Redeploy application
6. Verify all functionality

### Backup Best Practices

- Test restore procedures quarterly
- Store backups in multiple locations
- Document recovery procedures
- Maintain backup of environment variables
- Keep migration scripts in version control
- Test backups in staging environment

---

## Monitoring and Maintenance

### Supabase Dashboard Monitoring

Monitor these metrics regularly:

1. **Database**:
   - Connection count
   - Query performance
   - Storage usage
   - Table sizes

2. **Authentication**:
   - Active users
   - Signup rate
   - Failed login attempts
   - Session duration

3. **API**:
   - Request count
   - Error rate
   - Response times
   - Rate limit hits

### Setting Up Alerts

Configure alerts for critical issues:

1. Go to **Settings** → **Alerts** (Pro plan)
2. Set up alerts for:
   - Database CPU > 80%
   - Storage > 80% capacity
   - Error rate > 5%
   - Connection pool exhaustion

### Application Monitoring

Integrate application monitoring:

```typescript
// Example: Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### Regular Maintenance Tasks

**Daily**:
- Check error logs
- Monitor user signups
- Review failed authentication attempts

**Weekly**:
- Review database performance
- Check storage usage
- Analyze slow queries
- Review RLS policy violations

**Monthly**:
- Update dependencies
- Review and optimize queries
- Analyze user behavior patterns
- Plan capacity scaling

**Quarterly**:
- Security audit
- Test backup restoration
- Review and update documentation
- Performance optimization review

### Scaling Considerations

**When to scale up**:
- Database CPU consistently > 70%
- Connection pool frequently exhausted
- Query response times increasing
- Storage approaching limits

**Scaling options**:
1. **Vertical scaling**: Upgrade Supabase plan
2. **Connection pooling**: Optimize pool settings
3. **Query optimization**: Add indexes, optimize queries
4. **Caching**: Implement application-level caching
5. **Read replicas**: For read-heavy workloads (Enterprise)

---

## Troubleshooting Production Issues

### Common Production Issues

**Issue**: High database CPU usage
- **Diagnosis**: Check slow query log
- **Solution**: Add indexes, optimize queries, enable connection pooling

**Issue**: Authentication failures
- **Diagnosis**: Check auth logs in Supabase dashboard
- **Solution**: Verify JWT settings, check rate limits, review CORS configuration

**Issue**: Real-time not working
- **Diagnosis**: Check replication settings
- **Solution**: Enable replication for affected tables, verify WebSocket connection

**Issue**: Permission denied errors
- **Diagnosis**: Check RLS policies
- **Solution**: Review and update policies, verify auth.uid() is set correctly

### Emergency Contacts

Maintain a list of emergency contacts:
- Supabase Support: support@supabase.io
- Team Lead: [contact info]
- Database Admin: [contact info]
- DevOps: [contact info]

### Rollback Procedure

If deployment causes critical issues:

1. **Immediate**: Revert to previous deployment
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify rollback
   ```

2. **Database**: If database changes caused issues:
   - Restore from backup
   - Or manually revert schema changes

3. **Communicate**: Notify team and users of rollback

4. **Post-mortem**: Document what went wrong and how to prevent it

---

## Security Checklist

Before going live, verify:

- [ ] All RLS policies tested and working
- [ ] No service_role key exposed to frontend
- [ ] HTTPS enforced on all connections
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] Email confirmation enabled (if required)
- [ ] CAPTCHA enabled for signups
- [ ] CORS properly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection (Supabase handles this)
- [ ] Audit logging enabled
- [ ] Regular security updates scheduled

---

## Additional Resources

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#deploying-to-production)

---

## Support

For deployment issues:
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- GitHub Issues: [Project repository]

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Maintained By**: [Team Name]
