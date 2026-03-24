import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary/10" dir="rtl">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-6xl font-serif font-bold text-primary mb-6">
            רשת המורשת
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            לתעד, לשמר ולשתף את הרגעים היקרים של המשפחה
          </p>
          <p className="text-lg text-gray-600 mb-12">
            יומן דיגיטלי פרטי שבו הורים מתעדים את צמיחת ילדיהם,
            רגעי ציון דרך והקסם היומיומי של החיים המשפחתיים.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link 
              href="/auth/signin" 
              className="btn-primary text-lg px-8 py-3 inline-block"
            >
              להתחיל
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-secondary text-lg px-8 py-3 inline-block"
            >
              כניסה
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
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
    <div className="card hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
