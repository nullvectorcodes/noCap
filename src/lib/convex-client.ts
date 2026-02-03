import { ConvexHttpClient } from "convex/browser";

// Convex Deployment URL (ends in .convex.cloud) is required for mutations/queries
// Convex Site URL (ends in .convex.site) is only for custom HTTP actions
const rawUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_DEPLOYMENT_URL || process.env.CONVEX_SITE_URL;

if (!rawUrl) {
    throw new Error("Convex URL is not set. Please add NEXT_PUBLIC_CONVEX_URL to .env.local");
}

// Auto-correct .site to .cloud if using for mutations
const convexUrl = rawUrl.replace(".convex.site", ".convex.cloud");

export const convex = new ConvexHttpClient(convexUrl, {
    skipConvexDeploymentUrlCheck: true,
});
