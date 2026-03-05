# Notification System Fixes - Summary

## Issues Fixed

### 1. Enable-All API Error (500)

**Problem**: The enable-all API endpoint was throwing a "country is not defined" error.

**Root Cause**: The `country` variable was scoped inside the else block, but the logger tried to access it outside that scope.

**Fix**: Declared `country` at the function level and set it properly in both branches (ALL vs specific country).

**Files Changed**:

- `app/api/preferences/enable-all/route.ts`

---

### 2. Toggle UI Update After Enable-All

**Problem**: After clicking "Enable notifications for all", the UI didn't update to show toggles as enabled without a full page refresh.

**Root Cause**:

1. The enable-all handler was calling `fetchHolidays()` without passing the country parameter
2. The optimistic update wasn't including all necessary fields

**Fix**:

1. Updated the handler to pass `countryParam` to `fetchHolidays()`
2. Added all preference fields to optimistic update (reminderOffsets, reminderTime)
3. Added a retry fetch with 500ms delay to handle DB replication lag

**Files Changed**:

- `app/dashboard/page.tsx`

---

### 3. Enable-All Button for ALL Countries

**Problem**: When viewing "ALL" countries, the button text was unclear.

**Fix**: Updated button text to show total holiday count when "ALL" is selected, and specific country name otherwise.

**Files Changed**:

- `app/dashboard/page.tsx`

---

### 4. Critical: Notification Offset Deduplication Bug

**Problem**: Only ONE reminder could be sent per holiday, preventing multiple notifications at different offsets (e.g., 7 days before AND 1 day before).

**Root Cause**: The notification deduplication logic checked for existing notifications by:

- userId
- holidayId
- scheduledFor
- sent = true

But did NOT check which offset (reminder) was sent. So after sending the 7-day reminder, the system thought it had already sent notifications for that holiday and skipped the 1-day and day-of reminders.

**Fix**:

1. Added `offset` field to the Notification model in the database schema
2. Updated scheduler to include offset when checking for existing notifications
3. Updated scheduler to save offset when creating notifications
4. Created and applied database migration

**Files Changed**:

- `prisma/schema.prisma`
- `lib/scheduler.ts`

**Migration Created**:

- `20260304223108_add_offset_to_notifications`

---

### 5. Test Holidays for Proper Offset Testing

**Problem**: Only had one test holiday (today), making it difficult to test different reminder offsets.

**Fix**: Created a script that generates 4 test holidays:

- **Test Holiday - Today**: For day-of (offset 0) testing
- **Test Holiday - Tomorrow**: For 1-day-before (offset 1) testing
- **Test Holiday - 1 Week**: For 7-days-before (offset 7) testing
- **Test Holiday - 1 Month**: For 30-days-before (offset 30) testing

These holidays are automatically dated based on the current date, so they're always correct for testing.

**Files Created**:

- `scripts/add-test-holidays.ts`

**To Run**: `npx tsx scripts/add-test-holidays.ts`

---

## How to Test the Notification System

### Prerequisites

1. Make sure you have a user account with verified email
2. Set your timezone in settings
3. Run the test holiday script: `npx tsx scripts/add-test-holidays.ts`

### Test Procedure

#### Test 1: Day-of Notification (Offset 0)

1. Navigate to the dashboard
2. Find "Test Holiday - Today" (should be visible)
3. Click the settings icon
4. Enable notifications
5. Select "Day of" as the reminder offset
6. Set "Reminder Time" to 2-3 minutes in the future (e.g., if it's 3:45 PM, set to 3:47 PM)
7. Save settings
8. Wait for the scheduled time
9. Check your email inbox - you should receive a reminder

#### Test 2: 1-Day-Before Notification (Offset 1)

1. Find "Test Holiday - Tomorrow"
2. Click settings
3. Enable notifications
4. Select "1 day before" as the reminder offset
5. Set "Reminder Time" to current time or near future
6. Save settings
7. Run the scheduler: `npm run scheduler` or wait for cron job
8. Check email - you should receive a "1 day before" reminder

#### Test 3: 7-Days-Before Notification (Offset 7)

1. Find "Test Holiday - 1 Week"
2. Click settings
3. Enable notifications
4. Select "1 week before" as the reminder offset
5. Set "Reminder Time" to current time or near future
6. Save settings
7. Run the scheduler
8. Check email for "7 days before" reminder

#### Test 4: 30-Days-Before Notification (Offset 30)

1. Find "Test Holiday - 1 Month"
2. Click settings
3. Enable notifications
4. Select "1 month before" as the reminder offset
5. Set "Reminder Time" to current time or near future
6. Save settings
7. Run the scheduler
8. Check email for "30 days before" reminder

#### Test 5: Multiple Offsets for Same Holiday

1. Pick any test holiday (e.g., "Test Holiday - 1 Week")
2. Enable notifications
3. Select MULTIPLE offsets: "1 week before" AND "1 day before" AND "Day of"
4. Set reminder time
5. Save settings
6. As each date approaches, run the scheduler
7. Verify you receive separate emails for EACH offset

**Important**: This test verifies the offset deduplication fix. Previously, only the first reminder would send.

---

## Scheduler Time Window

The scheduler uses a time window to determine if it should send notifications. By default:

- `SCHEDULER_WINDOW_MINUTES=15` (15 minutes)
- If current time is within 15 minutes of the reminder time, send the notification
- Otherwise, skip

**Example**:

- Reminder time: 8:00 AM
- Current time: 8:10 AM
- Difference: 10 minutes
- Result: SEND (within 15-minute window)

**Example 2**:

- Reminder time: 8:00 AM
- Current time: 3:00 PM
- Difference: 7 hours
- Result: SKIP (outside window)

You can adjust this in your `.env` file:

```
SCHEDULER_WINDOW_MINUTES=30
```

---

## Dry-Run Scheduler

To test the scheduler logic WITHOUT sending emails, use the dry-run script:

```bash
TEST_EMAIL_TO=your@email.com npx tsx scripts/dry-run-scheduler.ts
```

This will:

1. Load all enabled holidays for the specified user
2. Calculate dates and offsets
3. Check if notifications would be sent
4. Print detailed logs WITHOUT actually sending emails

**Look for this output**:

```
[dry-run] INSIDE window — WOULD SEND (dry-run)
```

This confirms the logic is working correctly for that holiday.

---

## Database Schema Changes

The Notification model now includes an `offset` field:

```prisma
model Notification {
  id           String    @id @default(cuid())
  userId       String
  holidayId    String
  scheduledFor DateTime
  offset       Int       @default(0)  // NEW FIELD
  sent         Boolean   @default(false)
  sentAt       DateTime?
  deliveryType String
  createdAt    DateTime  @default(now())
  holiday      Holiday   @relation(fields: [holidayId], references: [id], onDelete: Cascade)
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

This allows the system to track which specific reminder (offset) was sent for each holiday.

---

## Summary

All issues have been fixed:

- ✅ Enable-all API 500 error
- ✅ Toggle UI not updating after enable-all
- ✅ Enable-all button text for ALL countries
- ✅ **CRITICAL**: Notification offset deduplication bug (multiple reminders now work)
- ✅ Test holidays created for proper testing

The notification system should now work correctly for:

- Day-of reminders (offset 0)
- 1-day-before reminders (offset 1)
- 1-week-before reminders (offset 7)
- 1-month-before reminders (offset 30)
- Multiple reminders for the same holiday

No further action required from your side - everything is fixed and ready to test!
