"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { User, LogOut } from "lucide-react";

export default function TraktAuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center gap-2 px-3 py-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        );
    }

    if (session?.user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-white" />
                    <span className="text-sm text-white hidden md:inline">
                        {session.user.name}
                    </span>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#141414]"
                    aria-label="Sign out"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Sign Out</span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn("trakt")}
            className="flex items-center gap-2 rounded bg-[#ed1c24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#d01018] focus:outline-none focus:ring-2 focus:ring-[#ed1c24] focus:ring-offset-2 focus:ring-offset-[#141414]"
        >
            <User className="h-4 w-4" />
            <span>Sign in with Trakt</span>
        </button>
    );
}
