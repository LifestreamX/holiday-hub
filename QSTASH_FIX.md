# QStash Production Fix Guide

## Problem

QStash works with ngrok (local) but fails with production URL because the signing keys aren't set in Vercel's environment variables.

## Solution Steps

### 1. Add Environment Variables to Vercel

Go to your Vercel project dashboard:

1. Navigate to **Settings** → **Environment Variables**
2. Add these variables (copy from your local `.env` file):

```
QSTASH_CURRENT_SIGNING_KEY=sig_7ipfNhkQ7nAJ6ANjjmHJ7195dCyu
QSTASH_NEXT_SIGNING_KEY=sig_7f98ng7HKBdDhKj23jVJv55d2oBk
```

**Important**: Make sure these are added to:

- ✅ **Production** environment
- ✅ **Preview** environment (optional but recommended)
- ✅ **Development** environment (optional)

### 2. Also Verify These Variables Are Set

While you're in Vercel environment variables, confirm these are also present:

```
NEXTAUTH_URL=https://holiday-hub.tyler-allen.com
NEXTAUTH_SECRET=(your secret)
DATABASE_URL=(your CockroachDB URL)
RESEND_API_KEY=(your Resend key)
EMAIL_FROM=Holiday Hub <noreply@tyler-allen.com>
```

**Critical**: `NEXTAUTH_URL` should be your production domain, NOT `http://localhost:3000`

### 3. Redeploy

After adding the environment variables:

- Vercel will automatically trigger a new deployment, OR
- Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

### 4. Test the Endpoint

Once deployed, test the endpoint:

```powershell
# Test that the endpoint is reachable (will return 401 without signature, which is expected)
curl -v https://holiday-hub.tyler-allen.com/api/cron/notify -X POST
```

You should see:

```json
{ "error": "Unauthorized - signature required" }
```

This means the endpoint is working and requiring signatures (correct behavior).

### 5. Check QStash Dashboard

1. Go to [console.upstash.com](https://console.upstash.com)
2. Navigate to **QStash** → **Schedules**
3. Find your scheduled job
4. Click on it to view logs
5. Look for recent delivery attempts - they should now show **200 OK** instead of errors

### 6. Monitor Logs

Check your Vercel deployment logs:

- Go to **Deployments** → click on the latest deployment → **Runtime Logs**
- You should see logs like:
  ```
  [notify] POST /api/cron/notify called
  [notify] Processing all users (default 100)
  [scheduler] Sending email for holiday: ...
  ```

---

## Why This Happened

- **Local/ngrok**: Uses your local `.env` file which has the signing keys → works
- **Production**: Vercel doesn't have access to your local `.env` file → keys are undefined → signature verification fails → 401 response

## Additional Improvements Made

I've also created:

1. A diagnostic endpoint at `/api/debug/qstash-config` to verify your setup
2. Cleaned up unnecessary body reading in the verification function
3. Added better error logging

---

## Quick Verification

After setting up the environment variables and redeploying, you can verify your configuration:

```powershell
# Check if config is correct (this is a development-only endpoint)
curl https://holiday-hub.tyler-allen.com/api/debug/qstash-config
```

This will show you which environment variables are configured (without revealing the actual keys).
