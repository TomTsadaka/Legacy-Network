'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, Users, Baby, Heart, Star, Cake } from 'lucide-react';

export default function FamilyMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadData();
    }
  }, [status]);

  async function loadData() {
    try {
      // Load family
      const familyRes = await fetch('/api/families');
      const familyData = await familyRes.json();

      if (familyData.families && familyData.families.length > 0) {
        const primaryFamily = familyData.families[0];
        setFamily(primaryFamily);

        // Load members
        const membersRes = await fetch(`/api/family-members?familyId=${primaryFamily.id}`);
        const membersData = await membersRes.json();
        setMembers(membersData.children || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate,
          gender: gender || null,
          familyId: family.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      // Reload members
      await loadData();
      
      // Reset form
      setName('');
      setBirthDate('');
      setGender('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'משהו השתבש');
    } finally {
      setSaving(false);
    }
  }

  function calculateAge(birthDate: Date): string {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return `${totalMonths} חודשים`;
    }

    const remainingMonths = totalMonths % 12;
    if (remainingMonths === 0) {
      return `${years} שנים`;
    }

    return `${years} שנים ו-${remainingMonths} חודשים`;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
          </div>
          <p className="text-blue-700 font-bold text-lg">טוען את המשפחה...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-playful p-8 text-center max-w-md">
          <div className="text-6xl mb-4 animate-bounce">👨‍👩‍👧‍👦</div>
          <h2 className="text-3xl font-bold text-blue-700 mb-4">
            אין משפחה
          </h2>
          <p className="text-gray-600 mb-6">
            יש ליצור משפחה כדי להוסיף בני משפחה
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/timeline')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 font-bold transition-all hover:gap-3"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לציר הזמן
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-10 h-10 text-blue-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  בני המשפחה
                </h1>
              </div>
              <p className="text-blue-600 font-medium text-lg">{family.name}</p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'סגור טופס' : 'הוסף בן משפחה'}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card-playful p-6 mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
              <Baby className="w-6 h-6" />
              הוסף בן משפחה חדש
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-blue-700 mb-2">
                  שם *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="למשל: עילאי, רוי, סבתא רחל..."
                  className="input-playful text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-blue-700 mb-2">
                  תאריך לידה *
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="input-playful text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-blue-700 mb-2">
                  מגדר (אופציונלי)
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`flex-1 py-3 px-6 rounded-2xl border-3 font-bold transition-all ${
                      gender === 'MALE'
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white shadow-lg'
                        : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
                    }`}
                  >
                    👦 זכר
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`flex-1 py-3 px-6 rounded-2xl border-3 font-bold transition-all ${
                      gender === 'FEMALE'
                        ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg'
                        : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
                    }`}
                  >
                    👧 נקבה
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('')}
                    className={`flex-1 py-3 px-6 rounded-2xl border-3 font-bold transition-all ${
                      gender === ''
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg'
                        : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
                    }`}
                  >
                    ❓ לא משנה
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {saving ? 'שומר...' : 'הוסף למשפחה! 💙'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white border-2 border-blue-300 text-blue-700 font-semibold py-3 px-6 rounded-full hover:bg-blue-50 transition-all"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members List */}
        <div>
          <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            המשפחה שלנו ({members.length})
          </h2>

          {members.length === 0 ? (
            <div className="card-playful p-12 text-center">
              <div className="text-8xl mb-4 opacity-50">👨‍👩‍👧‍👦</div>
              <p className="text-blue-600 font-bold text-xl mb-4">
                עדיין אין בני משפחה
              </p>
              <p className="text-gray-600">
                הוסף את הילדים, בני הזוג, ההורים והסבים שלך!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="card-playful p-6 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">
                      {member.gender === 'MALE' ? '👦' : member.gender === 'FEMALE' ? '👧' : '👶'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-blue-700 mb-2">
                        {member.name}
                      </h3>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Cake className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {new Date(member.birthDate).toLocaleDateString('he-IL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-blue-600">
                            {calculateAge(member.birthDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
