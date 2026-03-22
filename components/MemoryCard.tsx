'use client';

import { Memory, Child, User } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Calendar, User as UserIcon, Tag } from 'lucide-react';

interface MemoryWithRelations extends Memory {
  children: (Child & { ageAtMemory?: string; ageMonths?: number })[];
  author: Pick<User, 'id' | 'name' | 'email'>;
}

interface MemoryCardProps {
  memory: MemoryWithRelations;
  onClick?: () => void;
}

export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const categoryColors: Record<string, string> = {
    MILESTONE: 'bg-purple-100 text-purple-800 border-purple-300',
    DAILY: 'bg-blue-100 text-blue-800 border-blue-300',
    SPECIAL: 'bg-pink-100 text-pink-800 border-pink-300',
    ACHIEVEMENT: 'bg-green-100 text-green-800 border-green-300',
    FUNNY: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    EMOTIONAL: 'bg-red-100 text-red-800 border-red-300',
  };

  const categoryLabels: Record<string, string> = {
    MILESTONE: 'אבן דרך',
    DAILY: 'יומי',
    SPECIAL: 'מיוחד',
    ACHIEVEMENT: 'הישג',
    FUNNY: 'מצחיק',
    EMOTIONAL: 'רגשי',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border-2 shadow-sm p-6 
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {memory.title}
          </h3>
          
          {/* Children tags */}
          {memory.children.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {memory.children.map((child) => (
                <span
                  key={child.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-300"
                >
                  {child.name}
                  {child.ageAtMemory && (
                    <span className="mr-1 text-xs text-indigo-600">
                      {' '}• {child.ageAtMemory}
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
            px-3 py-1 rounded-full text-sm font-medium border
            ${categoryColors[memory.category] || 'bg-gray-100 text-gray-800 border-gray-300'}
          `}
        >
          {categoryLabels[memory.category] || memory.category}
        </span>
      </div>

      {/* Content preview */}
      <div className="text-gray-700 mb-4 line-clamp-3">
        {memory.content}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(memory.date).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span>{memory.author.name || memory.author.email}</span>
          </div>
        </div>

        {/* Time ago */}
        <span className="text-xs">
          {formatDistanceToNow(new Date(memory.createdAt), {
            addSuffix: true,
            locale: he,
          })}
        </span>
      </div>
    </div>
  );
}
