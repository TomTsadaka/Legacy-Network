'use client';

import { useState } from 'react';

interface Child {
  name: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

interface ChildrenStepProps {
  onComplete: (children: Child[]) => void;
  onBack: () => void;
}

export default function ChildrenStep({ onComplete, onBack }: ChildrenStepProps) {
  const [children, setChildren] = useState<Child[]>([
    { name: '', birthDate: '', gender: undefined },
  ]);

  const addChild = () => {
    setChildren([...children, { name: '', birthDate: '', gender: undefined }]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validChildren = children.filter((child) => child.name && child.birthDate);
    if (validChildren.length > 0) {
      onComplete(validChildren);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👶</div>
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">
          Add Your Children
        </h2>
        <p className="text-gray-600 text-lg">
          Tell us about the little ones you want to document
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6 mb-6">
          {children.map((child, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Child {index + 1}</h3>
                {children.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={child.name}
                    onChange={(e) => updateChild(index, 'name', e.target.value)}
                    placeholder="Emma, Noah, etc."
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date *
                  </label>
                  <input
                    type="date"
                    value={child.birthDate}
                    onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (Optional)
                  </label>
                  <div className="flex gap-4">
                    {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
                      <label key={gender} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`gender-${index}`}
                          value={gender}
                          checked={child.gender === gender}
                          onChange={(e) => updateChild(index, 'gender', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {gender === 'MALE' ? 'Boy' : gender === 'FEMALE' ? 'Girl' : 'Prefer not to say'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addChild}
          className="btn-secondary w-full mb-4"
        >
          + Add Another Child
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex-1 py-3"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 py-3"
          >
            Complete Setup
          </button>
        </div>
      </form>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        <div className="w-3 h-3 rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
