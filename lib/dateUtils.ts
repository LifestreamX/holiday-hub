/**
 * Date utility functions for holiday calculations
 */
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

/**
 * Calculate the date of Easter Sunday for a given year
 * Uses the Anonymous Gregorian algorithm
 */
export function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Calculate the nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (1-12)
 * @param weekday - Day of week (0=Sunday, 6=Saturday)
 * @param nth - Which occurrence (1-5)
 */
export function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
): Date {
  // Start with the first day of the month
  const date = new Date(year, month - 1, 1);

  // Find the first occurrence of the desired weekday
  const firstWeekday = date.getDay();
  let daysUntilWeekday = (weekday - firstWeekday + 7) % 7;

  // Move to the first occurrence
  date.setDate(1 + daysUntilWeekday);

  // Move to the nth occurrence
  date.setDate(date.getDate() + (nth - 1) * 7);

  // Check if we've gone into the next month
  if (date.getMonth() !== month - 1) {
    throw new Error(
      `No ${nth}th occurrence of weekday ${weekday} in month ${month}`,
    );
  }

  return date;
}

/**
 * Get the last occurrence of a weekday in a month
 * Useful for holidays like "Last Monday of May"
 */
export function getLastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
): Date {
  // Start with the last day of the month
  const date = new Date(year, month, 0);
  const lastDay = date.getDate();

  // Find the last occurrence of the desired weekday
  for (let day = lastDay; day >= 1; day--) {
    date.setDate(day);
    if (date.getDay() === weekday) {
      return new Date(year, month - 1, day);
    }
  }

  throw new Error(`No ${weekday} found in month ${month}`);
}

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the number of days between two dates
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / oneDay);
}

/**
 * Convert time string (HH:MM) and timezone to a full Date object for today
 */
export function getDateWithTimeInTimezone(
  timeString: string,
  timezone: string,
  baseDate?: Date,
): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = baseDate || new Date();

  // Create a date string in the user's timezone
  const dateString = date.toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [month, day, year] = dateString.split('/');

  // Build a Date representing midnight in the user's timezone then set time
  const zonedMidnight = new Date(`${year}-${month}-${day}T00:00:00`);
  // Interpret that midnight as being in the provided timezone and convert to UTC
  const utcDate = zonedTimeToUtc(zonedMidnight, timezone);
  // Set hours/minutes in UTC equivalent
  utcDate.setUTCHours(hours, minutes, 0, 0);
  return utcDate;
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Get the start of day in a specific timezone
 */
export function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  // Convert the incoming date to the target timezone, then take its local
  // date components and convert that midnight back to a UTC Date so the
  // returned Date represents the start of day in the user's timezone.
  const zoned = utcToZonedTime(date, timezone);
  zoned.setHours(0, 0, 0, 0);
  return zonedTimeToUtc(zoned, timezone);
}

/**
 * Create a date from year/month/day components in a specific timezone
 * This ensures the date is interpreted as being in the user's timezone,
 * not the server's local timezone.
 */
export function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  timezone: string,
): Date {
  // Create a date string representing midnight in YYYY-MM-DD format
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  const dateStr = `${year}-${paddedMonth}-${paddedDay}T00:00:00`;

  // Create a Date object (will be in server's local time, but we only care about components)
  const localDate = new Date(dateStr);

  // Interpret those date components as being in the target timezone and get UTC equivalent
  return zonedTimeToUtc(localDate, timezone);
}
