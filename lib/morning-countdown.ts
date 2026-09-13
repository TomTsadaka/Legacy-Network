/**
 * Morning Countdown - חישוב הזמן שנותר עד 6:00 בבוקר של תאריך נתון
 * מחזיר את הפירוק לימים/שעות/דקות ומנסח אותו בעברית תקנית.
 */

/** השעה שאליה סופרים (6:00 בבוקר) */
export const MORNING_HOUR = 6;

export interface CountdownParts {
  /** הפרש בשניות: חיובי = עוד לא הגיע, שלילי = כבר עבר */
  totalSeconds: number;
  /** true אם 6:00 של אותו תאריך כבר עבר */
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * ממיר קלט תאריך ל-Date מקומי בחצות
 * @param input מחרוזת בפורמט YYYY-MM-DD (הפורמט של input type="date") או Date
 * @returns Date מקומי, או null אם הקלט אינו תקין
 */
export function parseDateInput(input: string | Date): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime())
      ? null
      : new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  // דחיית תאריכים לא קיימים כמו 2026-02-31
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

/**
 * מחזיר את נקודת הזמן של 6:00 בבוקר באותו תאריך (בשעון המקומי)
 * @param input תאריך כמחרוזת YYYY-MM-DD או Date
 * @param hour שעת היעד (ברירת מחדל: 6)
 */
export function getMorningTarget(
  input: string | Date,
  hour: number = MORNING_HOUR
): Date | null {
  const date = parseDateInput(input);
  if (!date) return null;

  date.setHours(hour, 0, 0, 0);
  return date;
}

/**
 * מפרק את ההפרש בין "עכשיו" לנקודת היעד לימים, שעות, דקות ושניות
 * @param target נקודת היעד
 * @param now נקודת הייחוס (ברירת מחדל: כרגע)
 */
export function getCountdown(target: Date, now: Date = new Date()): CountdownParts {
  const totalSeconds = Math.trunc((target.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(totalSeconds);

  return {
    totalSeconds,
    isPast: totalSeconds < 0,
    days: Math.floor(absSeconds / 86400),
    hours: Math.floor((absSeconds % 86400) / 3600),
    minutes: Math.floor((absSeconds % 3600) / 60),
    seconds: absSeconds % 60,
  };
}

interface UnitForms {
  /** צורת היחיד, למשל "יום אחד" */
  one: string;
  /** צורת הזוגי, למשל "יומיים" */
  two: string;
  /** צורת הרבים ללא המספר, למשל "ימים" */
  many: string;
}

const DAY_FORMS: UnitForms = { one: 'יום אחד', two: 'יומיים', many: 'ימים' };
const HOUR_FORMS: UnitForms = { one: 'שעה אחת', two: 'שעתיים', many: 'שעות' };
const MINUTE_FORMS: UnitForms = { one: 'דקה אחת', two: 'שתי דקות', many: 'דקות' };
const SECOND_FORMS: UnitForms = { one: 'שנייה אחת', two: 'שתי שניות', many: 'שניות' };

/**
 * מנסח כמות בעברית עם התאמת יחיד/זוגי/רבים
 * @example hebrewUnit(1, DAY_FORMS) // "יום אחד"
 * @example hebrewUnit(2, DAY_FORMS) // "יומיים"
 * @example hebrewUnit(5, DAY_FORMS) // "5 ימים"
 */
function hebrewUnit(value: number, forms: UnitForms): string {
  if (value === 1) return forms.one;
  if (value === 2) return forms.two;
  return `${value} ${forms.many}`;
}

/**
 * מחבר רשימת ביטויים לרשימה עברית תקנית: "3 ימים, שעתיים ו-15 דקות"
 * לפני מספר נוספת מקף ("ו-15"), לפני מילה לא ("ושעתיים")
 */
function joinHebrewParts(parts: string[]): string {
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  const last = parts[parts.length - 1];
  const connector = /^\d/.test(last) ? 'ו-' : 'ו';
  return `${parts.slice(0, -1).join(', ')} ${connector}${last}`;
}

export interface FormatOptions {
  /** להוסיף גם שניות לניסוח (ברירת מחדל: false) */
  includeSeconds?: boolean;
}

/**
 * מנסח את הספירה לאחור בעברית: "נותרו 2 ימים, 5 שעות ו-13 דקות"
 * יחידות שערכן 0 מושמטות, אלא אם כל היחידות אפס.
 */
export function formatHebrewCountdown(
  parts: CountdownParts,
  options: FormatOptions = {}
): string {
  const { includeSeconds = false } = options;
  const phrases: string[] = [];

  if (parts.days > 0) phrases.push(hebrewUnit(parts.days, DAY_FORMS));
  if (parts.hours > 0) phrases.push(hebrewUnit(parts.hours, HOUR_FORMS));
  if (parts.minutes > 0) phrases.push(hebrewUnit(parts.minutes, MINUTE_FORMS));
  if (includeSeconds && parts.seconds > 0) {
    phrases.push(hebrewUnit(parts.seconds, SECOND_FORMS));
  }

  if (phrases.length === 0) {
    // פחות מדקה (או פחות משנייה) מההגעה ליעד
    return includeSeconds ? 'פחות משנייה' : 'פחות מדקה';
  }

  return joinHebrewParts(phrases);
}

/** מנסח תאריך בעברית: "יום ראשון, 13 בספטמבר 2026" */
export function formatHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** מנסח שעה בעברית: "6:00" */
export function formatHebrewTime(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export interface MorningCountdownResult {
  /** 6:00 בבוקר של התאריך שהוקש */
  target: Date;
  /** התאריך שהוקש בעברית */
  dateLabel: string;
  parts: CountdownParts;
  /** המשפט המלא בעברית */
  sentence: string;
  /** אם 6:00 כבר עבר – 6:00 של הבוקר הבא, אחרת null */
  nextMorning: Date | null;
}

/**
 * החישוב המלא: מתאריך שהוקש עד 6:00 בבוקר באותו יום, מנוסח בעברית
 * @param input תאריך כמחרוזת YYYY-MM-DD או Date
 * @param now נקודת הייחוס (ברירת מחדל: כרגע)
 * @param options אפשרויות ניסוח
 * @returns null אם התאריך אינו תקין
 */
export function describeMorningCountdown(
  input: string | Date,
  now: Date = new Date(),
  options: FormatOptions = {}
): MorningCountdownResult | null {
  const target = getMorningTarget(input);
  if (!target) return null;

  const parts = getCountdown(target, now);
  const dateLabel = formatHebrewDate(target);
  const duration = formatHebrewCountdown(parts, options);

  const sentence = parts.isPast
    ? `6:00 בבוקר ב${dateLabel} כבר עבר – לפני ${duration}`
    : `נותרו ${duration} עד 6:00 בבוקר ב${dateLabel}`;

  let nextMorning: Date | null = null;
  if (parts.isPast) {
    nextMorning = new Date(target);
    nextMorning.setDate(nextMorning.getDate() + 1);
    nextMorning.setHours(MORNING_HOUR, 0, 0, 0);
  }

  return { target, dateLabel, parts, sentence, nextMorning };
}
