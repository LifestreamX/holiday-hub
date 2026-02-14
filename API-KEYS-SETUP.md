# 🔑 Required API Keys & External Services

This document lists all external services and API keys needed to run Holiday Hub.

---

## ✅ Required Services (App Won't Work Without These)

### 1. PostgreSQL Database

**What it's for:** Stores all user data, holidays, preferences, and notifications

**Options:**

**A. Cloud Services (Recommended):**

- **[Neon](https://neon.tech)** - Free tier available, serverless PostgreSQL
  - Sign up → Create project → Copy connection string
- **[Supabase](https://supabase.com)** - Free PostgreSQL with additional features
  - Sign up → New project → Settings → Database → Connection string
- **[Railway](https://railway.app)** - Simple PostgreSQL hosting
  - New project → Add PostgreSQL → Copy `DATABASE_URL`

**B. Local (Development):**

- Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
- Create database: `createdb holiday_hub`
- Connection string: `postgresql://username:password@localhost:5432/holiday_hub`

**C. Docker (Development):**

```bash
docker run --name holiday-hub-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=holiday_hub \
  -p 5432:5432 -d postgres
```

**Environment Variable:**

```env
DATABASE_URL="postgresql://username:password@host:5432/holiday_hub?schema=public"
```

---

### 2. NextAuth Secret

**What it's for:** Secures JWT tokens and session data

**How to generate:**

```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

**Environment Variable:**

```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # Change to your domain in production
```

**⚠️ Important:**

- Use a different secret for each environment (dev, staging, production)
- Never commit this to version control
- In production, this should be a strong, unique secret

---

### 3. Resend (Email Notifications)

**What it's for:** Sends email notifications for holidays

**Setup Steps:**

1. **Sign up** at [resend.com](https://resend.com)
   - Free tier: 3,000 emails/month (plenty for personal use)

2. **Get API Key:**
   - Dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_`)

3. **Verify Domain (Production):**
   - Dashboard → Domains → Add Domain
   - Add DNS records to your domain provider
   - Verify domain

4. **For Development:**
   - Use the provided test domain: `onboarding@resend.dev`
   - Test emails will be delivered but may go to spam

**Environment Variables:**

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"
```

**For testing (no domain):**

```env
EMAIL_FROM="Holiday Hub <onboarding@resend.dev>"
```

**Cost:**

- Free: 3,000 emails/month
- Paid: $20/month for 50,000 emails

---

## 🔔 Optional Services (Enhanced Features)

### 4. Web Push Notifications (Browser Notifications)

**What it's for:** Sends browser push notifications as an alternative to email

**Setup Steps:**

1. **Generate VAPID Keys:**

```bash
npx web-push generate-vapid-keys
```

This will output:

```
Public Key: BOxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. **Add to Environment:**

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BOxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_PRIVATE_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_EMAIL="mailto:your-email@example.com"
```

**Notes:**

- The public key must start with `NEXT_PUBLIC_` to be accessible in the browser
- Use your actual contact email for `VAPID_EMAIL`
- Free to use, no external service required
- Users must grant browser permission for notifications

---

## 📋 Complete .env File Template

Create a `.env` file in your project root with all required values:

```env
# ============================================
# REQUIRED - Database
# ============================================
DATABASE_URL="postgresql://username:password@localhost:5432/holiday_hub?schema=public"

# ============================================
# REQUIRED - Authentication
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# ============================================
# REQUIRED - Email Notifications (Resend)
# ============================================
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"

# ============================================
# OPTIONAL - Browser Push Notifications
# ============================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BOxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_PRIVATE_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
VAPID_EMAIL="mailto:your-email@example.com"
```

---

## 🚀 Quick Setup Checklist

- [ ] Sign up for a PostgreSQL database (Neon/Supabase/Railway recommended)
- [ ] Copy `DATABASE_URL` to `.env`
- [ ] Generate `NEXTAUTH_SECRET` and add to `.env`
- [ ] Sign up for Resend and get API key
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] (Optional) Generate VAPID keys for push notifications
- [ ] Run `cp .env.example .env` and fill in values
- [ ] Run `npx prisma db push` to create database schema
- [ ] Run `npm run prisma:seed` to add holidays
- [ ] Run `npm run dev` to start the app

---

## 💰 Cost Breakdown

**For Development/Personal Use (FREE):**

- PostgreSQL: Free (Neon/Supabase free tier)
- Resend: Free (3,000 emails/month)
- Web Push: Free (no external service)
- Hosting: Free (Vercel free tier)

**Total: $0/month** 🎉

**For Production/High Volume:**

- PostgreSQL: $10-20/month (or free tier)
- Resend: $20/month (50,000 emails)
- Hosting: Free (Vercel) or $20/month (Vercel Pro)

**Total: ~$20-40/month**

---

## 🔒 Security Best Practices

1. **Never commit `.env` to version control**
   - Already added to `.gitignore`

2. **Use different secrets for each environment**
   - Dev, staging, and production should have unique secrets

3. **Rotate secrets periodically**
   - Change `NEXTAUTH_SECRET` every few months
   - Rotate API keys if compromised

4. **Use environment-specific API keys**
   - Separate Resend keys for dev/prod
   - Helps track usage and limit damage if leaked

5. **Enable 2FA on all accounts**
   - Neon/Supabase dashboard
   - Resend account
   - GitHub (where you deploy from)

---

## 🐛 Troubleshooting

**Database connection fails:**

- Verify `DATABASE_URL` format
- Check if database is running
- Test with: `npx prisma db push`

**Emails not sending:**

- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend dashboard
- Look at logs for error messages
- For dev, use `onboarding@resend.dev` as sender

**Push notifications not working:**

- Verify VAPID keys are correct
- Check browser permissions
- Ensure `NEXT_PUBLIC_` prefix on public key
- Clear browser cache and try again

---

## 📞 Support Links

- **PostgreSQL**: Contact your provider's support
- **Resend**: [support@resend.com](mailto:support@resend.com)
- **Web Push**: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- **NextAuth**: [next-auth.js.org](https://next-auth.js.org/)

---

## 🎉 You're All Set!

Once you have all the required API keys configured:

```bash
npm run dev
```

Visit **http://localhost:3000** and start tracking holidays! 🎊
