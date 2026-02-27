import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// lightweight structured logger to keep logs consistent
function log(
  level: 'info' | 'warn' | 'error' | 'debug',
  msg: string,
  meta?: any,
) {
  const ts = new Date().toISOString();
  const payload = meta ? ` - ${JSON.stringify(meta)}` : '';
  if (level === 'info') console.info(`[Auth] ${ts} ${msg}${payload}`);
  else if (level === 'warn') console.warn(`[Auth] ${ts} ${msg}${payload}`);
  else if (level === 'error') console.error(`[Auth] ${ts} ${msg}${payload}`);
  else if (process.env.NODE_ENV !== 'production')
    console.debug(`[Auth] ${ts} ${msg}${payload}`);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          log('warn', 'Missing credentials');
          return null;
        }

        // Trim whitespace to avoid issues
        const email = credentials.email.trim();
        const password = credentials.password;

        log('info', 'Attempting login', { email });

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          log('warn', 'User not found', { email });
          return null;
        }

        if (!user.password) {
          log('warn', 'OAuth-only account attempted password login', { email });
          return null;
        }

        log('debug', 'Found user, comparing passwords', { email });
        const isValid = await compare(password, user.password);

        if (!isValid) {
          log('warn', 'Password mismatch', { email });
          return null;
        }

        log('info', 'Login successful', { email, id: user.id });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          timezone: user.timezone || 'America/New_York',
          countryCode: user.countryCode || 'US',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  // Enable debug logging in non-production to help diagnose provider issues
  debug: process.env.NODE_ENV !== 'production',
  events: {
    signIn(message: any) {
      console.log('NextAuth event signIn:', message);
    },
    signOut(message: any) {
      console.log('NextAuth event signOut:', message);
    },
  },
  logger: {
    error(code: any, metadata?: any) {
      console.error('NextAuth logger error:', code, metadata || '');
    },
    warn(code: any) {
      console.warn('NextAuth logger warn:', code);
    },
    debug(code: any) {
      if (process.env.NODE_ENV !== 'production')
        console.debug('NextAuth logger debug:', code);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user with OAuth data
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              timezone: 'America/New_York',
              countryCode: 'US',
            },
          });
        } else if (!existingUser.name && user.name) {
          // Update existing user with OAuth profile data if missing
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name,
              image: user.image,
            },
          });
        }

        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        // Fetch user from database to get all fields
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.timezone = dbUser.timezone;
          token.countryCode = dbUser.countryCode;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Extend session.user type dynamically
        const user = session.user as typeof session.user & {
          name?: string;
          image?: string;
        };
        user.id = token.id as string;
        user.timezone = token.timezone as string;
        user.countryCode = token.countryCode as string;
        user.email = token.email as string;
        if (typeof token.name === 'string') user.name = token.name;
        if (typeof token.picture === 'string') user.image = token.picture;
        session.user = user;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
