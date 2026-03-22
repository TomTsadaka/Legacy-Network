'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EntryCard from '@/components/EntryCard';
import { Search, Plus, Sparkles, Users } from 'lucide-react';

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
    { value: 'MILESTONE', label: '⭐ אבן דרך', color: 'from-purple-400 to-pink-400' },
    { value: 'DAILY_LIFE', label: '☀️ יומי', color: 'from-yellow-400 to-orange-400' },
    { value: 'SPECIAL_EVENT', label: '🎉 אירוע מיוחד', color: 'from-pink-400 to-red-400' },
    { value: 'HEALTH', label: '💊 בריאות', color: 'from-green-400 to-teal-400' },
    { value: 'EDUCATION', label: '📚 חינוך', color: 'from-blue-400 to-indigo-400' },
    { value: 'FAMILY', label: '👨‍👩‍👧‍👦 משפחה', color: 'from-orange-400 to-yellow-400' },
    { value: 'TRAVEL', label: '✈️ טיול', color: 'from-cyan-400 to-blue-400' },
    { value: 'OTHER', label: '🌈 אחר', color: 'from-gray-400 to-gray-500' },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 shadow-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="animate-bounce">🌟</span>
                ציר הזמן הקסום
              </h1>
              <p className="text-white/90 font-medium text-lg">
                {family.name} • {entries.length} זיכרונות מיוחדים ✨
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/family/members')}
                className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <span>המשפחה</span>
              </button>
              <button
                onClick={() => router.push('/entries/create')}
                className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span>זיכרון חדש</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="חפש זיכרון קסום... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 focus:border-white transition-all text-purple-900 placeholder-purple-400"
              />
            </div>

            {/* Child filter */}
            {children.length > 0 && (
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-4 py-3 border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 transition-all text-purple-900 font-medium"
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
              className="px-4 py-3 border-2 border-white/30 rounded-full bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-white/50 transition-all text-purple-900 font-medium"
            >
              <option value="">🌈 כל הקטגוריות</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce">📖</div>
            <p className="text-purple-600 font-bold text-2xl mb-4">
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
          <div className="space-y-6">
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
