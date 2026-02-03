import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, PenTool, User, LogOut, LayoutDashboard, MessageSquare, PlusCircle } from "lucide-react";
import DashboardUI from "@/components/dashboard-ui";

export default async function DashboardPage() {
    const { user } = await withAuth();

    if (!user) {
        redirect("/api/auth/login");
    }

    return <DashboardUI user={user} />;
}
