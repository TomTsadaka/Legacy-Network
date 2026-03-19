'use client';

import { useState } from 'react';

interface FamilyStepProps {
  onNext: (familyName: string) => void;
}

export default function FamilyStep({ onNext }: FamilyStepProps) {
  const [familyName, setFamilyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim()) {
      onNext(familyName.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">
          Welcome to Legacy Network!
        </h2>
        <p className="text-gray-600 text-lg">
          Let's start by creating your family account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="mb-6">
          <label htmlFor="familyName" className="block text-lg font-medium text-gray-700 mb-3">
            What's your family name?
          </label>
          <input
            id="familyName"
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="e.g., The Smith Family, Johnson Household"
            required
            autoFocus
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            This is just for you - you can change it later
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full text-lg py-3"
        >
          Continue
        </button>
      </form>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>
    </div>
  );
}
