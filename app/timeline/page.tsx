'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MemoryCard from '@/components/MemoryCard';
import { Search, Filter, Plus } from 'lucide-react';

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [memories, setMemories] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load family data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadFamily();
    }
  }, [status]);

  // Load memories when filters change
  useEffect(() => {
    if (family) {
      loadMemories();
    }
  }, [family, selectedChild, selectedCategory, searchQuery]);

  async function loadFamily() {
    try {
      const res = await fetch('/api/families');
      const data = await res.json();

      if (data.families && data.families.length > 0) {
        const primaryFamily = data.families[0];
        setFamily(primaryFamily);
        
        // Load children
        const childrenRes = await fetch(`/api/children?familyId=${primaryFamily.id}`);
        const childrenData = await childrenRes.json();
        setChildren(childrenData.children || []);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    }
  }

  async function loadMemories() {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        familyId: family.id,
        limit: '50',
      });

      if (selectedChild) params.append('childId', selectedChild);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();

      setMemories(data.memories || []);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען זיכרונות...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            אין משפחה פעילה
          </h2>
          <p className="text-gray-600 mb-6">
            יש ליצור משפחה כדי להתחיל לשמור זיכרונות
          </p>
          <button
            onClick={() => router.push('/families/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            צור משפחה חדשה
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'MILESTONE', label: 'אבן דרך' },
    { value: 'DAILY', label: 'יומי' },
    { value: 'SPECIAL', label: 'מיוחד' },
    { value: 'ACHIEVEMENT', label: 'הישג' },
    { value: 'FUNNY', label: 'מצחיק' },
    { value: 'EMOTIONAL', label: 'רגשי' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ציר הזמן
              </h1>
              <p className="text-gray-600 mt-1">
                {family.name} • {memories.length} זיכרונות
              </p>
            </div>
            
            <button
              onClick={() => router.push('/memories/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>זיכרון חדש</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Child filter */}
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">כל הילדים</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">כל הקטגוריות</option>
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
        {memories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {searchQuery || selectedChild || selectedCategory
                ? 'לא נמצאו זיכרונות מתאימים'
                : 'עדיין אין זיכרונות'}
            </p>
            {!searchQuery && !selectedChild && !selectedCategory && (
              <button
                onClick={() => router.push('/memories/create')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                צור זיכרון ראשון
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={() => router.push(`/memories/${memory.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
