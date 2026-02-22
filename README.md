
# Holiday Hub

A full-stack Holiday Notification Dashboard built with Next.js, TypeScript, Prisma, and CockroachDB.

## Features

- 🔐 **Email/Password Authentication** with NextAuth
- 📅 **Comprehensive Holiday Database** - All US federal holidays + major cultural holidays
- ⚙️ **Smart Holiday Engine** - Handles fixed dates, nth weekday calculations, and Easter
- 🔔 **Multi-Channel Notifications** - Email (Resend) and Browser Push notifications
- ⏰ **Customizable Reminders** - Set multiple reminder offsets (30 days, 7 days, 1 day, etc.)
- 🌍 **Timezone Support** - Notifications respect user timezone
- 🌙 **Dark Mode** - Beautiful UI with Tailwind CSS
- 📊 **User Dashboard** - Manage all holiday preferences in one place

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: CockroachDB (Cloud or local)
- **Authentication**: NextAuth.js
- **Email**: Resend API
- **Push Notifications**: Web Push API
- **Scheduler**: node-cron

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- PostgreSQL database
- A Resend account (for email notifications)

## Installation

### 1. Clone the repository

```bash
cd holiday-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# Database - Replace with your CockroachDB connection string
DATABASE_URL="postgresql://username:password@host:26257/holidayhub?sslmode=verify-full"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Resend API (for email notifications)
# Sign up at https://resend.com and get your API key
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Email sender - Use your domain after configuring it in Resend
EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"

# Web Push (Optional - for browser notifications)
# Generate VAPID keys: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:your-email@example.com"
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with holidays
npm run prisma:seed
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Database Setup

### CockroachDB Setup

You can use [CockroachDB Cloud](https://cockroachlabs.cloud/) or run CockroachDB locally.
Update your `DATABASE_URL` in `.env` with the connection string provided by CockroachDB Cloud or your local instance.

## External Services Setup

### Resend (Email Notifications)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their testing domain for development)
3. Get your API key from the dashboard
4. Add to `.env`:
   ```env
   RESEND_API_KEY="re_your_api_key"
   EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"
   ```

### Web Push Notifications (Optional)

1. Generate VAPID keys:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. Add to `.env`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_key"
   VAPID_PRIVATE_KEY="your_private_key"
   VAPID_EMAIL="mailto:your-email@example.com"
   ```

## Running the Scheduler

The notification scheduler runs daily to send holiday reminders. You can run it:

**Development (manually):**

```bash
npm run scheduler
```

**Production:**
Set up a cron job or use a service like:

- **Vercel Cron** (if deployed on Vercel)
- **GitHub Actions** with scheduled workflows
- **Upstash Qstash** for serverless cron jobs
- A separate server running `npm run scheduler`

## Prisma Commands

```bash
# Open Prisma Studio to view/edit data
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Re-seed database
npm run prisma:seed
```

## Project Structure

```
holiday-hub/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── holidays/        # Holiday data
│   │   ├── preferences/     # User preferences
│   │   ├── register/        # User registration
│   │   └── user/            # User settings
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── settings/            # Settings page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── HolidayCard.tsx
│   └── HolidaySettingsModal.tsx
├── lib/                     # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── holidayEngine.ts    # Holiday calculations
│   ├── dateUtils.ts        # Date utilities
│   ├── emailService.ts     # Email sending
│   ├── pushService.ts      # Push notifications
│   └── scheduler.ts        # Cron job scheduler
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
└── types/                  # TypeScript definitions
```

## Usage

1. **Register** an account with your email, password, and timezone
2. **Login** to access your dashboard
3. **Browse holidays** and enable the ones you want notifications for
4. **Configure reminders** - Click settings on any holiday to:
   - Choose when to be reminded (1 day, 7 days, 30 days before, etc.)
   - Set the time of day for notifications
   - Select delivery method (email, push, or both)
5. **Sit back** and receive timely holiday reminders!

### Registration & Security

- The registration form includes robust client- and server-side validation.
- Passwords are hashed with bcrypt (12 rounds) before being saved to the database.
- All user input is validated with Zod on the server.

## API Keys & Secrets Required

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `RESEND_API_KEY` - From resend.com (required for email)
- `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` - For push notifications (optional)

## Security Notes

- Never commit your `.env` file
- Always use strong passwords
- Use environment-specific secrets
- In production, use a secure `NEXTAUTH_SECRET`
- Validate all user inputs (already implemented with Zod)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Don't forget to:

- Set up your production database
- Configure Resend with your production domain
- Set up Vercel Cron for the scheduler

### Other Platforms

Compatible with any Node.js hosting:

- Railway
- Render
- Fly.io
- AWS/GCP/Azure

## Troubleshooting

**Database connection issues:**

- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npx prisma db push` to sync schema

**Email not sending:**

- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend dashboard
- For development, use Resend's test domain

**TypeScript errors:**

- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma Client
- Restart your TypeScript server in VS Code

---


