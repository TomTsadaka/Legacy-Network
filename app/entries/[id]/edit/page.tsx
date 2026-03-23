'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Save, Sparkles, Image as ImageIcon, Video, X, Upload } from 'lucide-react';

export default function EntryEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('DAILY_LIFE');
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newMedia, setNewMedia] = useState<File[]>([]);

  // Available children (for tagging)
  const [availableChildren, setAvailableChildren] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      loadEntry();
      loadChildren();
    }
  }, [status, id]);

  async function loadEntry() {
    try {
      const res = await fetch(`/api/entries/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      const entry = data.entry;
      setTitle(entry.title);
      setContent(entry.content);
      setEventDate(new Date(entry.eventDate).toISOString().split('T')[0]);
      setLocation(entry.location || '');
      setCategory(entry.category);
      setChildrenIds(entry.children?.map((c: any) => c.id) || []);
      setExistingMedia(entry.media || []);
    } catch (error) {
      console.error('Error loading entry:', error);
      alert('שגיאה בטעינת הזיכרון');
      router.push('/timeline');
    } finally {
      setLoading(false);
    }
  }

  async function loadChildren() {
    try {
      const res = await fetch('/api/children');
      const data = await res.json();
      if (res.ok) {
        setAvailableChildren(data.children || []);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Upload new media files if any
      let uploadedMediaUrls: any[] = [];
      if (newMedia.length > 0) {
        setUploading(true);
        const formData = new FormData();
        newMedia.forEach(file => formData.append('files', file));

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('שגיאה בהעלאת קבצים');
        }

        const uploadData = await uploadRes.json();
        uploadedMediaUrls = uploadData.files;
        setUploading(false);
      }

      // 2. Update entry
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          eventDate,
          location: location || null,
          category,
          childrenIds,
          newMedia: uploadedMediaUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'שגיאה בשמירת השינויים');
      }

      router.push(`/entries/${id}`);
    } catch (error: any) {
      console.error('Error saving entry:', error);
      alert(error.message || 'שגיאה בשמירת השינויים');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setNewMedia(prev => [...prev, ...files]);
  }

  function removeNewMedia(index: number) {
    setNewMedia(prev => prev.filter((_, i) => i !== index));
  }

  async function removeExistingMedia(mediaId: string) {
    if (!confirm('למחוק את התמונה/סרטון?')) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('שגיאה במחיקת המדיה');
      }

      setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('שגיאה במחיקת המדיה');
    }
  }

  const categories = [
    { value: 'MILESTONE', label: 'אבן דרך', emoji: '⭐' },
    { value: 'DAILY_LIFE', label: 'יומי', emoji: '☀️' },
    { value: 'SPECIAL_EVENT', label: 'אירוע מיוחד', emoji: '🎉' },
    { value: 'HEALTH', label: 'בריאות', emoji: '💊' },
    { value: 'EDUCATION', label: 'חינוך', emoji: '📚' },
    { value: 'FAMILY', label: 'משפחה', emoji: '👨‍👩‍👧‍👦' },
    { value: 'TRAVEL', label: 'טיול', emoji: '✈️' },
    { value: 'OTHER', label: 'אחר', emoji: '🌈' },
  ];

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-700 font-bold text-lg">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push(`/entries/${id}`)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-bold"
          >
            <ArrowRight className="w-5 h-5" />
            ביטול
          </button>

          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 md:w-8 h-8 text-yellow-500" />
            ערוך זיכרון
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-playful p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              כותרת הזיכרון
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="input-playful w-full"
              placeholder="תן כותרת מיוחדת לזיכרון..."
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                תאריך האירוע
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
                className="input-playful w-full"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">
                מיקום (אופציונלי)
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="input-playful w-full"
                placeholder="איפה זה קרה?"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">
              קטגוריה
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`
                    p-3 rounded-2xl border-2 font-bold text-sm transition-all
                    ${category === cat.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Children */}
          {availableChildren.length > 0 && (
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                תייג ילדים
              </label>
              <div className="flex flex-wrap gap-2">
                {availableChildren.map(child => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      setChildrenIds(prev =>
                        prev.includes(child.id)
                          ? prev.filter(id => id !== child.id)
                          : [...prev, child.id]
                      );
                    }}
                    className={`
                      px-4 py-2 rounded-full font-bold text-sm border-2 transition-all
                      ${childrenIds.includes(child.id)
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white border-purple-300'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                      }
                    `}
                  >
                    👶 {child.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-2">
              תוכן הזיכרון
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={10}
              className="input-playful w-full resize-none"
              placeholder="ספר את הסיפור..."
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-lg font-bold text-gray-700 mb-3">
              תמונות וסרטונים
            </label>

            {/* Existing Media */}
            {existingMedia.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {existingMedia.map(media => (
                  <div key={media.id} className="relative group">
                    {media.type === 'IMAGE' ? (
                      <img
                        src={media.url}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(media.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Media Preview */}
            {newMedia.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {newMedia.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      ) : (
                        <Video className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewMedia(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="btn-secondary-playful cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-5 h-5" />
              העלה תמונות/סרטונים
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/entries/${id}`)}
              className="flex-1 btn-secondary-playful"
              disabled={saving || uploading}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 btn-primary-playful flex items-center justify-center gap-2"
            >
              {saving || uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {uploading ? 'מעלה קבצים...' : 'שומר...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  שמור שינויים
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
