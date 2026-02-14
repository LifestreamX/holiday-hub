# 🎯 Quick Reference Card

## Essential Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Initialize database
npx prisma db push
npm run prisma:seed

# Development
npm run dev                 # Start dev server (http://localhost:3000)

# Production
npm run build              # Build for production
npm start                  # Start production server

# Database
npx prisma studio          # Visual database editor
npx prisma db push         # Push schema changes
npm run prisma:seed        # Seed holidays

# Scheduler
npm run scheduler          # Run notification scheduler manually

# Testing
npx tsc --noEmit          # Check TypeScript
npm run lint              # Run ESLint
```

---

## File Structure

```
app/
├── api/              # API routes
├── dashboard/        # Main dashboard
├── login/            # Login page
├── register/         # Registration
└── settings/         # User settings

components/           # React components
lib/                 # Utilities & services
prisma/              # Database schema & seed
```

---

## Key Features

✅ Email/password authentication  
✅ 19 US holidays pre-loaded  
✅ Email notifications (Resend)  
✅ Browser push notifications  
✅ Multiple reminder offsets  
✅ Timezone support  
✅ Dark mode UI  
✅ Mobile responsive

---

## API Endpoints

```
POST   /api/register          # Create account
POST   /api/auth/[...nextauth] # Login/logout
GET    /api/holidays          # Get all holidays
POST   /api/preferences       # Update holiday settings
GET    /api/user              # Get user info
PATCH  /api/user              # Update user settings
```

---

## Environment Variables

**Required:**

- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - JWT secret
- `RESEND_API_KEY` - Email API key
- `EMAIL_FROM` - Sender email

**Optional:**

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Push notifications
- `VAPID_PRIVATE_KEY` - Push notifications
- `VAPID_EMAIL` - Push contact email

---

## Database Models

- **User** - Email, password, timezone, countryCode
- **Holiday** - Name, description, calculation rules
- **UserHolidayPreference** - Per-user holiday settings
- **Notification** - Sent notification tracking
- **PushSubscription** - Browser push subscriptions

---

## Tech Stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
**Backend:** Next.js API Routes, Prisma ORM  
**Database:** PostgreSQL  
**Auth:** NextAuth.js  
**Email:** Resend  
**Push:** Web Push API  
**Scheduler:** node-cron

---

## Holiday Rule Types

**Fixed:** `{ month: 7, day: 4 }` → July 4th  
**Nth Weekday:** `{ month: 1, weekday: 1, nth: 3 }` → 3rd Monday of January  
**Calculated:** Easter algorithm → Dynamic date each year

---

## Quick Troubleshooting

**Can't connect to database:**

```bash
# Check connection
npx prisma db push

# Verify DATABASE_URL format
postgresql://user:pass@host:5432/dbname
```

**Emails not sending:**

- Verify RESEND_API_KEY
- Check domain verification
- Use test email in development

**Build fails:**

```bash
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript errors:**

```bash
npx prisma generate
rm -rf node_modules
npm install
```

---

## Useful Links

📚 [Full README](./README.md)  
🚀 [Setup Guide](./SETUP.md)  
🔑 [API Keys Setup](./API-KEYS-SETUP.md)  
📦 [Deployment Guide](./DEPLOYMENT.md)  
📊 [Project Summary](./PROJECT-SUMMARY.md)

---

## Support Resources

- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs)
- **NextAuth:** [next-auth.js.org](https://next-auth.js.org/)
- **Resend:** [resend.com/docs](https://resend.com/docs)
- **Tailwind:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Default Settings

**Timezone:** America/New_York  
**Country:** US  
**Reminder Time:** 08:00 (8 AM)  
**Delivery Method:** Email  
**Default Offsets:** [1] (1 day before)

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database created and seeded
- [ ] Domain verified in Resend
- [ ] Build succeeds
- [ ] Scheduler configured
- [ ] SSL certificate active
- [ ] Monitoring set up

---

Made with ❤️ using Next.js, TypeScript, Prisma & PostgreSQL
