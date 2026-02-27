import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Log presence of important env vars (but never print secrets)
try {
  const hasGoogleId = Boolean(process.env.GOOGLE_CLIENT_ID);
  const hasGoogleSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
  const hasGithubId = Boolean(process.env.GITHUB_ID);
  const hasGithubSecret = Boolean(process.env.GITHUB_SECRET);
  console.log('[nextauth] GOOGLE_CLIENT_ID present:', hasGoogleId);
  console.log('[nextauth] GOOGLE_CLIENT_SECRET present:', hasGoogleSecret);
  console.log('[nextauth] GITHUB_ID present:', hasGithubId);
  console.log('[nextauth] GITHUB_SECRET present:', hasGithubSecret);
} catch (e) {
  // ignore
}

// Print provider configuration summary (no secrets)
try {
  const providerSummaries = (authOptions.providers || []).map((p: any) => {
    return {
      id: p.id || p.name || '<unknown>',
      type: p.type || '<unknown>',
      clientIdPresent: Boolean(
        p.clientId ||
        process.env[`${(p.id || '').toUpperCase()}_CLIENT_ID`] ||
        process.env[`${(p.id || '').toUpperCase()}_ID`],
      ),
    };
  });
  console.log(
    '[nextauth] providers summary:',
    JSON.stringify(providerSummaries),
  );
} catch (e) {
  console.error('[nextauth] error enumerating providers', e);
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
