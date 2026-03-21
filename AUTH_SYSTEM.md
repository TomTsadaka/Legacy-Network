# 🔐 Authentication & Authorization System

## Overview

Legacy Network supports multiple authentication methods and implements a hierarchical permission system.

---

## 🔑 Authentication Methods

### 1. **Demo User (Built-in Admin)**
A permanent demo account with full system access:

**Credentials:**
- Username: `demo`
- Email: `demo@legacy-network.com`
- Password: `demo123`
- Role: `SUPER_ADMIN`

**Access:**
- Full system access
- Pre-loaded with demo family and children
- Always available (created via seed script)

### 2. **Google OAuth**
Users can sign in with their Google account:
- Click "Continue with Google"
- Automatically creates account on first sign-in
- Redirected to onboarding to create family

### 3. **Magic Link (Email)**
Passwordless authentication via email:
- Enter email address
- Receive one-time login link
- Click link to sign in
- No password required

### 4. **Local Password (Future)**
Standard email + password registration:
- Not yet implemented
- Will allow users to create accounts with password

---

## 👥 User Roles

### System-Level Roles (`UserRole`)

#### **SUPER_ADMIN**
- Full system access
- Can manage all families
- Access to admin dashboard
- Can modify system settings
- **Demo user is SUPER_ADMIN**

#### **USER** (Default)
- Regular user
- Can create and manage own families
- Standard access to features

---

## 👨‍👩‍👧‍👦 Family Roles

Each user has a specific role within each family they belong to:

### **OWNER**
- Created the family
- Full administrative access
- Can invite/remove members
- Can delete family
- Can manage all children and entries

### **PARTNER**
- Invited spouse/partner
- Full access to family content
- Can create/edit/delete entries
- Can add/edit children
- Cannot delete family
- Cannot remove OWNER

### **MEMBER**
- Family member (grandparent, sibling, etc.)
- Can create entries
- Can view all family content
- Cannot edit other members' entries
- Cannot manage children
- Cannot invite members

### **VIEWER**
- Read-only access
- Can view all entries
- Cannot create/edit content
- Cannot manage children
- Cannot invite members

---

## 🔒 Permission Matrix

| Action | SUPER_ADMIN | OWNER | PARTNER | MEMBER | VIEWER |
|--------|-------------|-------|---------|--------|--------|
| View entries | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create entries | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit own entries | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit others' entries | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete own entries | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete others' entries | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add children | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit children | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete children | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ✅ (not OWNER) | ❌ | ❌ |
| Delete family | ✅ | ✅ | ❌ | ❌ | ❌ |
| Like entries | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comment on entries | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🚀 Quick Start

### For Developers

1. **Seed the database:**
   ```bash
   npm run db:seed
   ```

2. **Login as demo admin:**
   - Navigate to `/auth/signin`
   - Username: `demo`
   - Password: `demo123`

3. **Test different roles:**
   - Create a new family as a regular user
   - Invite another user to test role permissions
   - Switch between accounts to test access

### For Users

1. **First-time users:**
   - Sign in with Google or Magic Link
   - Complete onboarding wizard
   - Create your family and add children

2. **Demo users:**
   - Use demo credentials to explore
   - Pre-loaded with sample data
   - Safe to experiment with

---

## 🔐 Security Features

- **Multi-tenant isolation**: Users can only access their own families
- **Row-level security**: Enforced via Prisma queries
- **Password hashing**: bcrypt with 10 rounds
- **Session-based auth**: NextAuth.js sessions
- **CSRF protection**: Built-in via NextAuth.js
- **Unique constraints**: Email and username are unique

---

## 📝 API Usage

### Check user's role in a family:

```typescript
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const session = await auth();
const familyMember = await prisma.familyMember.findFirst({
  where: {
    userId: session.user.id,
    familyId: 'some-family-id'
  }
});

const role = familyMember?.role; // 'OWNER' | 'PARTNER' | 'MEMBER' | 'VIEWER'
```

### Check if user is SUPER_ADMIN:

```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id }
});

const isSuperAdmin = user?.role === 'SUPER_ADMIN';
```

---

## 🛠️ Future Enhancements

- [ ] Local password registration flow
- [ ] Role-based UI components
- [ ] Admin dashboard for SUPER_ADMIN
- [ ] Audit logging for sensitive actions
- [ ] Two-factor authentication (2FA)
- [ ] Family invitation system
- [ ] Email notifications for role changes

---

**Built by**: Tom Tsadaka with AI assistance from Sam (OpenClaw)  
**Last Updated**: March 21, 2026
