import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function HistoryPage() {
    const { user } = await withAuth();
    if (!user) redirect("/api/auth/login");

    return (
        <main className="min-h-screen bg-[#020202] text-white p-20">
            <h1 className="text-4xl font-black mb-8">Manifest Archive</h1>
            <p className="text-neutral-500 font-light max-w-xl">
                The manifestation feed is being indexed. Historical data will appear here shortly.
            </p>
            <div className="mt-12 py-4 px-6 rounded-xl bg-white/5 border border-white/10 w-max">
                <a href="/dashboard" className="text-xs font-black uppercase tracking-widest text-violet-400 hover:text-white transition-colors">
                    ← Return to Terminal
                </a>
            </div>
        </main>
    );
}
