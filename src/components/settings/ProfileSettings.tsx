"use client";

import React, { useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import { Focusable } from "@/components/tv/Focusable";
import { Check, Edit2 } from "lucide-react";

export const ProfileSettings: React.FC = () => {
    const { selectedProfile, selectProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(selectedProfile?.name || "");

    if (!selectedProfile) return null;

    const handleSaveName = () => {
        selectProfile({ ...selectedProfile, name });
        setIsEditing(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Active Profile</h2>
                <div className="flex items-center gap-8 bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-2xl">
                        <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-4">
                        {isEditing ? (
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-[#333] border-none text-white text-3xl font-bold p-3 rounded-lg outline-none focus:ring-2 ring-white/50 w-full max-w-md"
                                    autoFocus
                                />
                                <Focusable
                                    focusKey="save-profile-name"
                                    onPress={handleSaveName}
                                    className="p-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors outline-none"
                                    focusedClassName="ring-4 ring-white/20"
                                >
                                    <Check className="w-6 h-6" />
                                </Focusable>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 group">
                                <h3 className="text-4xl font-bold">{selectedProfile.name}</h3>
                                <Focusable
                                    focusKey="edit-profile-name"
                                    onPress={() => setIsEditing(true)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors outline-none"
                                    focusedClassName="text-white ring-2 ring-white/20 rounded"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </Focusable>
                            </div>
                        )}
                        <p className="text-gray-400 text-lg">
                            Language: <span className="text-white font-semibold">{selectedProfile.language || "English"}</span>
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-2">
                        <h4 className="font-semibold text-lg">Autoplay next episode</h4>
                        <p className="text-sm text-gray-400">Automatically play the next episode in a series on all devices.</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-2">
                        <h4 className="font-semibold text-lg">Autoplay previews</h4>
                        <p className="text-sm text-gray-400">Automatically play previews while browsing on all devices.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};
