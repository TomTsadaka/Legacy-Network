import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl sm:text-7xl font-serif font-bold text-amber-900 mb-6 leading-tight">
              Legacy Network
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-800 mb-4 font-light">
              Capture, cherish, and share your family's precious moments
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              A private digital journal where parents document their children's growth,
              milestone moments, and everyday magic.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/auth/signin" 
                className="bg-amber-800 hover:bg-amber-900 text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-white hover:bg-gray-50 text-amber-900 font-semibold text-lg px-10 py-4 rounded-xl border-2 border-amber-800 shadow-md hover:shadow-lg transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard 
              title="📸 Capture Memories"
              description="Document every milestone, from first steps to first day of school"
            />
            <FeatureCard 
              title="📅 Timeline of Growth"
              description="See your children's journey through time with automatic age tracking"
            />
            <FeatureCard 
              title="🔒 Private & Secure"
              description="Your family's memories are safe with enterprise-grade security"
            />
            <FeatureCard 
              title="👨‍👩‍👧‍👦 Multi-Parent Access"
              description="Invite partners and family members to contribute and view memories"
            />
            <FeatureCard 
              title="🏷️ Smart Organization"
              description="Filter by child, category, or date to find memories instantly"
            />
            <FeatureCard 
              title="💝 Legacy Building"
              description="Create a priceless gift your children will treasure forever"
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
