'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, Clock, User, Calendar } from 'lucide-react';

export default function TrashPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [deletedEntries, setDeletedEntries] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

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
      loadDeletedEntries();
    }
  }, [family]);

  async function loadFamily() {
    try {
      const res = await fetch('/api/families');
      const data = await res.json();

      if (data.families && data.families.length > 0) {
        setFamily(data.families[0]);
      }
    } catch (error) {
      console.error('Error loading family:', error);
    }
  }

  async function loadDeletedEntries() {
    try {
      setLoading(true);
      const res = await fetch(`/api/entries/deleted?familyId=${family.id}`);
      const data = await res.json();
      setDeletedEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading deleted entries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function restoreEntry(entryId: string) {
    if (!confirm('האם לשחזר זיכרון זה?')) return;

    try {
      setRestoring(entryId);
      const res = await fetch(`/api/entries/${entryId}/restore`, {
        method: 'POST',
      });

      if (res.ok) {
        // Remove from list
        setDeletedEntries(deletedEntries.filter(e => e.id !== entryId));
        alert('✅ הזיכרון שוחזר בהצלחה!');
      } else {
        alert('❌ שגיאה בשחזור הזיכרון');
      }
    } catch (error) {
      console.error('Error restoring entry:', error);
      alert('❌ שגיאה בשחזור הזיכרון');
    } finally {
      setRestoring(null);
    }
  }

  function formatDeletedDate(deletedAt: string) {
    const date = new Date(deletedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `לפני ${diffMinutes} דקות`;
    } else if (diffHours < 24) {
      return `לפני ${diffHours} שעות`;
    } else if (diffDays === 1) {
      return 'אתמול';
    } else {
      return `לפני ${diffDays} ימים`;
    }
  }

  function getDaysUntilPermanentDelete(deletedAt: string) {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return daysLeft;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 className="w-8 h-8 text-gray-600" />
            <h1 className="text-4xl font-black text-gray-900">סל מחזור</h1>
          </div>
          <p className="text-gray-600">זיכרונות מחוקים יישמרו כאן ל-30 יום לפני מחיקה סופית</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/timeline')}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← חזרה לטיימליין
        </button>

        {/* Empty State */}
        {deletedEntries.length === 0 && (
          <div className="text-center py-16">
            <Trash2 className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">אין זיכרונות מחוקים</h2>
            <p className="text-gray-500">זיכרונות שתמחק יופיעו כאן ל-30 יום</p>
          </div>
        )}

        {/* Deleted Entries List */}
        <div className="space-y-4">
          {deletedEntries.map((entry) => {
            const daysLeft = getDaysUntilPermanentDelete(entry.deletedAt);
            const isExpiringSoon = daysLeft <= 7;

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border-r-4 ${
                  isExpiringSoon ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{entry.title}</h3>

                    {/* Content Preview */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {entry.content.substring(0, 150)}...
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {/* Event Date */}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.eventDate).toLocaleDateString('he-IL')}</span>
                      </div>

                      {/* Deleted Date */}
                      <div className="flex items-center gap-1 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span>נמחק {formatDeletedDate(entry.deletedAt)}</span>
                      </div>

                      {/* Days until permanent delete */}
                      <div className={`flex items-center gap-1 font-bold ${
                        isExpiringSoon ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <Trash2 className="w-4 h-4" />
                        <span>יימחק לצמיתות בעוד {daysLeft} ימים</span>
                      </div>

                      {/* Author */}
                      {entry.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{entry.author.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Tagged Children */}
                    {entry.taggedChildren && entry.taggedChildren.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {entry.taggedChildren.map((tc: any) => (
                          <span
                            key={tc.child.id}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                          >
                            {tc.child.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Restore Button */}
                  <button
                    onClick={() => restoreEntry(entry.id)}
                    disabled={restoring === entry.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                      restoring === entry.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{restoring === entry.id ? 'משחזר...' : 'שחזר'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
