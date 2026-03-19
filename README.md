# 🌟 Legacy Network

A beautiful, private SaaS platform for families to document and cherish their children's growth journey.

## ✨ Features

### Core Functionality
- 📸 **Memory Journaling**: Document milestones, daily moments, and special events
- 📅 **Timeline of Growth**: See your children's journey with automatic age tracking
- 👨‍👩‍👧‍👦 **Multi-Parent Access**: Invite partners to contribute and view memories
- 🏷️ **Smart Filtering**: Find memories by child, category, or date
- 🔒 **Privacy First**: Strict multi-tenant isolation - your data is yours alone

### Technical Highlights
- ⚡ **Age Calculation Engine**: Exact age (years, months, days) for every memory
- 🎯 **Multi-Tenant Architecture**: Secure family data isolation
- 📱 **PWA Ready**: Add to home screen for quick access
- 🎨 **Warm UI**: Nostalgic cream and blue color palette

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Google OAuth + Magic Links)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## 📦 Installation

### 1. Clone and Install
```bash
cd legacy-network
npm install
```

### 2. Set up Database
```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add your DATABASE_URL
# For local dev, you can use:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/legacy_network"

# Generate Prisma Client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init
```

### 3. Configure Authentication
Edit `.env`:
- Add `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- Optional: Add Google OAuth credentials
- Optional: Add Email provider for Magic Links

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile
- **Family**: Multi-tenant container
- **FamilyMember**: User ↔ Family relationship with roles
- **Child**: Children in the family
- **Entry**: Memory/journal entries
- **EntryChild**: Many-to-Many tagging

### Engagement (Optional)
- **Like**: Users can like entries
- **Comment**: Family members can comment

## 🗂️ Project Structure

```
legacy-network/
├── app/                    # Next.js App Router
│   ├── globals.css        # Tailwind styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── auth/              # Authentication pages (to be built)
│   ├── dashboard/         # Main dashboard (to be built)
│   └── api/               # API routes (to be built)
├── components/            # React components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client singleton
│   └── age-calculator.ts # Age calculation logic
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🚀 Next Steps

### Phase 1: Authentication (In Progress)
- [ ] Set up NextAuth.js configuration
- [ ] Create sign-in/sign-up pages
- [ ] Build onboarding wizard (Family + Children setup)

### Phase 2: Core Features
- [ ] Dashboard with upcoming birthdays
- [ ] Timeline feed (view all memories)
- [ ] Entry creation form
- [ ] Smart filtering system
- [ ] Search functionality

### Phase 3: Polish
- [ ] Profile management
- [ ] Family member invitations
- [ ] Photo uploads (Cloudinary/S3)
- [ ] Export memories (PDF)
- [ ] Sharing features

## 🎨 Design Philosophy

Legacy Network uses a warm, nostalgic design language:
- **Primary Color**: Soft Blue (#5B8FB9) - Trust and calm
- **Secondary**: Cream (#F5E6D3) - Warm and inviting
- **Typography**: Serif headings (Merriweather) for elegance, Sans body (Inter) for readability
- **Mobile-First**: Responsive design for on-the-go memory capturing

## 🔐 Security

- Multi-tenant data isolation at the database level
- Row-level security via Prisma queries
- Session-based authentication
- CSRF protection
- Input validation with Zod

## 📝 License

Private project - All rights reserved

## 👥 Credits

Built with ❤️ by Tom Tsadaka with AI assistance from Sam (OpenClaw)

---

**Status**: 🚧 Foundation Complete - Ready for Feature Development
