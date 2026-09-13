'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  describeMorningCountdown,
  formatHebrewDate,
  MORNING_HOUR,
} from '@/lib/morning-countdown';

/** ממיר Date לפורמט של input type="date" (YYYY-MM-DD) לפי השעון המקומי */
function toInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** מחזיר את התאריך של היום + offset ימים בפורמט של input type="date" */
function dayOffsetValue(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toInputValue(date);
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="border-s border-stone-200 first:border-s-0">
      <div className="text-4xl sm:text-5xl font-extralight tabular-nums text-stone-900" dir="ltr">
        {value}
      </div>
      <div className="mt-2 text-xs tracking-wide text-stone-400">{label}</div>
    </div>
  );
}

const FIELD_CLASS =
  'w-full bg-transparent text-center text-lg text-stone-900 placeholder:text-stone-300 ' +
  'border-b border-stone-200 pb-2 outline-none transition-colors focus:border-stone-900';

export default function MorningCountdown() {
  const [dateInput, setDateInput] = useState('');
  const [title, setTitle] = useState('');
  const [now, setNow] = useState<Date | null>(null);

  // ברירת המחדל והשעון נקבעים רק בצד הלקוח כדי למנוע אי-התאמה בהידרציה
  useEffect(() => {
    setDateInput(toInputValue(new Date()));
    setNow(new Date());

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trimmedTitle = title.trim();

  // הכותרת מופיעה גם בלשונית הדפדפן, כך ש"הוספה למסך הבית" בטלפון
  // מציעה את שם הספירה כשם הקיצור
  useEffect(() => {
    const original = document.title;
    if (trimmedTitle) {
      document.title = `${trimmedTitle} | ספירה לאחור`;
    }
    return () => {
      document.title = original;
    };
  }, [trimmedTitle]);

  const result = useMemo(
    () => (now && dateInput ? describeMorningCountdown(dateInput, now, { includeSeconds: true }) : null),
    [dateInput, now]
  );

  const hasInvalidInput = dateInput.trim().length > 0 && now !== null && result === null;

  const quickPicks: Array<{ label: string; offset: number }> = [
    { label: 'היום', offset: 0 },
    { label: 'מחר', offset: 1 },
    { label: 'מחרתיים', offset: 2 },
    { label: 'בעוד שבוע', offset: 7 },
  ];

  return (
    <div className="w-full max-w-md mx-auto text-center" dir="rtl">
      <input
        id="countdown-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={60}
        placeholder="כותרת (לא חובה)"
        aria-label="כותרת לספירה"
        className={FIELD_CLASS}
      />

      <input
        id="target-date"
        type="date"
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
        aria-label="תאריך היעד"
        className={`${FIELD_CLASS} mt-8`}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {quickPicks.map((pick) => {
          const value = now ? dayOffsetValue(pick.offset) : '';
          const isActive = value !== '' && value === dateInput;
          return (
            <button
              key={pick.label}
              type="button"
              onClick={() => setDateInput(dayOffsetValue(pick.offset))}
              disabled={!now}
              className={`text-sm pb-1 border-b transition-colors disabled:opacity-40 ${
                isActive
                  ? 'text-stone-900 border-stone-900'
                  : 'text-stone-400 border-transparent hover:text-stone-900'
              }`}
            >
              {pick.label}
            </button>
          );
        })}
      </div>

      {hasInvalidInput && (
        <p className="mt-16 text-sm text-stone-500">התאריך שהוקש אינו תקין.</p>
      )}

      {!now && <p className="mt-16 text-sm text-stone-400">טוען…</p>}

      {result && (
        <div className="mt-16">
          {trimmedTitle && (
            <h2 className="text-2xl font-light text-stone-900 mb-6 break-words">{trimmedTitle}</h2>
          )}

          <p className="text-xs tracking-widest text-stone-400">
            {result.parts.isPast ? 'חלף לפני' : 'נותרו'}
          </p>

          <div className="mt-6 grid grid-cols-4">
            <Unit value={result.parts.days} label="ימים" />
            <Unit value={result.parts.hours} label="שעות" />
            <Unit value={result.parts.minutes} label="דקות" />
            <Unit value={result.parts.seconds} label="שניות" />
          </div>

          <div className="mx-auto mt-10 h-px w-10 bg-stone-200" />

          <p className="mt-10 text-sm leading-relaxed text-stone-500">
            {trimmedTitle ? `${trimmedTitle} – ${result.sentence}` : result.sentence}
          </p>

          {result.nextMorning && (
            <button
              type="button"
              onClick={() => setDateInput(toInputValue(result.nextMorning!))}
              className="mt-6 text-sm text-stone-400 underline underline-offset-4 transition-colors hover:text-stone-900"
            >
              ספירה עד {MORNING_HOUR}:00 של הבוקר הבא ({formatHebrewDate(result.nextMorning)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
