'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Calendar, MapPin, Edit2, Trash2, History, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function EntryViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const res = await fetch(`/api/entries/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setEntry(data.entry);
    } catch (error) {
      console.error('Error loading entry:', error);
      router.push('/timeline');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete entry');
      }

      router.push('/timeline');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('שגיאה במחיקת הזיכרון');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-semibold text-sm sm:text-base">טוען זיכרון...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const categoryLabels: any = {
    MILESTONE: 'אבן דרך',
    DAILY_LIFE: 'יומי',
    SPECIAL_EVENT: 'אירוע מיוחד',
    HEALTH: 'בריאות',
    EDUCATION: 'חינוך',
    FAMILY: 'משפחה',
    TRAVEL: 'טיול',
    OTHER: 'אחר',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 py-4 sm:py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/timeline')}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            חזרה לציר הזמן
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 px-4 sm:px-8 py-4 sm:py-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-3xl font-bold mb-3 leading-tight">{entry.title}</h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-blue-100 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">
                      {format(new Date(entry.eventDate), 'dd MMMM yyyy', { locale: he })}
                    </span>
                  </div>
                  
                  {entry.location && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">{entry.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {categoryLabels[entry.category]}
                    </div>
                  </div>
                </div>

                {/* Tagged Children */}
                {entry.taggedChildren && entry.taggedChildren.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.taggedChildren.map((tc: any) => (
                      <span
                        key={tc.child.id}
                        className="px-2 sm:px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium"
                      >
                        👶 {tc.child.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="prose prose-base sm:prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                {entry.content}
              </p>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                נוצר ב-{format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3 sm:justify-end">
                {/* History Button */}
                <button
                  onClick={() => router.push(`/entries/${id}/history`)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium text-xs sm:text-base"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">היסטוריה</span>
                  <span className="sm:hidden">📜</span>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => router.push(`/entries/${id}/edit`)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md text-xs sm:text-base"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>ערוך</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-md text-xs sm:text-base"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>מחק</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-in">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  למחוק זיכרון?
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  האם אתה בטוח שברצונך למחוק את הזיכרון "{entry.title}"? פעולה זו לא ניתנת לביטול.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {deleting ? 'מוחק...' : 'כן, מחק'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
