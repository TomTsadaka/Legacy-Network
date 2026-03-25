'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EntryCard from '@/components/EntryCard';
import { Search, Plus, Sparkles, Users, LogOut, Trash2 } from 'lucide-react';

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [entries, setEntries] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadFamily();
    }
  }, [status]);

  useEffect(() => {
    if (family) {
      loadEntries();
    }
  }, [family, selectedChild, selectedCategory, searchQuery]);

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

  async function loadEntries() {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        familyId: family.id,
        limit: '50',
      });

      if (selectedChild) params.append('childId', selectedChild);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/entries?${params}`);
      const data = await res.json();

      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-purple-700 font-bold text-lg">טוען זיכרונות קסומים...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-playful p-8 text-center max-w-md">
          <div className="text-6xl mb-4 animate-bounce">🏠</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-4">
            בוא נתחיל!
          </h2>
          <p className="text-gray-600 mb-6">
            יש ליצור משפחה כדי להתחיל לשמור זיכרונות מדהימים
          </p>
          <button
            onClick={() => router.push('/families/create')}
            className="btn-primary-playful"
          >
            צור משפחה חדשה ✨
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'MILESTONE', label: '⭐ אבן דרך', color: 'from-blue-400 to-indigo-500' },
    { value: 'DAILY_LIFE', label: '☀️ יומי', color: 'from-sky-400 to-blue-400' },
    { value: 'SPECIAL_EVENT', label: '🎉 אירוע מיוחד', color: 'from-cyan-400 to-blue-500' },
    { value: 'HEALTH', label: '💊 בריאות', color: 'from-teal-400 to-cyan-500' },
    { value: 'EDUCATION', label: '📚 חינוך', color: 'from-blue-500 to-indigo-600' },
    { value: 'FAMILY', label: '👨‍👩‍👧‍👦 משפחה', color: 'from-indigo-400 to-blue-500' },
    { value: 'TRAVEL', label: '✈️ טיול', color: 'from-cyan-500 to-sky-500' },
    { value: 'OTHER', label: '🌈 אחר', color: 'from-slate-400 to-blue-400' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="animate-bounce text-2xl md:text-3xl">🌟</span>
              ציר הזמן הקסום
            </h1>
            <p className="text-white/90 font-medium text-sm md:text-lg">
              {family.name} • {entries.length} זיכרונות מיוחדים ✨
            </p>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex gap-2 md:gap-3 mb-4 flex-wrap">
            <button
              onClick={() => router.push('/family/members')}
              className="flex-1 md:flex-none bg-white text-blue-600 font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <span className="text-xl md:text-2xl">👨‍👩‍👧‍👦</span>
              <span className="hidden sm:inline">המשפחה</span>
            </button>
            <button
              onClick={() => router.push('/entries/create')}
              className="flex-1 md:flex-none bg-white text-blue-600 font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6" />
              <span>זיכרון חדש</span>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 hidden sm:inline" />
            </button>
            <button
              onClick={() => router.push('/trash')}
              className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base border-2 border-white/30"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">סל מחזור</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="md:mr-auto bg-white/20 hover:bg-white/30 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base border-2 border-white/30"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">התנתק</span>
            </button>
          </div>

          {/* Filters - Responsive */}
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <input
                type="text"
                placeholder="חפש זיכרון קסום... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 md:py-3 text-sm md:text-base border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 focus:border-white transition-all text-blue-900 placeholder-blue-400"
              />
            </div>

            {/* Filters row */}
            <div className="flex gap-2">
              {/* Child filter */}
              {children.length > 0 && (
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 transition-all text-blue-900 font-medium"
                >
                  <option value="">👶 כל הילדים</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 transition-all text-blue-900 font-medium"
              >
                <option value="">🌈 קטגוריות</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {entries.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-bounce">📖</div>
            <p className="text-blue-600 font-bold text-xl md:text-2xl mb-4 px-4">
              {searchQuery || selectedChild || selectedCategory
                ? 'לא נמצאו זיכרונות מתאימים 🔍'
                : 'עדיין אין זיכרונות קסומים 🌟'}
            </p>
            {!searchQuery && !selectedChild && !selectedCategory && (
              <button
                onClick={() => router.push('/entries/create')}
                className="btn-primary-playful mt-4"
              >
                צור את הזיכרון הראשון! ✨
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <EntryCard
                  entry={entry}
                  onClick={() => router.push(`/entries/${entry.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating decorations */}
      <div className="fixed top-20 left-10 text-6xl opacity-20 animate-float pointer-events-none">
        🎈
      </div>
      <div className="fixed bottom-20 right-10 text-6xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
        ⭐
      </div>
    </div>
  );
}
