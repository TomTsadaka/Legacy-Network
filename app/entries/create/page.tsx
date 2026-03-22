'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';

export default function CreateEntryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mode: 'manual' or 'ai'
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  // Manual mode
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // AI mode
  const [aiEvent, setAiEvent] = useState('');
  const [aiFeeling, setAiFeeling] = useState('');
  const [aiDetails, setAiDetails] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Common fields
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('DAILY_LIFE');
  const [location, setLocation] = useState('');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [family, setFamily] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadFamily();
    }
  }, [status]);

  async function loadFamily() {
    try {
      const res = await fetch('/api/families');
      const data = await res.json();

      if (data.families && data.families.length > 0) {
        const primaryFamily = data.families[0];
        setFamily(primaryFamily);
        
        const childrenRes = await fetch(`/api/children?familyId=${primaryFamily.id}`);
        const childrenData = await childrenRes.json();
        setChildren(childrenData.children || []);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    }
  }

  async function generateWithAI() {
    console.log('[Frontend] generateWithAI called');
    console.log('[Frontend] aiEvent:', aiEvent);
    
    if (!aiEvent.trim()) {
      console.log('[Frontend] No event - setting error');
      setError('יש להזין מה קרה');
      return;
    }

    console.log('[Frontend] Starting generation...');
    setAiGenerating(true);
    setError('');

    try {
      const selectedChildName = selectedChildren.length > 0
        ? children.find(c => c.id === selectedChildren[0])?.name
        : undefined;

      const requestBody = {
        event: aiEvent,
        location: location || undefined,
        feeling: aiFeeling || undefined,
        details: aiDetails || undefined,
        childName: selectedChildName,
      };

      console.log('[Frontend] Request body:', requestBody);

      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('[Frontend] Response status:', res.status);

      const data = await res.json();
      console.log('[Frontend] Response data:', data);

      if (!res.ok) {
        console.log('[Frontend] Response not OK, throwing error');
        throw new Error(data.message || data.error || 'Failed to generate story');
      }

      console.log('[Frontend] Story generated successfully!');
      console.log('[Frontend] Story length:', data.story?.length);

      // Set the generated content
      setContent(data.story);
      setTitle(aiEvent.slice(0, 50) + (aiEvent.length > 50 ? '...' : ''));
      
      // Switch to manual mode to allow editing
      setMode('manual');
      
      // Clear AI fields
      setAiEvent('');
      setAiFeeling('');
      setAiDetails('');
      
      console.log('[Frontend] Switched to manual mode');
    } catch (err: any) {
      console.error('[Frontend] Error in generateWithAI:', err);
      console.error('[Frontend] Error message:', err.message);
      setError(err.message || 'משהו השתבש ביצירת הסיפור');
    } finally {
      console.log('[Frontend] Setting aiGenerating to false');
      setAiGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          eventDate,
          category,
          location: location || undefined,
          familyId: family.id,
          childrenIds: selectedChildren,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create entry');
      }

      router.push('/timeline');
    } catch (err: any) {
      setError(err.message || 'משהו השתבש');
    } finally {
      setLoading(false);
    }
  }

  function toggleChild(childId: string) {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  }

  if (status === 'loading' || !family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
          </div>
          <p className="text-blue-700 font-bold text-lg">מכין את הקסם...</p>
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
            onClick={() => router.push('/timeline')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-bold transition-all hover:gap-3"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לציר הזמן
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              זיכרון קסום חדש
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
          </div>
          <p className="text-blue-600 font-medium text-base md:text-lg">שתף רגע מיוחד שישאר לנצח! ✨</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 md:gap-3 mb-6">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 rounded-2xl border-3 font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
              mode === 'manual'
                ? 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white shadow-lg scale-105'
                : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
            }`}
          >
            <span className="text-xl md:text-2xl">✍️</span>
            <span>כתוב בעצמך</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 rounded-2xl border-3 font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
              mode === 'ai'
                ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-lg scale-105'
                : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
            }`}
          >
            <Wand2 className="w-5 h-5 md:w-6 md:h-6" />
            <span>כתוב עם AI</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 font-medium text-sm md:text-base mb-6">
            {error}
          </div>
        )}

        {/* AI Mode */}
        {mode === 'ai' ? (
          <div className="card-playful p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl border-2 border-purple-200">
              <h3 className="text-lg md:text-xl font-bold text-purple-700 mb-3 md:mb-4 flex items-center gap-2">
                <Wand2 className="w-6 h-6 md:w-8 md:h-8" />
                בוא נכתוב ביחד!
              </h3>
              <p className="text-purple-600 text-sm md:text-base">
                ענה על כמה שאלות קצרות, וה-AI יהפוך אותן לזיכרון מלא ומרגש ✨
              </p>
            </div>

            {/* AI: What happened? */}
            <div>
              <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                <span className="text-xl md:text-2xl">🌟</span>
                מה קרה? *
              </label>
              <input
                type="text"
                value={aiEvent}
                onChange={(e) => setAiEvent(e.target.value)}
                placeholder="למשל: עילאי עשה את הצעד הראשון"
                className="input-playful text-base md:text-lg"
              />
            </div>

            {/* Date & Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">📅</span>
                  תאריך
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="input-playful text-base md:text-lg"
                />
              </div>

              <div>
                <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">📍</span>
                  מיקום
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="למשל: בסלון"
                  className="input-playful text-base md:text-lg"
                />
              </div>
            </div>

            {/* Children */}
            {children.length > 0 && (
              <div>
                <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                  <span className="text-xl md:text-2xl">👶</span>
                  מי היה שם?
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

            {/* AI: Feeling */}
            <div>
              <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                <span className="text-xl md:text-2xl">💙</span>
                איך הרגשת?
              </label>
              <input
                type="text"
                value={aiFeeling}
                onChange={(e) => setAiFeeling(e.target.value)}
                placeholder="למשל: גאה, מרוגש, שמח"
                className="input-playful text-base md:text-lg"
              />
            </div>

            {/* AI: Details */}
            <div>
              <label className="block text-base md:text-lg font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2">
                <span className="text-xl md:text-2xl">📝</span>
                פרטים נוספים?
              </label>
              <textarea
                value={aiDetails}
                onChange={(e) => setAiDetails(e.target.value)}
                rows={3}
                placeholder="למשל: סבתא היתה שם, כולם צעקו מהתרגשות..."
                className="input-playful text-base md:text-lg resize-none"
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

            {/* Generate Button */}
            <button
              type="button"
              onClick={generateWithAI}
              disabled={aiGenerating || !aiEvent}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 md:py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base md:text-lg"
            >
              {aiGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 h-5 md:h-6 md:w-6 border-3 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">מייצר סיפור קסום...</span>
                  <span className="sm:hidden">מייצר...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 md:w-6 md:h-6" />
                  <span>צור סיפור עם AI!</span>
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Manual Mode */
          <form onSubmit={handleSubmit} className="card-playful p-4 md:p-8 space-y-4 md:space-y-6">
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
                placeholder="למשל: הצעד הראשון של עילאי ורוי! 👣"
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
                placeholder="כתוב את הזיכרון הקסום שלך כאן... 🌟"
                className="input-playful text-base md:text-lg resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs md:text-sm text-blue-600 font-medium">
                  {content.length} תווים
                </p>
                {content.length > 50 && (
                  <p className="text-xs md:text-sm text-green-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">נהדר! ממשיך ככה!</span>
                    <span className="sm:hidden">נהדר!</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary-playful text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 h-5 md:h-6 md:w-6 border-2 border-white border-t-transparent"></div>
                    שומר...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    שמור זיכרון קסום!
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push('/timeline')}
                className="btn-secondary-playful text-base md:text-lg"
              >
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Floating decorations */}
      <div className="fixed top-1/4 left-10 text-4xl md:text-6xl opacity-20 animate-float pointer-events-none hidden md:block">
        🎈
      </div>
      <div className="fixed bottom-1/4 right-10 text-4xl md:text-6xl opacity-20 animate-float pointer-events-none hidden md:block" style={{ animationDelay: '1.5s' }}>
        ⭐
      </div>
    </div>
  );
}
