import { withAuth } from "@workos-inc/authkit-nextjs";
import { convex } from "@/lib/convex-client";
import LandingUI from "@/components/landing-ui";
import { redirect } from "next/navigation";

export default async function LandingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { user } = await withAuth();
  const error = searchParams.error as string | undefined;

  if (user) {
    try {
      // Sync user data to Convex dashboard
      await convex.mutation("users:store" as any, {
        userId: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profilePictureUrl: user.profilePictureUrl || undefined,
      });
    } catch (err) {
      console.error("Failed to sync user to Convex:", err);
    }

    // Redirect authenticated users to the modern dashboard
    redirect("/dashboard");
  }

  return <LandingUI user={user} error={error} />;
}
