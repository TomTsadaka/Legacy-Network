import Link from 'next/link';
import { Sparkles, Calendar, Lock, Users, Tag, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float hidden md:block">🎈</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-float hidden md:block" style={{ animationDelay: '1s' }}>⭐</div>
        
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo/Title */}
            <div className="inline-flex items-center gap-3 mb-6 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
                רשת המורשת
              </h1>
            </div>
            
            <p className="text-2xl sm:text-3xl text-gray-800 font-semibold mb-4">
              לתעד, לשמר ולשתף את הרגעים היקרים של המשפחה
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              יומן דיגיטלי פרטי שבו הורים מתעדים את צמיחת ילדיהם,
              רגעי ציון דרך והקסם היומיומי של החיים המשפחתיים.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link 
                href="/auth/signin" 
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-700 hover:via-cyan-700 hover:to-sky-700 text-white font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                התחל עכשיו
                <Sparkles className="w-5 h-5" />
              </Link>
              <Link 
                href="/timeline" 
                className="bg-white hover:bg-gray-50 text-blue-700 font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 flex items-center justify-center gap-2"
              >
                כניסה למערכת
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
              למה רשת המורשת?
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
              הפלטפורמה המושלמת לשמירת זיכרונות המשפחה באופן מאורגן, מאובטח ונגיש
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Sparkles className="w-8 h-8" />}
                title="לתעד זיכרונות"
                description="תיעוד כל אבן דרך, מהצעדים הראשונים ועד ליום הראשון בבית הספר"
                color="from-blue-500 to-cyan-500"
              />
              <FeatureCard 
                icon={<Calendar className="w-8 h-8" />}
                title="ציר זמן של צמיחה"
                description="עקבו אחר מסע החיים של ילדיכם עם מעקב אוטומטי אחר הגיל"
                color="from-cyan-500 to-sky-500"
              />
              <FeatureCard 
                icon={<Lock className="w-8 h-8" />}
                title="פרטי ומאובטח"
                description="זיכרונות המשפחה שלכם מוגנים ברמת אבטחה ארגונית"
                color="from-sky-500 to-blue-500"
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8" />}
                title="גישה משותפת"
                description="הזמינו בני זוג ובני משפחה לתרום ולצפות בזיכרונות"
                color="from-indigo-500 to-blue-500"
              />
              <FeatureCard 
                icon={<Tag className="w-8 h-8" />}
                title="ארגון חכם"
                description="סינון לפי ילד, קטגוריה או תאריך למציאת זיכרונות מיידית"
                color="from-blue-500 to-indigo-500"
              />
              <FeatureCard 
                icon={<Heart className="w-8 h-8" />}
                title="בניית מורשת"
                description="צרו מתנה יקרת ערך שילדיכם ישמרו לנצח"
                color="from-cyan-500 to-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            הצטרפו עכשיו והתחילו לבנות את אוצר הזיכרונות המשפחתי שלכם
          </p>
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-lg px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            צור חשבון חינם
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  color 
}: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
  color: string;
}) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-blue-100">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
