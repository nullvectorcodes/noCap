import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

// Standard App Router Route Handler
export async function GET(request: NextRequest) {
    const redirectUri = process.env.WORKOS_REDIRECT_URI;

    if (!redirectUri) {
        throw new Error('WORKOS_REDIRECT_URI is not set in environment variables');
    }

    // WorkOS getSignInUrl correctly generates the AuthKit URL
    const url = await getSignInUrl({
        redirectUri,
        state: JSON.stringify({ intent: 'admin' }),
    });

    // Next.js App Router redirect()
    redirect(url);
}
