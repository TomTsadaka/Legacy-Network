import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Authorize called with:', credentials?.username);
          
          if (!credentials?.username || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          // Try to find user by username OR email
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username as string },
                { email: credentials.username as string }
              ]
            }
          });

          console.log('👤 User found:', !!user);
          if (user) {
            console.log('   - ID:', user.id);
            console.log('   - Email:', user.email);
            console.log('   - Username:', user.username);
            console.log('   - Has password:', !!user.password);
            console.log('   - Password length:', user.password?.length || 0);
          }

          if (!user || !user.password) {
            console.log('❌ No user or no password');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log('🔑 Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Auth successful for:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('💥 Auth error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // For Google OAuth, save user to database
      if (account?.provider === 'google' && user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            }
          });
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
