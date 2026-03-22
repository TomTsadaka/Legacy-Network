'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

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

      console.log('Sign in result:', result);

      if (result?.error) {
        console.log('Error:', result.error);
        setError('שם משתמש או סיסמה שגויים');
      } else if (result?.ok) {
        console.log('Success! Redirecting...');
        window.location.href = '/timeline';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('משהו השתבש, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Legacy Network
          </h1>
          <p className="text-gray-600">הזיכרונות המשפחתיים שלך</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              שם משתמש
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tom"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              dir="ltr"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          אתר אישי למשפחת צדקה 💙
        </p>
      </div>
    </div>
  );
}
