'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Sunrise, AlertCircle, ChevronLeft, Tag } from 'lucide-react';
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

interface UnitBoxProps {
  value: number;
  label: string;
  highlight?: boolean;
}

function UnitBox({ value, label, highlight = false }: UnitBoxProps) {
  return (
    <div
      className={`flex-1 min-w-[5rem] rounded-2xl border-3 px-3 py-4 text-center shadow-md transition-all ${
        highlight
          ? 'bg-gradient-to-b from-blue-500 to-cyan-500 border-blue-400 text-white'
          : 'bg-white/90 border-blue-200 text-blue-900'
      }`}
    >
      <div className="text-4xl sm:text-5xl font-black tabular-nums leading-none" dir="ltr">
        {value}
      </div>
      <div className={`mt-2 text-sm font-bold ${highlight ? 'text-blue-50' : 'text-blue-600'}`}>
        {label}
      </div>
    </div>
  );
}

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

  const result = useMemo(
    () => (now && dateInput ? describeMorningCountdown(dateInput, now, { includeSeconds: true }) : null),
    [dateInput, now]
  );

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

  const hasInvalidInput = dateInput.trim().length > 0 && now !== null && result === null;
  const todayValue = now ? toInputValue(now) : '';

  const quickPicks: Array<{ label: string; offset: number }> = [
    { label: 'היום', offset: 0 },
    { label: 'מחר', offset: 1 },
    { label: 'מחרתיים', offset: 2 },
    { label: 'בעוד שבוע', offset: 7 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      {/* כרטיס הקלט */}
      <div className="card-playful p-6 sm:p-8 mb-6">
        <label htmlFor="countdown-title" className="flex items-center gap-2 text-lg font-bold text-blue-900 mb-3">
          <Tag className="w-5 h-5 text-blue-500" />
          כותרת לספירה
          <span className="text-sm font-normal text-blue-400">(לא חובה)</span>
        </label>

        <input
          id="countdown-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          placeholder="למשל: הטיול לצפון"
          className="input-playful text-lg font-bold text-blue-900 mb-6"
        />

        <label htmlFor="target-date" className="flex items-center gap-2 text-lg font-bold text-blue-900 mb-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          בחרו תאריך
        </label>

        <input
          id="target-date"
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="input-playful text-lg font-bold text-blue-900"
          dir="ltr"
          aria-describedby="date-help"
        />

        <p id="date-help" className="mt-2 text-sm text-blue-600">
          נציג כמה ימים, שעות ודקות נותרו עד {MORNING_HOUR}:00 בבוקר באותו יום (שעון מקומי).
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPicks.map((pick) => {
            const value = now ? dayOffsetValue(pick.offset) : '';
            const isActive = value !== '' && value === dateInput;
            return (
              <button
                key={pick.label}
                type="button"
                onClick={() => setDateInput(dayOffsetValue(pick.offset))}
                disabled={!now}
                className={`badge-playful disabled:opacity-50 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50'
                }`}
              >
                {pick.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* שגיאת קלט */}
      {hasInvalidInput && (
        <div className="card-playful p-5 mb-6 border-amber-300 bg-amber-50/90 animate-shake">
          <div className="flex items-center gap-3 text-amber-800 font-bold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>התאריך שהוקש אינו תקין. נסו לבחור תאריך מהלוח.</span>
          </div>
        </div>
      )}

      {/* טעינה ראשונית (לפני שהשעון עלה בצד הלקוח) */}
      {!now && (
        <div className="card-playful p-8 text-center text-blue-600 font-bold">טוען את השעון…</div>
      )}

      {/* התוצאה */}
      {result && (
        <div className="card-playful p-6 sm:p-8">
          <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
            <Sunrise className="w-5 h-5 text-amber-500" />
            <span>
              היעד: {MORNING_HOUR}:00 בבוקר, {result.dateLabel}
            </span>
          </div>

          {trimmedTitle && (
            <h2 className="text-3xl sm:text-4xl font-black text-blue-900 mt-2 mb-1 break-words">
              {trimmedTitle}
            </h2>
          )}

          <p
            className={`text-2xl sm:text-3xl font-black mb-6 ${
              result.parts.isPast ? 'text-amber-700' : 'text-blue-900'
            }`}
          >
            {result.parts.isPast ? 'הזמן הזה כבר עבר' : 'נותרו'}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <UnitBox value={result.parts.days} label="ימים" highlight={!result.parts.isPast} />
            <UnitBox value={result.parts.hours} label="שעות" highlight={!result.parts.isPast} />
            <UnitBox value={result.parts.minutes} label="דקות" highlight={!result.parts.isPast} />
            <UnitBox value={result.parts.seconds} label="שניות" />
          </div>

          <p className="text-lg sm:text-xl font-bold text-blue-900 leading-relaxed">
            {trimmedTitle ? `${trimmedTitle} – ${result.sentence}` : result.sentence}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-blue-500">
            <Clock className="w-4 h-4" />
            <span>מתעדכן כל שנייה</span>
          </div>

          {/* אם 6:00 של אותו יום כבר עבר - קפיצה לבוקר הבא */}
          {result.nextMorning && (
            <button
              type="button"
              onClick={() => setDateInput(toInputValue(result.nextMorning!))}
              className="btn-primary-playful mt-6 inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              ספירה עד {MORNING_HOUR}:00 של הבוקר הבא ({formatHebrewDate(result.nextMorning)})
            </button>
          )}

          {todayValue && todayValue === dateInput && !result.parts.isPast && (
            <p className="mt-4 text-sm text-blue-600">זהו הבוקר של היום – עוד לא הגיעה השעה {MORNING_HOUR}:00.</p>
          )}
        </div>
      )}
    </div>
  );
}
