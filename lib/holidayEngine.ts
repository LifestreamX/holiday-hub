/**
 * Holiday Engine - Calculate holiday dates for any year
 */

import {
  calculateEaster,
  getNthWeekdayOfMonth,
  getLastWeekdayOfMonth,
} from './dateUtils';

export interface HolidayRule {
  id: string;
  name: string;
  ruleType: 'fixed' | 'nth_weekday' | 'calculated';
  month?: number; // 1-12
  day?: number; // 1-31
  weekday?: number; // 0-6 (0=Sunday)
  nth?: number; // 1-5 or -1 for last
}

/**
 * Calculate the actual date of a holiday for a specific year
 */
export function calculateHolidayDate(holiday: HolidayRule, year: number): Date {
  switch (holiday.ruleType) {
    case 'fixed':
      if (holiday.month === undefined || holiday.day === undefined) {
        throw new Error(`Fixed holiday ${holiday.name} missing month or day`);
      }
      return new Date(year, holiday.month - 1, holiday.day);

    case 'nth_weekday':
      if (
        holiday.month === undefined ||
        holiday.weekday === undefined ||
        holiday.nth === undefined
      ) {
        throw new Error(
          `Nth weekday holiday ${holiday.name} missing required fields`,
        );
      }

      if (holiday.nth === -1) {
        // Last occurrence
        return getLastWeekdayOfMonth(year, holiday.month, holiday.weekday);
      } else {
        // Nth occurrence
        return getNthWeekdayOfMonth(
          year,
          holiday.month,
          holiday.weekday,
          holiday.nth,
        );
      }

    case 'calculated':
      // Handle various calculated holidays
      const holidayNameLower = holiday.name.toLowerCase();

      if (holidayNameLower.includes('easter')) {
        return calculateEaster(year);
      }

      if (holidayNameLower.includes('good friday')) {
        const easter = calculateEaster(year);
        const goodFriday = new Date(easter);
        goodFriday.setDate(easter.getDate() - 2);
        return goodFriday;
      }

      if (
        holidayNameLower.includes('mardi gras') ||
        holidayNameLower.includes('fat tuesday')
      ) {
        // Mardi Gras is 47 days before Easter (Shrove Tuesday)
        const easter = calculateEaster(year);
        const mardiGras = new Date(easter);
        mardiGras.setDate(easter.getDate() - 47);
        return mardiGras;
      }

      if (holidayNameLower.includes('corpus christi')) {
        // Corpus Christi is 60 days after Easter
        const easter = calculateEaster(year);
        const corpusChristi = new Date(easter);
        corpusChristi.setDate(easter.getDate() + 60);
        return corpusChristi;
      }

      // For other calculated holidays, return null instead of throwing
      // This prevents the entire scheduler from crashing if a calculation is missing
      console.warn(
        `[holidayEngine] Unsupported calculation for holiday: ${holiday.name}`,
      );
      return null;

    default:
      console.warn(`[holidayEngine] Unknown rule type: ${holiday.ruleType}`);
      return null;
  }
}

/**
 * Get all holiday dates for a specific year
 */
export function getHolidayDatesForYear(
  holidays: HolidayRule[],
  year: number,
): Map<string, Date> {
  const holidayDates = new Map<string, Date>();

  for (const holiday of holidays) {
    try {
      const date = calculateHolidayDate(holiday, year);
      if (date) {
        holidayDates.set(holiday.id, date);
      }
    } catch (error) {
      console.error(`Error calculating date for ${holiday.name}:`, error);
    }
  }

  return holidayDates;
}

/**
 * Get upcoming holidays within a date range
 */
export function getUpcomingHolidays(
  holidays: HolidayRule[],
  startDate: Date,
  endDate: Date,
): Array<{ holiday: HolidayRule; date: Date }> {
  const result: Array<{ holiday: HolidayRule; date: Date }> = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  // Check holidays for each year in the range
  for (let year = startYear; year <= endYear; year++) {
    for (const holiday of holidays) {
      try {
        const date = calculateHolidayDate(holiday, year);
        if (date >= startDate && date <= endDate) {
          result.push({ holiday, date });
        }
      } catch (error) {
        console.error(`Error calculating date for ${holiday.name}:`, error);
      }
    }
  }

  // Sort by date
  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
}

/**
 * Calculate when to send notifications based on reminder offsets
 * @param holidayDate - The date of the holiday
 * @param reminderOffsets - Array of days before holiday to send reminders
 * @param reminderTime - Time of day to send (HH:MM format)
 * @returns Array of dates when notifications should be sent
 */
export function calculateNotificationDates(
  holidayDate: Date,
  reminderOffsets: number[],
  reminderTime: string,
): Date[] {
  const [hours, minutes] = reminderTime.split(':').map(Number);

  return reminderOffsets.map((offset) => {
    const notificationDate = new Date(holidayDate);
    notificationDate.setDate(notificationDate.getDate() - offset);
    notificationDate.setHours(hours, minutes, 0, 0);
    return notificationDate;
  });
}
