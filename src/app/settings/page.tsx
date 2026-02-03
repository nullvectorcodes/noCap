import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function SettingsPage() {
    const { user } = await withAuth();
    if (!user) redirect("/api/auth/login");

    return (
        <main className="min-h-screen bg-[#020202] text-white p-20">
            <h1 className="text-4xl font-black mb-8">Neural Config</h1>
            <div className="space-y-8 max-w-2xl">
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-6">Security Node</h2>
                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                        <span className="text-neutral-400">Authenticated as</span>
                        <span className="font-mono text-xs">{user.email}</span>
                    </div>
                </div>
                <div className="py-4 px-6 rounded-xl bg-white/5 border border-white/10 w-max">
                    <a href="/dashboard" className="text-xs font-black uppercase tracking-widest text-violet-400 hover:text-white transition-colors">
                        ← Return to Terminal
                    </a>
                </div>
            </div>
        </main>
    );
}
