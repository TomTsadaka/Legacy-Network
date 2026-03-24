import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100" dir="rtl">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl sm:text-7xl font-serif font-bold text-amber-900 mb-6 leading-tight">
              רשת המורשת
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-800 mb-4 font-light">
              לתעד, לשמר ולשתף את הרגעים היקרים של המשפחה
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              יומן דיגיטלי פרטי שבו הורים מתעדים את צמיחת ילדיהם,
              רגעי ציון דרך והקסם היומיומי של החיים המשפחתיים.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/auth/signin" 
                className="bg-amber-800 hover:bg-amber-900 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                להתחיל
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-white hover:bg-gray-50 text-amber-900 font-semibold text-lg px-10 py-4 rounded-xl border-2 border-amber-800 shadow-md hover:shadow-lg transition-all"
              >
                כניסה
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard 
              title="📸 לתעד זיכרונות"
              description="תיעוד כל אבן דרך, מהצעדים הראשונים ועד ליום הראשון בבית הספר"
            />
            <FeatureCard 
              title="📅 ציר זמן של צמיחה"
              description="עקבו אחר מסע החיים של ילדיכם עם מעקב אוטומטי אחר הגיל"
            />
            <FeatureCard 
              title="🔒 פרטי ומאובטח"
              description="זיכרונות המשפחה שלכם מוגנים ברמת אבטחה ארגונית"
            />
            <FeatureCard 
              title="👨‍👩‍👧‍👦 גישה משותפת"
              description="הזמינו בני זוג ובני משפחה לתרום ולצפות בזיכרונות"
            />
            <FeatureCard 
              title="🏷️ ארגון חכם"
              description="סינון לפי ילד, קטגוריה או תאריך למציאת זיכרונות מיידית"
            />
            <FeatureCard 
              title="💝 בניית מורשת"
              description="צרו מתנה יקרת ערך שילדיכם ישמרו לנצח"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-amber-200">
      <h3 className="text-xl font-bold mb-3 text-amber-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
