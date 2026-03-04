import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Use centralized logger

// In development, print the effective OAuth callback URLs and configured client IDs
if (process.env.NODE_ENV !== 'production') {
  try {
    const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const googleCallback = `${nextAuthUrl.replace(/\/$/, '')}/api/auth/callback/google`;
    const githubCallback = `${nextAuthUrl.replace(/\/$/, '')}/api/auth/callback/github`;
    // Use console so this is visible when dev server starts
    // eslint-disable-next-line no-console
    console.info('[dev] NextAuth expected callback URLs:');
    // eslint-disable-next-line no-console
    console.info(`[dev] Google callback: ${googleCallback}`);
    // eslint-disable-next-line no-console
    console.info(`[dev] GitHub callback: ${githubCallback}`);
    // eslint-disable-next-line no-console
    console.info(
      `[dev] GOOGLE_CLIENT_ID set: ${Boolean(process.env.GOOGLE_CLIENT_ID)}`,
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[dev] Unable to construct NextAuth callback URLs', err);
  }
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
          logger.warn('Missing credentials');
          return null;
        }

        // Trim and normalize to lowercase to avoid case-sensitivity issues
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        logger.info('Attempting login', { email });

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          logger.warn('User not found', { email });
          return null;
        }

        if (!user.password) {
          logger.warn('OAuth-only account attempted password login', { email });
          return null;
        }

        // Block login if email not verified
        if (!user.emailVerified) {
          logger.warn('Attempted login with unverified email', { email });
          // Special error string for UI to detect
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        logger.debug('Found user, comparing passwords', { email });
        const isValid = await compare(password, user.password);

        if (!isValid) {
          logger.warn('Password mismatch', { email });
          return null;
        }

        logger.info('Login successful', { email, id: user.id });

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
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
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
      logger.info('NextAuth signIn', { event: message?.provider || 'unknown' });
    },
    signOut(message: any) {
      logger.info('NextAuth signOut', {
        event: message?.provider || 'unknown',
      });
    },
  },
  logger: {
    error(code: any, metadata?: any) {
      logger.error('NextAuth error', {
        code,
        metadata: metadata ? String(metadata) : undefined,
      });
    },
    warn(code: any) {
      logger.warn('NextAuth warn', { code });
    },
    debug(code: any) {
      logger.debug('NextAuth debug', { code });
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const startTime = Date.now();
      logger.info('[OAuth] signIn callback started', {
        provider: account?.provider,
        hasEmail: !!user?.email,
        timestamp: new Date().toISOString(),
      });

      try {
        // Get OAuth email (prefer user.email, fall back to GitHub API if needed)
        let oauthEmail = user?.email as string | undefined;
        let providerVerified = false;

        logger.debug('[OAuth] Initial email check', {
          provider: account?.provider,
          emailProvided: !!oauthEmail,
        });

        // For GitHub, fetch email and verification status in a single call
        if (account?.provider === 'github') {
          if (oauthEmail) {
            // GitHub provided an email directly (assume verified)
            providerVerified = true;
            logger.debug('[OAuth] GitHub email provided directly', {
              email: oauthEmail,
            });
          } else if (account?.access_token) {
            // Need to fetch email from GitHub API
            logger.debug('[OAuth] Fetching GitHub email from API');
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

              const resp = await fetch('https://api.github.com/user/emails', {
                headers: {
                  Authorization: `token ${account.access_token}`,
                  Accept: 'application/vnd.github+json',
                  'User-Agent': 'holiday-hub',
                },
                signal: controller.signal,
              });
              clearTimeout(timeout);

              if (resp.ok) {
                const emails = (await resp.json()) as Array<{
                  email: string;
                  primary: boolean;
                  verified: boolean;
                }>;
                const primary =
                  emails.find((e) => e.primary && e.verified) ||
                  emails.find((e) => e.verified) ||
                  emails[0];
                if (primary?.email) {
                  oauthEmail = primary.email;
                  providerVerified = Boolean(primary.verified);
                  logger.debug('[OAuth] GitHub email fetched successfully', {
                    email: oauthEmail,
                    verified: providerVerified,
                  });
                }
              } else {
                logger.warn('[OAuth] Failed to fetch GitHub user emails', {
                  status: resp.status,
                });
              }
            } catch (err) {
              logger.warn('[OAuth] Error fetching GitHub emails', {
                err: String(err),
              });
              // Don't block sign-in just because GitHub API is slow
            }
          }
        } else {
          // Google/other providers typically provide verified emails
          providerVerified = true;
          logger.debug('[OAuth] Non-GitHub provider, assuming verified', {
            provider: account?.provider,
          });
        }

        if (!oauthEmail) {
          logger.error('[OAuth] BLOCKING: No email provided', {
            provider: account?.provider,
            duration: Date.now() - startTime,
          });
          return false;
        }

        oauthEmail = oauthEmail.toLowerCase();
        logger.debug('[OAuth] Email normalized', { email: oauthEmail });

        // Normalize incoming OAuth email and check if user exists
        logger.debug('[OAuth] Checking for existing user');
        const existingUser = await prisma.user.findUnique({
          where: { email: oauthEmail },
        });
        logger.debug('[OAuth] User lookup complete', {
          exists: !!existingUser,
          email: oauthEmail,
        });

        // If there is an existing user with unverified email, mark verified when provider confirms
        if (existingUser && !existingUser.emailVerified && providerVerified) {
          logger.info('[OAuth] Updating existing user email verification', {
            email: oauthEmail,
          });
          try {
            await prisma.user.update({
              where: { email: oauthEmail },
              data: { emailVerified: true },
            });
          } catch (updateError) {
            logger.warn('[OAuth] Failed to update email verification', {
              error: String(updateError),
            });
            // Don't block sign-in if update fails
          }
        }

        // For new users or existing verified users, allow sign-in
        if (!existingUser) {
          logger.info('[OAuth] Creating new user', {
            email: oauthEmail,
            provider: account?.provider,
          });
          try {
            await prisma.user.create({
              data: {
                email: oauthEmail,
                name: user.name,
                image: user.image,
                timezone: 'America/New_York',
                countryCode: 'US',
                emailVerified: providerVerified,
              },
            });
            logger.info('[OAuth] New user created successfully', {
              email: oauthEmail,
            });
          } catch (createError) {
            logger.error('[OAuth] Failed to create new user', {
              error: String(createError),
              email: oauthEmail,
            });
            // Retry once after a brief delay
            logger.info('[OAuth] Retrying user creation after delay');
            await new Promise((resolve) => setTimeout(resolve, 500));
            try {
              await prisma.user.create({
                data: {
                  email: oauthEmail,
                  name: user.name,
                  image: user.image,
                  timezone: 'America/New_York',
                  countryCode: 'US',
                  emailVerified: providerVerified,
                },
              });
              logger.info('[OAuth] New user created successfully on retry', {
                email: oauthEmail,
              });
            } catch (retryError) {
              logger.error(
                '[OAuth] BLOCKING: Failed to create user after retry',
                {
                  error: String(retryError),
                  email: oauthEmail,
                },
              );
              return false; // Block sign-in if we can't create the user
            }
          }
        } else if (!existingUser.name && user.name) {
          logger.info('[OAuth] Updating existing user profile', {
            email: oauthEmail,
          });
          try {
            await prisma.user.update({
              where: { email: oauthEmail },
              data: { name: user.name, image: user.image },
            });
          } catch (updateError) {
            logger.warn('[OAuth] Failed to update user profile', {
              error: String(updateError),
            });
            // Don't block sign-in if profile update fails
          }
        }

        logger.info('[OAuth] signIn callback SUCCESS', {
          provider: account?.provider,
          email: oauthEmail,
          duration: Date.now() - startTime,
        });
        return true;
      } catch (error) {
        logger.error('[OAuth] signIn callback FAILED with unexpected error', {
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined,
          provider: account?.provider,
          duration: Date.now() - startTime,
        });
        // For unexpected errors (not user creation), block to be safe
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        // Fetch user from database to get all fields (normalize email)
        const tokenEmail = (user.email as string).toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email: tokenEmail },
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
