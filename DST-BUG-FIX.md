# DST Bug Fix - Detailed Report

## Problem Summary

You reported that:
- ✅ **Test Holiday - Today** (offset 0): Emails working
- ✅ **Test Holiday - Tomorrow** (offset 1): Emails working  
- ❌ **Test Holiday - 1 Week** (offset 7): Emails NOT working
- ❌ **Test Holiday - 1 Month** (offset 30): Emails NOT working

All were configured for 9pm (21:00) notification time.

## Root Cause

**Daylight Saving Time (DST) bug in date calculation**

The scheduler calculates how many days until a holiday using the `getDaysBetween` function. This function was calculating the time difference in milliseconds and dividing by 24 hours, then using `Math.floor` to round down.

### The DST Problem

On **March 8, 2026**, clocks spring forward in the US:
- Before March 8: Eastern Standard Time (EST = UTC-5)
- After March 8: Eastern Daylight Time (EDT = UTC-4)

When calculating days between dates that cross a DST boundary:

**Example 1: Test Holiday - 1 Week**
- Today: March 4, 2026 at 00:00 EST = `2026-03-04T05:00:00.000Z` (5am UTC)
- Holiday: March 11, 2026 at 00:00 EDT = `2026-03-11T04:00:00.000Z` (4am UTC)
- **Time difference**: 6 days + 23 hours
- **Old calculation**: `Math.floor(6.958 days)` = **6 days** ❌
- **Expected**: 7 days
- **Result**: daysUntil (6) didn't match reminderOffset (7), so NO email sent

**Example 2: Test Holiday - 1 Month**
- Today: March 4, 2026 at 00:00 EST = `2026-03-04T05:00:00.000Z`
- Holiday: April 3, 2026 at 00:00 EDT = `2026-04-03T04:00:00.000Z`
- **Time difference**: 29 days + 23 hours
- **Old calculation**: `Math.floor(29.958 days)` = **29 days** ❌
- **Expected**: 30 days
- **Result**: daysUntil (29) didn't match reminderOffset (30), so NO email sent

## The Fix

Changed `getDaysBetween` to normalize both dates to UTC midnight before calculating the difference. This ensures calendar days are counted correctly, regardless of DST transitions.

### Before (Broken):
```typescript
export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / oneDay);  // ❌ DST breaks this
}
```

### After (Fixed):
```typescript
export function getDaysBetween(date1: Date, date2: Date): number {
  // Normalize both dates to UTC midnight to avoid DST issues
  const d1 = new Date(Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()));
  const d2 = new Date(Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()));
  
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = d2.getTime() - d1.getTime();
  
  // Use Math.round to handle any floating point precision issues
  return Math.round(diffTime / oneDay);  // ✅ DST-safe
}
```

## Verification

### Dry-Run Test Results (AFTER Fix):
```
Test Holiday - Today:     daysUntil = 0  ✅ matches offset [0]
Test Holiday - Tomorrow:  daysUntil = 1  ✅ matches offset [1]
Test Holiday - 1 Week:    daysUntil = 7  ✅ matches offset [7]  (WAS 6)
Test Holiday - 1 Month:   daysUntil = 30 ✅ matches offset [30] (WAS 29)
```

All test holidays now show **"WOULD SEND"** at the correct time!

### Comprehensive Tests Passed:
1. ✅ Simple case - no DST
2. ✅ Spring forward DST transition (March 8)
3. ✅ Across month boundary with DST
4. ✅ Fall back DST transition (November 1)
5. ✅ Current scenario (getStartOfDayInTimezone)

## Impact

This fix resolves notification failures for:
- **Any holiday** that crosses a DST boundary
- **All offset types**: 7-day, 30-day, and any custom offsets
- **Both spring forward** (March) and **fall back** (November) DST transitions
- **All US timezones** and other regions with DST

## What Happens Now

1. ✅ **All 4 test holidays** will now send emails at 9pm
2. ✅ **1-week before** reminders will work correctly
3. ✅ **1-month before** reminders will work correctly
4. ✅ **Real holidays** (Christmas, New Year, etc.) will send all reminder offsets

## Testing Instructions

### Option 1: Use Existing Test Holidays
Your test holidays are already configured:
- **Test Holiday - 1 Week** (March 11): Set for offset [7], time 21:00
- **Test Holiday - 1 Month** (April 3): Set for offset [30], time 21:00

Simply run the scheduler at 9pm and check your email:
```bash
npm run scheduler
```

Or trigger the cron endpoint:
```bash
curl -X POST https://holiday-hub.tyler-allen.com/api/cron/notify
```

### Option 2: Run Dry-Run Script
See which notifications would be sent without actually sending emails:
```bash
TEST_EMAIL_TO=your@email.com npx tsx scripts/dry-run-scheduler.ts
```

Look for:
```
[dry-run] Holiday: Test Holiday - 1 Week
[dry-run] INSIDE window — WOULD SEND (dry-run)
```

### Option 3: Run Comprehensive Offset Test
```bash
TEST_EMAIL_TO=your@email.com npx tsx scripts/test-all-offsets.ts
```

This will show detailed status of all test holidays and indicate which ones are ready to send.

## Files Changed

1. ✅ `lib/dateUtils.ts` - Fixed getDaysBetween function
2. ✅ `scripts/check-test-holidays.ts` - New diagnostic script
3. ✅ `scripts/check-user-prefs.ts` - New diagnostic script  
4. ✅ `scripts/test-dst-fix.ts` - Comprehensive DST test suite
5. ✅ `scripts/dry-run-scheduler.ts` - Enhanced logging

## Committed & Pushed

All changes have been committed and pushed to GitHub:
- Commit: `bd39220`
- Branch: `main`
- Message: "fix(critical): DST bug causing 1-week and 1-month notifications to fail"

The deployed app will now send all reminders correctly, including those that cross DST boundaries!

---

**Status**: ✅ **RESOLVED** - All notification offsets now work correctly with DST transitions.
