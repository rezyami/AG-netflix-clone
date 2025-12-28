"use client";

import React, { useState } from "react";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { IPTVSettings } from "@/components/settings/IPTVSettings";
import { TraktSettings } from "@/components/settings/TraktSettings";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileSettings />;
            case "iptv":
                return <IPTVSettings />;
            case "trakt":
                return <TraktSettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 overflow-y-auto pt-24 px-12 pb-24">
                <div className="max-w-4xl">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
