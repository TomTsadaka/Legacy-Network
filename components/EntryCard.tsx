'use client';

import { Entry, Child, User } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface EntryWithRelations extends Entry {
  children: (Child & { ageAtEntry?: string; ageMonths?: number })[];
  author: Pick<User, 'id' | 'name' | 'email'>;
  media?: Media[];
}

interface EntryCardProps {
  entry: EntryWithRelations;
  onClick?: () => void;
}

export default function EntryCard({ entry, onClick }: EntryCardProps) {
  const categoryStyles: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    MILESTONE: { 
      bg: 'bg-gradient-to-br from-purple-100 to-pink-100', 
      border: 'border-purple-300', 
      text: 'text-purple-800',
      emoji: '⭐'
    },
    DAILY_LIFE: { 
      bg: 'bg-gradient-to-br from-yellow-100 to-orange-100', 
      border: 'border-yellow-300', 
      text: 'text-yellow-800',
      emoji: '☀️'
    },
    SPECIAL_EVENT: { 
      bg: 'bg-gradient-to-br from-pink-100 to-red-100', 
      border: 'border-pink-300', 
      text: 'text-pink-800',
      emoji: '🎉'
    },
    HEALTH: { 
      bg: 'bg-gradient-to-br from-green-100 to-teal-100', 
      border: 'border-green-300', 
      text: 'text-green-800',
      emoji: '💊'
    },
    EDUCATION: { 
      bg: 'bg-gradient-to-br from-blue-100 to-indigo-100', 
      border: 'border-blue-300', 
      text: 'text-blue-800',
      emoji: '📚'
    },
    FAMILY: { 
      bg: 'bg-gradient-to-br from-orange-100 to-yellow-100', 
      border: 'border-orange-300', 
      text: 'text-orange-800',
      emoji: '👨‍👩‍👧‍👦'
    },
    TRAVEL: { 
      bg: 'bg-gradient-to-br from-cyan-100 to-blue-100', 
      border: 'border-cyan-300', 
      text: 'text-cyan-800',
      emoji: '✈️'
    },
    OTHER: { 
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200', 
      border: 'border-gray-300', 
      text: 'text-gray-800',
      emoji: '🌈'
    },
  };

  const style = categoryStyles[entry.category] || categoryStyles.OTHER;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl border-2 md:border-3 shadow-lg
        transition-all duration-300 p-4 md:p-6
        ${onClick ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1' : ''}
        border-l-4 md:border-l-8 ${style.border}
      `}
    >
      {/* Decorative corner sparkle */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 text-2xl md:text-3xl opacity-30 animate-pulse">
        {style.emoji}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3 md:mb-4 relative">
        <div className="flex-1 pr-8 md:pr-12">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            {entry.title}
          </h3>
          
          {/* Children tags */}
          {entry.children && entry.children.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
              {entry.children.map((child) => (
                <span
                  key={child.id}
                  className="inline-flex items-center px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md hover:shadow-lg transition-all"
                >
                  👶 {child.name}
                  {child.ageAtEntry && (
                    <span className="mr-1 md:mr-2 text-xs opacity-90">
                      • {child.ageAtEntry}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Category badge */}
        <span
          className={`
            px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold border-2 shadow-md
            ${style.bg} ${style.border} ${style.text}
            flex items-center gap-1 md:gap-2 flex-shrink-0
          `}
        >
          <span className="text-base md:text-lg">{style.emoji}</span>
        </span>
      </div>

      {/* Content preview */}
      <div className="text-gray-700 text-sm md:text-base mb-3 md:mb-4 line-clamp-3 whitespace-pre-wrap leading-relaxed">
        {entry.content}
      </div>

      {/* Media preview */}
      {entry.media && entry.media.length > 0 && (
        <div className="mb-3 md:mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {entry.media.slice(0, 4).map((media) => (
              <div key={media.id} className="flex-shrink-0">
                {media.type === 'IMAGE' ? (
                  <img
                    src={media.url}
                    alt=""
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                )}
              </div>
            ))}
            {entry.media.length > 4 && (
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-700">
                  +{entry.media.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-gray-600 pt-3 md:pt-4 border-t-2 border-blue-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 md:gap-2 bg-blue-50 px-2 md:px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
            <span className="font-medium text-blue-800 text-xs md:text-sm">
              {new Date(entry.eventDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          
          {entry.location && (
            <div className="flex items-center gap-1 md:gap-2 bg-cyan-50 px-2 md:px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 text-cyan-600" />
              <span className="font-medium text-cyan-800 text-xs md:text-sm">{entry.location}</span>
            </div>
          )}
        </div>

        {/* Time ago */}
        <span className="text-xs text-gray-500 font-medium">
          נוסף {formatDistanceToNow(new Date(entry.createdAt), {
            addSuffix: true,
            locale: he,
          })}
        </span>
      </div>

      {/* Hover effect overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-blue-400/0 hover:from-purple-400/10 hover:via-pink-400/10 hover:to-blue-400/10 transition-all duration-300 pointer-events-none rounded-3xl"></div>
      )}
    </div>
  );
}
