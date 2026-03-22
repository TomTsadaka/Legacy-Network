'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: '/timeline',
      });

      if (result?.error) {
        setError('שם משתמש או סיסמה שגויים');
      } else if (result?.ok) {
        window.location.href = '/timeline';
      }
    } catch (error) {
      setError('משהו השתבש, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-30 animate-float">⭐</div>
      <div className="absolute top-20 right-20 text-6xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🎈</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>🌟</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>✨</div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-10 relative z-10 border-4 border-purple-200">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl animate-bounce">🌈</span>
            <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Legacy Network
          </h1>
          <p className="text-purple-600 font-bold text-xl">הזיכרונות הקסומים שלך ✨</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-3 border-red-300 rounded-2xl text-red-700 text-center font-bold animate-shake">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">👤</span>
              שם משתמש
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tom"
              required
              className="input-playful text-lg"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                מתחבר...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                היכנס לעולם הקסמים!
                <Sparkles className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-600 font-bold flex items-center justify-center gap-2">
            <span className="text-2xl">💙</span>
            אתר אישי למשפחת צדקה
            <span className="text-2xl">💙</span>
          </p>
        </div>
      </div>
    </div>
  );
}
