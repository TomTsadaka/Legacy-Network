'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Clock, User, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { he } from 'date-fns/locale';

interface Version {
  version: number;
  isCurrent: boolean;
  title: string;
  content: string;
  eventDate: string;
  location: string | null;
  category: string;
  editedAt: string;
  editedBy: {
    id: string;
    name: string;
  } | null;
}

export default function EntryHistoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
  
  const [timeline, setTimeline] = useState<Version[]>([]);
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadHistory();
    }
  }, [status, id]);

  async function loadHistory() {
    try {
      const res = await fetch(`/api/entries/${id}/versions`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setEntry(data.entry);
      setTimeline(data.timeline);
    } catch (error) {
      console.error('Error loading history:', error);
      router.push(`/entries/${id}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleVersion(versionNum: number) {
    if (expandedVersion === versionNum) {
      setExpandedVersion(null);
    } else {
      setExpandedVersion(versionNum);
    }
  }

  function getDiff(field: string, oldVal: any, newVal: any) {
    if (oldVal === newVal) return null;
    
    return {
      field,
      old: oldVal,
      new: newVal,
    };
  }

  function getVersionDiff(currentVersion: Version, previousVersion: Version | null) {
    if (!previousVersion) return [];

    const diffs = [];
    
    if (currentVersion.title !== previousVersion.title) {
      diffs.push(getDiff('כותרת', previousVersion.title, currentVersion.title));
    }
    
    if (currentVersion.content !== previousVersion.content) {
      diffs.push(getDiff('תוכן', previousVersion.content, currentVersion.content));
    }
    
    if (currentVersion.eventDate !== previousVersion.eventDate) {
      diffs.push(getDiff(
        'תאריך',
        format(new Date(previousVersion.eventDate), 'dd/MM/yyyy'),
        format(new Date(currentVersion.eventDate), 'dd/MM/yyyy')
      ));
    }
    
    if (currentVersion.location !== previousVersion.location) {
      diffs.push(getDiff('מיקום', previousVersion.location || '(ריק)', currentVersion.location || '(ריק)'));
    }
    
    if (currentVersion.category !== previousVersion.category) {
      diffs.push(getDiff('קטגוריה', previousVersion.category, currentVersion.category));
    }

    return diffs.filter(d => d !== null);
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-700 font-bold text-lg">טוען היסטוריה...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push(`/entries/${id}`)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-bold transition-all hover:gap-3"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לזיכרון
          </button>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              היסטוריית שינויים
            </h1>
            <Clock className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-purple-600 font-medium text-base md:text-lg">
            {entry?.currentTitle}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {timeline.length} {timeline.length === 1 ? 'גרסה' : 'גרסאות'}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {timeline.map((version, index) => {
            const previousVersion = timeline[index + 1] || null;
            const diffs = getVersionDiff(version, previousVersion);
            const isExpanded = expandedVersion === version.version;

            return (
              <div
                key={version.version}
                className={`card-playful p-4 md:p-6 border-r-4 transition-all ${
                  version.isCurrent
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50'
                    : 'border-purple-400'
                }`}
              >
                {/* Version Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleVersion(version.version)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xl md:text-2xl font-bold ${
                        version.isCurrent ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        {version.isCurrent ? '✨ גרסה נוכחית' : `גרסה ${version.version}`}
                      </span>
                      {diffs.length > 0 && !version.isCurrent && (
                        <span className="text-xs md:text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                          {diffs.length} {diffs.length === 1 ? 'שינוי' : 'שינויים'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(version.editedAt), {
                            addSuffix: true,
                            locale: he,
                          })}
                        </span>
                      </div>

                      {version.editedBy && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{version.editedBy.name}</span>
                        </div>
                      )}

                      <div className="text-gray-400">
                        {format(new Date(version.editedAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>

                  <button className="text-purple-600 hover:text-purple-700 p-2">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t-2 border-purple-100 space-y-4 animate-fadeIn">
                    {/* Changes Summary */}
                    {diffs.length > 0 && (
                      <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-200">
                        <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                          <span className="text-lg">📝</span>
                          מה השתנה:
                        </h3>
                        <div className="space-y-2">
                          {diffs.map((diff, i) => (
                            <div key={i} className="text-sm">
                              <div className="font-bold text-orange-700">{diff?.field}:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                <div className="bg-red-100 p-2 rounded-lg">
                                  <div className="text-xs text-red-600 font-bold mb-1">לפני:</div>
                                  <div className="text-red-800 line-clamp-2">{diff?.old}</div>
                                </div>
                                <div className="bg-green-100 p-2 rounded-lg">
                                  <div className="text-xs text-green-600 font-bold mb-1">אחרי:</div>
                                  <div className="text-green-800 line-clamp-2">{diff?.new}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Content Preview */}
                    <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-200">
                      <h3 className="font-bold text-gray-700 mb-3">תצוגה מלאה:</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">כותרת:</div>
                          <div className="font-bold text-gray-900">{version.title}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">תוכן:</div>
                          <div className="text-gray-800 whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                            {version.content}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">תאריך: </span>
                            <span className="font-medium">
                              {format(new Date(version.eventDate), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          {version.location && (
                            <div>
                              <span className="text-gray-500">מיקום: </span>
                              <span className="font-medium">{version.location}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">קטגוריה: </span>
                            <span className="font-medium">{categoryLabels[version.category]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {timeline.length === 1 && (
          <div className="text-center py-12 bg-purple-50 rounded-3xl border-2 border-purple-200 mt-6">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-purple-700 font-bold text-lg mb-2">
              עדיין אין היסטוריה
            </p>
            <p className="text-purple-600">
              הגרסה הנוכחית היא הראשונה. ערוך את הזיכרון כדי ליצור היסטוריה!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
