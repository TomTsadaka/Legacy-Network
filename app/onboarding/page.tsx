'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FamilyStep from '@/components/onboarding/FamilyStep';
import ChildrenStep from '@/components/onboarding/ChildrenStep';

type Step = 'family' | 'children';

interface Child {
  name: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('family');
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFamilyNext = (name: string) => {
    setFamilyName(name);
    setStep('children');
  };

  const handleChildrenComplete = async (children: Child[]) => {
    setIsLoading(true);

    try {
      // Create family
      const familyRes = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: familyName }),
      });

      if (!familyRes.ok) {
        throw new Error('Failed to create family');
      }

      const { familyId } = await familyRes.json();

      // Add children
      const childrenRes = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, children }),
      });

      if (!childrenRes.ok) {
        throw new Error('Failed to add children');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('family');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <h2 className="text-2xl font-serif font-bold text-primary">
            Setting up your family...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary/10 py-12 px-4">
      {step === 'family' && <FamilyStep onNext={handleFamilyNext} />}
      {step === 'children' && (
        <ChildrenStep onComplete={handleChildrenComplete} onBack={handleBack} />
      )}
    </div>
  );
}
