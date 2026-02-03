import { handleAuth } from '@workos-inc/authkit-nextjs';
import { convex } from '@/lib/convex-client';
import { NextRequest, NextResponse } from 'next/server';

// Standard App Router Route Handler
export async function GET(request: NextRequest) {
    // Generate the handler with our logic
    const handler = handleAuth({
        async onSuccess({ user, state }) {
            // 1. Sync data (Always succeeds)
            try {
                await convex.mutation("users:store" as any, {
                    userId: user.id,
                    email: user.email,
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    profilePictureUrl: user.profilePictureUrl || undefined,
                });
            } catch (error) {
                console.error("Auth Sync Error:", error);
            }

            // 2. Authorization (Intent Check)
            const { intent } = state ? JSON.parse(state) : {};
            if (intent === 'admin') {
                // We handle role validation on the frontend or a specific admin page
                // Expert Tip: Avoid redirect() [throw] inside third-party onSuccess callbacks
                // as they may not catch the Throw properly, leading to "undefined (reading url)"
            }
        },
    });

    // Invoke the handler with the explicit request object
    return handler(request);
}
