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
npm run scheduler
**Production:**
Set up a cron job or use a service like:

## Prisma Commands
# Open Prisma Studio to view/edit data
npm run prisma:studio

# Create a new migration

# Holiday Hub

A full-stack holiday notification dashboard.

## Quick Start

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your secrets (see below)
4. Run `npx prisma generate && npx prisma db push && npm run prisma:seed`
5. Start the app: `npm run dev`

## .env Example

```
DATABASE_URL="postgresql://username:password@host:26257/holidayhub?sslmode=verify-full"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="Holiday Hub <notifications@yourdomain.com>"
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:your-email@example.com"
```

## Usage

- Register an account
- Login to your dashboard
- Enable holidays and set reminders

## Security

- Passwords are hashed with bcrypt before saving
- All user input is validated on the server

## Security Notes

- Never commit your `.env` file
- Always use strong passwords
- Use environment-specific secrets
- In production, use a secure `NEXTAUTH_SECRET`
- Validate all user inputs (already implemented with Zod)

---
