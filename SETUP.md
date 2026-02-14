# Quick Setup Guide

Follow these steps to get Holiday Hub running:

## 1. Install Dependencies

```bash
npm install
```

This will install all required packages and automatically run `prisma generate`.

## 2. Set Up Database

### Option A: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create the database
createdb holiday_hub

# Update .env with your connection string
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/holiday_hub?schema=public"
```

### Option B: Docker PostgreSQL

```bash
docker run --name holiday-hub-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=holiday_hub -p 5432:5432 -d postgres
```

Then use:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/holiday_hub?schema=public"
```

### Option C: Cloud Database (Recommended)

Sign up for a free PostgreSQL database:

- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Generous free tier
- [Railway](https://railway.app) - Easy deployment

Copy your connection string to `.env`.

## 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your values:
# - DATABASE_URL (from step 2)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - RESEND_API_KEY (get from resend.com)
# - EMAIL_FROM (your verified email domain)
```

## 4. Initialize Database

```bash
# Push the schema to your database
npx prisma db push

# Seed with holidays
npm run prisma:seed
```

You should see: ✅ Seeded 19 holidays

## 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Create Your Account

1. Click "Sign Up"
2. Enter your email and password
3. Select your timezone
4. Login and start configuring holidays!

## Optional: Set Up Email Notifications

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use test domain for development)
3. Get your API key
4. Add to `.env`:
   ```
   RESEND_API_KEY="re_your_key_here"
   EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"
   ```

## Optional: Set Up Push Notifications

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Add to .env:
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_EMAIL="mailto:your@email.com"
```

## Troubleshooting

**"Module not found" errors:**

```bash
npm install
npx prisma generate
```

**Database connection errors:**

- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Test connection with: `npx prisma db push`

**TypeScript errors:**

- Restart VS Code TypeScript server
- Run: `npm install` and `npx prisma generate`

## Next Steps

- Run the scheduler: `npm run scheduler`
- Explore Prisma Studio: `npm run prisma:studio`
- Deploy to Vercel, Railway, or your preferred platform

Happy holiday tracking! 🎉
