'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'שגיאה ביצירת החשבון');
      }

      // Success - sign in automatically
      setSuccess(true);
      
      // Auto sign-in after 1 second
      setTimeout(async () => {
        const result = await signIn('credentials', {
          username: formData.username,
          password: formData.password,
          redirect: false,
          callbackUrl: '/onboarding',
        });

        if (result?.ok) {
          window.location.href = '/onboarding';
        }
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'משהו השתבש, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-10 text-center border-4 border-green-200">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            !חשבון נוצר בהצלחה
          </h1>
          <p className="text-xl text-gray-700 mb-4">מעביר אותך לעמוד הראשון שלך...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-30 animate-float">🎨</div>
      <div className="absolute top-20 right-20 text-6xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🚀</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>💫</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-10 relative z-10 border-4 border-purple-200">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl animate-bounce">🌈</span>
            <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            הצטרף אלינו!
          </h1>
          <p className="text-purple-600 font-bold text-xl">צור חשבון והתחל לשמור זיכרונות ✨</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-3 border-red-300 rounded-2xl text-red-700 text-center font-bold animate-shake">
            {error}
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              שם משתמש (באנגלית)
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="username"
              required
              className="input-playful text-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              שם מלא (אופציונלי)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="שם מלא"
              className="input-playful text-lg"
              dir="rtl"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
              className="input-playful text-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              סיסמה (לפחות 6 תווים)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="input-playful text-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              אישור סיסמה
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="input-playful text-lg"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary-playful text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                יוצר חשבון...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                !צור חשבון חדש
                <Sparkles className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-700 mb-2">כבר יש לך חשבון?</p>
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-2 text-purple-600 font-bold hover:text-purple-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            התחבר כאן
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-600 font-bold flex items-center justify-center gap-2">
            <span className="text-2xl">💙</span>
            הזיכרונות שלך לנצח
            <span className="text-2xl">💙</span>
          </p>
        </div>
      </div>
    </div>
  );
}
