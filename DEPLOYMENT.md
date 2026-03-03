# 🚀 Deployment Checklist

Use this checklist to deploy Holiday Hub to production.

---

## Pre-Deployment

### 1. Local Testing

- [ ] Application builds successfully (`npm run build`)
- [ ] Can enable/disable holidays
- [ ] Can configure notification settings
- [ ] Test email sending (if Resend configured)

### 2. Environment Variables Ready

- [ ] Production `DATABASE_URL`
- [ ] Strong `NEXTAUTH_SECRET` (different from dev)
- [ ] Production `RESEND_API_KEY`
- [ ] Verified `EMAIL_FROM` domain
- [ ] (Optional) VAPID keys for push notifications

---

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

**Steps:**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import project
3. Add environment variables in Vercel dashboard
4. Deploy!

**Vercel-specific:**

- Automatically handles Next.js build
- Free SSL certificate
- Edge functions for API routes
- **Important**: Set up Vercel Cron for scheduler

Use the included workflow file `.github/workflows/cron-notify.yml`. It POSTs to your deployed site at `/api/cron/notify` and sends the `Authorization: Bearer $CRON_SECRET` header.

Setup steps:

- Add a repository secret `CRON_BASE_URL` with your site URL (e.g. `https://holiday-hub.vercel.app`).
- Add a repository secret `CRON_SECRET` (a random string). Also add the same `CRON_SECRET` to your Vercel environment variables so the endpoint accepts the request.
- The workflow runs daily at 06:00 UTC by default and can be manually triggered from the Actions tab.

This approach is simple, works across hosts, and avoids relying on unsupported `vercel.json` keys.

**Pros:**

- Zero config for Next.js
- Free tier available
- Great performance
- Automatic CI/CD

- Need separate cron setup
- Function timeout limits (10s free, 30s hobby)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Add PostgreSQL service
5. Add environment variables
6. Deploy!

**Railway-specific:**

- Includes PostgreSQL database
- Can run scheduler as separate service
- Longer timeouts than Vercel

**Pros:**

- PostgreSQL included
- Can run long-running processes
- Simple pricing

### Option 3: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New Web Service → Connect repository
4. Add PostgreSQL database
5. Add environment variables
6. Deploy!

**Pros:**

- Free tier available
- PostgreSQL included in paid tier
- Easy to use

**Cons:**

- Slower cold starts on free tier
- Free tier sleeps after inactivity

---

### Option 4: Self-Hosted (VPS)

**Requirements:**

- Linux server (Ubuntu recommended)
- Node.js 18+
- PostgreSQL
- Nginx (for reverse proxy)
- PM2 (for process management)

**Steps:**

1. Clone repository to server
2. Install dependencies: `npm install`
3. Set up environment variables
4. Build: `npm run build`
5. Run with PM2: `pm2 start npm --name holiday-hub -- start`
6. Set up Nginx reverse proxy
7. Configure SSL with Let's Encrypt
8. Set up cron job for scheduler

**Scheduler cron:**

```bash
0 6 * * * cd /path/to/holiday-hub && npm run scheduler
```

**Pros:**

- Full control
- No platform limitations
- Can optimize costs

**Cons:**

- Requires server management
- Must handle security updates
- More setup time

---

## Database Setup (Production)

### Recommended: Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to environment variables
5. Run migrations:

```bash
npx prisma db push
npm run prisma:seed
```

**Free tier:**

- 0.5 GB storage
- 1 compute unit
- Perfect for small apps

### Alternative: Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. New project
3. Settings → Database → Connection string
4. Add to environment variables
5. Run migrations

**Free tier:**

- 500 MB database
- 2 GB bandwidth
- Includes auth & storage

---

## Scheduler Setup

The notification scheduler needs to run daily. Choose one option:

### Option A: Vercel Cron (for Vercel deployments)

- Create cron endpoint
- Configure in `vercel.json`
- Limited to HTTP triggers

### Option B: GitHub Actions (works with any platform)

Create `.github/workflows/scheduler.yml`:

```yaml
name: Daily Notification Scheduler

on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC daily

jobs:
  run-scheduler:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scheduler
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
```

Add secrets in GitHub repository settings.

### Option C: Upstash QStash (Serverless Cron)

- Sign up at [upstash.com](https://upstash.com)
- Create scheduled job
- Points to your API endpoint
- Create scheduled job
- Points to your API endpoint
- Free tier: check your account for current quotas (example: 1,000 messages/day on some accounts)

**QStash integration steps (recommended):**

1. Add environment variables to your deployment platform:
   - `CRON_SECRET` — fallback bearer secret for scheduler requests
   - `QSTASH_CURRENT_SIGNING_KEY` — current signing key from QStash (do not commit)
   - `QSTASH_NEXT_SIGNING_KEY` — next signing key (optional; rotate keys safely)

2. Create a scheduled job in QStash that POSTs your endpoint:
   - URL: `https://<your-site>/api/cron/notify`
   - Method: `POST`
   - Headers: you can add `Authorization: Bearer <CRON_SECRET>` or rely on QStash signature verification.
   - Cron expression: e.g., `*/15 * * * *` (every 15 minutes) or a daily schedule.

3. Monitor delivery logs in QStash dashboard. One scheduled delivery counts as one message; retries may consume extra messages.

Notes:

- Use a single scheduled job to call `/api/cron/notify`. Avoid creating per-user messages from QStash as each counts toward your quota.
- Verify signatures server-side using `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` for rotation support.

### Option D: Separate Service (Railway/Render)

- Deploy scheduler as separate service
- Runs continuously or on schedule
- More reliable for critical notifications

---

## Email Configuration

### Resend Domain Setup (Production)

1. **Add Domain** in Resend dashboard
2. **Add DNS Records** to your domain:
   ```
   Type: TXT
   Name: @
   Value: resend-verification=...
   ```
3. **Verify Domain** in Resend
4. **Update** `EMAIL_FROM` in environment variables:
   ```
   EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"
   ```

**Important:**

- Use subdomain for emails (e.g., `notifications.example.com`)
- Set up SPF, DKIM, DMARC for deliverability
- Monitor bounce rates in Resend dashboard

---

## Security Checklist

### Before Deployment

- [ ] Change all secrets from development
- [ ] Strong `NEXTAUTH_SECRET` (32+ chars)
- [ ] Verify `.env` is in `.gitignore`
- [ ] No secrets committed to repository
- [ ] Enable 2FA on hosting account
- [ ] Enable 2FA on GitHub
- [ ] Set up branch protection on main branch

### After Deployment

- [ ] Test authentication flow
- [ ] Verify SSL certificate
- [ ] Test email sending
- [ ] Check notification scheduler runs
- [ ] Monitor error logs
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

---

## Monitoring & Maintenance

### Recommended Tools

1. **Error Tracking**
   - Sentry (free tier available)
   - LogRocket
   - Add to catch runtime errors

2. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - Better Stack

3. **Analytics** (Optional)
   - Vercel Analytics
   - Google Analytics
   - Plausible

4. **Database Monitoring**
   - Built-in to Neon/Supabase
   - Monitor queries and performance

---

## Post-Deployment Testing

### Test Checklist

- [ ] Visit production URL
- [ ] Create test account
- [ ] Login/logout works
- [ ] View holidays on dashboard
- [ ] Enable a holiday
- [ ] Configure notification settings
- [ ] Wait for notification (or trigger manually for testing)
- [ ] Verify email received
- [ ] Check database has notification log

### Performance Testing

- [ ] Lighthouse score (aim for 90+ on performance)
- [ ] Fast page loads (<3s)
- [ ] Mobile responsive
- [ ] Test on different browsers

---

## Backup Strategy

### Database Backups

1. **Neon**: Automatic backups included
2. **Supabase**: Point-in-time recovery
3. **Self-hosted**: Set up daily pg_dump
   ```bash
   pg_dump -h localhost -U user holiday_hub > backup.sql
   ```

### Code Backups

- Main code is in GitHub (primary source)
- Tag releases: `git tag v1.0.0`
- Keep production branch stable

---

## Scaling Considerations

When you have 100+ users:

1. **Database**
   - Upgrade to paid tier
   - Add connection pooling (PgBouncer)
   - Index frequently queried columns

2. **Scheduler**
   - Batch process users
   - Add rate limiting for emails
   - Queue system (BullMQ + Redis)

3. **Caching**
   - Cache holiday calculations
   - Redis for session storage
   - CDN for static assets

4. **Monitoring**
   - Set up alerts for errors
   - Track email bounce rates
   - Monitor database performance

---

## Cost Estimation

### Small Scale (1-100 users)

- Hosting: Free (Vercel/Render)
- Database: Free (Neon/Supabase)
- Email: Free (Resend 3k/month)
- **Total: $0/month**

### Medium Scale (100-1000 users)

- Hosting: $20/month (Vercel Pro)
- Database: $10/month (Neon scale tier)
- Email: $20/month (Resend)
- **Total: ~$50/month**

### Large Scale (1000+ users)

- Hosting: $50+/month
- Database: $50+/month
- Email: $80+/month
- **Total: $180+/month**

---

## Rollback Plan

If something goes wrong:

1. **Vercel**: Instantly rollback to previous deployment
2. **Railway/Render**: Redeploy previous commit
3. **Self-hosted**:

   ```bash
   git checkout previous-tag
   npm install
   npm run build
   pm2 restart all
   ```

4. **Database**: Restore from backup if needed

---

## Launch Checklist

### Final Steps Before Going Live

- [ ] All tests pass
- [ ] Production environment variables set
- [ ] Database migrated and seeded
- [ ] Domain configured and SSL working
- [ ] Email sending verified
- [ ] Scheduler tested
- [ ] Monitoring tools set up
- [ ] Backup strategy in place
- [ ] Error tracking configured
- [ ] Documentation updated
- [ ] Support email ready

### Announce Launch

- [ ] Update README with production URL
- [ ] Share on social media
- [ ] Post on Product Hunt (optional)
- [ ] Add to portfolio

---

## Support & Maintenance

### Weekly

- Check error logs
- Monitor email deliverability
- Review user signups

### Monthly

- Update dependencies: `npm update`
- Review security advisories
- Backup verification
- Performance review

### Quarterly

- Major dependency updates
- Security audit
- Feature roadmap review
- User feedback analysis

---

## 🎉 You're Ready to Launch!

Follow this checklist and your Holiday Hub will be production-ready.

Good luck with your deployment! 🚀
