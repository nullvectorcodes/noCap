import { signOut } from '@workos-inc/authkit-nextjs';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // Use returnTo to tell WorkOS where to send the user after logout.
    // We point to the root URL (homepage).
    // Note: This URL must be allowed in WorkOS dashboard if validating strict redirects, 
    // but typically for same-origin it might work or require config.
    // If returnTo is not supported by the installed version, typescript will complain, 
    // but we will try this as per search results.

    // Actually, per search, signOut takes options? 
    // Let's try passing the returnTo option.
    await signOut({ returnTo: request.nextUrl.origin });
}
