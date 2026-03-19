/**
 * Age Calculator - Calculate exact age in years, months, and days
 * Core feature for Legacy Network timeline
 */

import { differenceInYears, differenceInMonths, differenceInDays, addYears, addMonths } from 'date-fns';

export interface Age {
  years: number;
  months: number;
  days: number;
}

/**
 * Calculate exact age from birth date to a specific date
 * @param birthDate - Child's birth date
 * @param atDate - The date to calculate age at (defaults to today)
 * @returns Age object with years, months, and days
 */
export function calculateAge(birthDate: Date, atDate: Date = new Date()): Age {
  // Ensure dates are valid
  if (!(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth date');
  }
  if (!(atDate instanceof Date) || isNaN(atDate.getTime())) {
    throw new Error('Invalid reference date');
  }

  // Check if birth date is in the future
  if (birthDate > atDate) {
    throw new Error('Birth date cannot be in the future');
  }

  // Calculate years
  const years = differenceInYears(atDate, birthDate);
  const afterYears = addYears(birthDate, years);

  // Calculate months
  const months = differenceInMonths(atDate, afterYears);
  const afterMonths = addMonths(afterYears, months);

  // Calculate remaining days
  const days = differenceInDays(atDate, afterMonths);

  return { years, months, days };
}

/**
 * Format age as a human-readable string
 * @param age - Age object
 * @param short - Use short format (e.g., "3y 2m 5d")
 * @returns Formatted age string
 */
export function formatAge(age: Age, short: boolean = false): string {
  const { years, months, days } = age;

  if (short) {
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0) parts.push(`${days}d`);
    return parts.join(' ') || '0d';
  }

  // Long format
  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }

  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }

  return parts.join(', ') + ' old';
}

/**
 * Calculate age and return formatted string in one call
 * @param birthDate - Child's birth date
 * @param atDate - The date to calculate age at
 * @param short - Use short format
 * @returns Formatted age string
 */
export function getAgeString(
  birthDate: Date,
  atDate: Date = new Date(),
  short: boolean = false
): string {
  const age = calculateAge(birthDate, atDate);
  return formatAge(age, short);
}

/**
 * Check if today is a child's birthday
 * @param birthDate - Child's birth date
 * @returns True if today is the birthday
 */
export function isBirthdayToday(birthDate: Date): boolean {
  const today = new Date();
  return (
    today.getMonth() === birthDate.getMonth() &&
    today.getDate() === birthDate.getDate()
  );
}

/**
 * Get upcoming birthdays within the next N days
 * @param children - Array of children with birthDates
 * @param daysAhead - Number of days to look ahead (default: 30)
 * @returns Array of children with upcoming birthdays sorted by date
 */
export function getUpcomingBirthdays<T extends { birthDate: Date; name: string }>(
  children: T[],
  daysAhead: number = 30
): Array<T & { daysUntil: number; age: number }> {
  const today = new Date();
  const upcoming = children
    .map((child) => {
      const thisYear = new Date(
        today.getFullYear(),
        child.birthDate.getMonth(),
        child.birthDate.getDate()
      );

      const nextYear = new Date(
        today.getFullYear() + 1,
        child.birthDate.getMonth(),
        child.birthDate.getDate()
      );

      const nextBirthday = thisYear >= today ? thisYear : nextYear;
      const daysUntil = differenceInDays(nextBirthday, today);
      const age = differenceInYears(nextBirthday, child.birthDate);

      return {
        ...child,
        daysUntil,
        age,
      };
    })
    .filter((item) => item.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming;
}
