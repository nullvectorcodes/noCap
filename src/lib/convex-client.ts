import { ConvexHttpClient } from "convex/browser";

if (!process.env.CONVEX_SITE_URL) {
    throw new Error("CONVEX_SITE_URL is not set in environment variables");
}

// Expert Fix: Use skipConvexDeploymentUrlCheck for .convex.site addresses
// Reference: https://docs.convex.dev/api/classes/browser.ConvexHttpClient
export const convex = new ConvexHttpClient(process.env.CONVEX_SITE_URL, {
    skipConvexDeploymentUrlCheck: true,
});
