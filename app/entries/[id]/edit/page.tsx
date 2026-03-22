'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Sparkles, ArrowRight, Save } from 'lucide-react';

export default function EditEntryPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('DAILY_LIFE');
  const [location, setLocation] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadEntry();
    }
  }, [status, id]);

  async function loadEntry() {
    try {
      // Load entry
      const entryRes = await fetch(`/api/entries/${id}`);
      const entryData = await entryRes.json();

      if (!entryRes.ok) {
        throw new Error(entryData.error);
      }

      const entry = entryData.entry;
      setTitle(entry.title);
      setContent(entry.content);
      setEventDate(new Date(entry.eventDate).toISOString().split('T')[0]);
      setCategory(entry.category);
      setLocation(entry.location || '');
      
      // Load children
      const childrenRes = await fetch(`/api/children?familyId=${entry.family.id}`);
      const childrenData = await childrenRes.json();
      setChildren(childrenData.children || []);

      // Set selected children
      if (entry.children) {
        setSelectedChildren(entry.children.map((c: any) => c.id));
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      router.push(`/entries/${id}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          eventDate,
          category,
          location: location || undefined,
          childrenIds: selectedChildren,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update entry');
      }

      router.push(`/entries/${id}`);
    } catch (err: any) {
      setError(err.message || 'משהו השתבש');
    } finally {
      setSaving(false);
    }
  }

  function toggleChild(childId: string) {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
          </div>
          <p className="text-blue-700 font-bold text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'MILESTONE', label: 'אבן דרך', emoji: '⭐', color: 'from-purple-400 to-pink-400' },
    { value: 'DAILY_LIFE', label: 'יומי', emoji: '☀️', color: 'from-yellow-400 to-orange-400' },
    { value: 'SPECIAL_EVENT', label: 'אירוע מיוחד', emoji: '🎉', color: 'from-pink-400 to-red-400' },
    { value: 'HEALTH', label: 'בריאות', emoji: '💊', color: 'from-green-400 to-teal-400' },
    { value: 'EDUCATION', label: 'חינוך', emoji: '📚', color: 'from-blue-400 to-indigo-400' },
    { value: 'FAMILY', label: 'משפחה', emoji: '👨‍👩‍👧‍👦', color: 'from-orange-400 to-yellow-400' },
    { value: 'TRAVEL', label: 'טיול', emoji: '✈️', color: 'from-cyan-400 to-blue-400' },
    { value: 'OTHER', label: 'אחר', emoji: '🌈', color: 'from-gray-400 to-gray-500' },
  ];

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push(`/entries/${id}`)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-bold transition-all hover:gap-3"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לזיכרון
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              עריכת זיכרון
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-blue-600 font-medium text-base md:text-lg">ערוך את הזיכרון שלך ✏️</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-playful p-4 md:p-8 space-y-4 md:space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 font-medium text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-xl md:text-2xl">✨</span>
              כותרת הזיכרון *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-playful text-base md:text-lg"
            />
          </div>

          {/* Event Date */}
          <div>
            <label htmlFor="eventDate" className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-xl md:text-2xl">📅</span>
              תאריך האירוע *
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="input-playful text-base md:text-lg"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-xl md:text-2xl">🏷️</span>
              קטגוריה
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 md:p-4 rounded-2xl border-3 font-bold transition-all text-xs md:text-sm ${
                    category === cat.value
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                      : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl md:text-3xl mb-1">{cat.emoji}</div>
                  <div>{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Children */}
          {children.length > 0 && (
            <div>
              <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                <span className="text-xl md:text-2xl">👶</span>
                תייג ילדים
              </label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child.id)}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-full border-3 font-bold transition-all text-sm md:text-base ${
                      selectedChildren.includes(child.id)
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 border-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white border-blue-300 text-blue-700 hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    👶 {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-xl md:text-2xl">📍</span>
              מיקום (אופציונלי)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="למשל: פארק הירקון, תל אביב 🌳"
              className="input-playful text-base md:text-lg"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-xl md:text-2xl">📖</span>
              ספר לנו על הרגע המיוחד *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className="input-playful text-base md:text-lg resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs md:text-sm text-blue-600 font-medium">
                {content.length} תווים
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary-playful text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 h-5 md:h-6 md:w-6 border-2 border-white border-t-transparent"></div>
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  שמור שינויים
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/entries/${id}`)}
              className="btn-secondary-playful text-base md:text-lg"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
