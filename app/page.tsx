import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary/10">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-6xl font-serif font-bold text-primary mb-6">
            Legacy Network
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            Capture, cherish, and share your family's precious moments
          </p>
          <p className="text-lg text-gray-600 mb-12">
            A private digital journal where parents document their children's growth,
            milestone moments, and everyday magic.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link 
              href="/auth/signin" 
              className="btn-primary text-lg px-8 py-3 inline-block"
            >
              Get Started
            </Link>
            <Link 
              href="/dashboard" 
              className="btn-secondary text-lg px-8 py-3 inline-block"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-3 gap-8 mt-20">
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
    <div className="card hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
