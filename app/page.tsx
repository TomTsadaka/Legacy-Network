import Link from 'next/link';
import { Sparkles, Calendar, Lock, Users, Tag, Heart, Camera, Star, ChevronLeft } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900" dir="rtl">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-sky-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-20 sm:py-32 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6 text-white/90 text-sm">
                <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
                <span>הדרך החכמה לשמר זיכרונות משפחתיים</span>
                <Star className="w-4 h-4 text-yellow-300" fill="currentColor" />
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                  כל רגע שווה
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                  זיכרון לנצח
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
                הפלטפורמה הפרטית והמאובטחת לתיעוד מסע החיים של ילדיכם
              </p>
              <p className="text-lg text-blue-200/80 mb-12 max-w-2xl mx-auto">
                מהצעד הראשון ועד ההצלחה הגדולה - כל רגע נשמר, מאורגן ונגיש לנצח 📸✨
              </p>

              {/* Hero CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link 
                  href="/auth/signin" 
                  className="group relative bg-white text-blue-900 font-black text-xl px-12 py-5 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Camera className="w-6 h-6 relative z-10 group-hover:text-white transition-colors" />
                  <span className="relative z-10 group-hover:text-white transition-colors">התחל לתעד עכשיו</span>
                  <ChevronLeft className="w-6 h-6 relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
                <Link 
                  href="#features" 
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold text-lg px-10 py-5 rounded-full border-2 border-white/30 hover:border-white/50 transition-all flex items-center justify-center gap-2"
                >
                  למד עוד
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-6 text-blue-100/80 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>מאות משפחות מרוצות</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>אבטחה ברמה בנקאית</span>
                </div>
                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>חינם לתמיד</span>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder - Mockup */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl flex items-center justify-center text-white/30 text-lg border border-white/10">
                  <div className="text-center space-y-4">
                    <Camera className="w-16 h-16 mx-auto text-white/40" />
                    <p>ממשק יפה ואינטואיטיבי לניהול הזיכרונות שלכם</p>
                  </div>
                </div>
              </div>
              {/* Decorative Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm shadow-xl rotate-12 hidden sm:block">
                חינם! 🎉
              </div>
              <div className="absolute -bottom-6 -left-6 bg-cyan-300 text-cyan-900 px-4 py-2 rounded-full font-bold text-sm shadow-xl -rotate-12 hidden sm:block">
                פרטי ומאובטח 🔒
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative bg-white py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
                למה משפחות בוחרות בנו?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                הכלים המושלמים לשמירת הרגעים החשובים בחיים
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Camera className="w-10 h-10" />}
                title="תיעוד קל ומהיר"
                description="צלמו, כתבו וסמנו תגיות תוך שניות. כל זיכרון נשמר אוטומטית ומאורגן בציר זמן מושלם"
                color="from-blue-500 to-cyan-500"
                accent="bg-blue-500"
              />
              <FeatureCard 
                icon={<Calendar className="w-10 h-10" />}
                title="ציר זמן חכם"
                description="מעקב אוטומטי אחרי הגיל של כל ילד בכל זיכרון. מצאו בקלות את הרגעים המיוחדים לפי תקופת זמן"
                color="from-cyan-500 to-sky-500"
                accent="bg-cyan-500"
              />
              <FeatureCard 
                icon={<Lock className="w-10 h-10" />}
                title="פרטיות מוחלטת"
                description="הזיכרונות שלכם שייכים רק לכם. אבטחה ברמה בנקאית, ללא פרסומות או מעקב"
                color="from-sky-500 to-blue-500"
                accent="bg-sky-500"
              />
              <FeatureCard 
                icon={<Users className="w-10 h-10" />}
                title="שיתוף משפחתי"
                description="הזמינו בן/בת זוג, סבא וסבתא - כולם יכולים לתרום ולהנות מהזיכרונות המשותפים"
                color="from-indigo-500 to-blue-500"
                accent="bg-indigo-500"
              />
              <FeatureCard 
                icon={<Tag className="w-10 h-10" />}
                title="חיפוש מתקדם"
                description="מצאו כל זיכרון תוך שניות עם סינון חכם לפי ילד, תאריך, קטגוריה ועוד"
                color="from-blue-500 to-indigo-500"
                accent="bg-blue-600"
              />
              <FeatureCard 
                icon={<Heart className="w-10 h-10" />}
                title="מורשת לדורות"
                description="בנו אוצר דיגיטלי שילדיכם יוכלו לצפות בו כשיגדלו - מתנה שתישאר לנצח"
                color="from-cyan-500 to-blue-500"
                accent="bg-cyan-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center text-white">
              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-black">500+</div>
                <div className="text-xl text-blue-100">משפחות מרוצות</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-black">10K+</div>
                <div className="text-xl text-blue-100">זיכרונות נשמרו</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-black">100%</div>
                <div className="text-xl text-blue-100">פרטי ומאובטח</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 py-24">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            מוכנים להתחיל לשמר זיכרונות?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            הצטרפו עכשיו והתחילו לבנות את אוצר הזיכרונות המשפחתי שלכם - חינם לנצח 🎁
          </p>
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-3 bg-white text-blue-900 font-black text-2xl px-14 py-6 rounded-full shadow-2xl hover:shadow-blue-400/50 transition-all transform hover:scale-105 group"
          >
            <Sparkles className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
            <span>צור חשבון חינם</span>
            <ChevronLeft className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>
          
          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-blue-200 text-sm">
            <span>✓ ללא כרטיס אשראי</span>
            <span>✓ התחל תוך דקה</span>
            <span>✓ ניתן לביטול בכל עת</span>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  color,
  accent
}: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
  color: string;
  accent: string;
}) {
  return (
    <div className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
      {/* Accent line */}
      <div className={`absolute top-0 right-0 left-0 h-1.5 ${accent} rounded-t-3xl`}></div>
      
      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${color} text-white mb-5 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
    </div>
  );
}
