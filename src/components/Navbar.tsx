"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AppSidebarMenu } from "../../static/SidebarMenu";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* SidebarMenu - Fixed on the left */}
            <AppSidebarMenu />

            {/* Header */}
            <nav
                className={cn(
                    "fixed top-0 z-40 w-full px-4 py-4 transition-colors duration-300 md:px-16",
                    isScrolled ? "bg-black/90" : "bg-gradient-to-b from-black/80 to-transparent"
                )}
            >
                <div className="flex items-center justify-center md:justify-start md:ml-20">
                    <Link href="/" className="text-2xl font-bold text-[var(--color-netflix-red)]">
                        NETFLIX
                    </Link>
                </div>
            </nav>
        </>
    );
}
