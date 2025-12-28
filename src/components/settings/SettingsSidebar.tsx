"use client";

import React from "react";
import { User, Tv, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Focusable } from "@/components/tv/Focusable";

interface SettingsSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "iptv", label: "Live TV (IPTV)", icon: Tv },
        { id: "trakt", label: "Trakt.tv", icon: Share2 },
    ];

    return (
        <div className="w-80 border-r border-white/10 flex flex-col pt-8">
            <div className="px-8 mb-12">
                <Link href="/">
                    <Focusable
                        focusKey="settings-back-home"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group outline-none"
                        focusedClassName="text-white ring-2 ring-white/20 p-2 rounded"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Focusable>
                </Link>
                <h1 className="text-4xl font-bold mt-8">Settings</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <Focusable
                            key={tab.id}
                            focusKey={`settings-tab-${tab.id}`}
                            onPress={() => onTabChange(tab.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all outline-none ${isActive ? "bg-white text-black" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            focusedClassName={isActive ? "ring-4 ring-white/20" : "bg-white/10 text-white"}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="font-semibold text-lg">{tab.label}</span>
                        </Focusable>
                    );
                })}
            </nav>
        </div>
    );
};
