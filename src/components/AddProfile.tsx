"use client";

import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useProfile, Profile } from "@/context/ProfileContext";
import { Focusable } from "@/components/tv/Focusable";

const AVATARS = [
    "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfjwXqIYd3kCEU6KWsiHSHvkft8VhZg0yyD50a_pHXku4dz9VgxWwfA2ontwogStpj1NE9NJMt7sCpSKFEY2zmgqqQfcw1FMWwB9.png?r=229",
    "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABVTEUhowgYLWmAWhLf3T4LpDKKxcZ_2RQ8LxQX6O8P2cMTPrWRA55i83sngeLg0ltKmAE6fdZRj0sbs-jFmfjImayS4MPAiPkQ0f2Kwnll4ypLf4GeeBnVP1ojjVFFgmz0IKEQ9327tKXYT7BMk.png?r=9df",
    "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABX-3bFv-q3X8XqL1_8952467-5507-427c-9426-8051-507c-9426-8051-507c-9426-8051.png?r=123",
    "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABZ7yqAOk6mO8Kvx8-K7s5Y-f6Z9q5J0V-vLp6L.png?r=88a",
    "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABZ8kY-3Q-K6n9X-V5Z8G4-X-m.png?r=a2c",
];

const LANGUAGES = [
    { code: "EN", name: "English" },
    { code: "FR", name: "Français" },
    { code: "AR", name: "العربية" },
];

export const AddProfile: React.FC<{ onCancel: () => void; profile?: Profile }> = ({ onCancel, profile }) => {
    const { addProfile, updateProfile, deleteProfile } = useProfile();
    const [name, setName] = useState(profile?.name || "");
    const [avatar, setAvatar] = useState(profile?.avatar || AVATARS[0]);
    const [language, setLanguage] = useState(profile?.language || "EN");
    const [isChildren, setIsChildren] = useState(profile?.isChildren || false);

    const handleSave = () => {
        if (!name.trim()) return;
        if (profile) {
            updateProfile(profile.id, { name: name.trim(), avatar, language, isChildren });
        } else {
            addProfile(name.trim(), avatar, language, isChildren);
        }
        onCancel();
    };

    const handleDelete = () => {
        if (profile) {
            deleteProfile(profile.id);
            onCancel();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <Focusable
                        focusKey="back-to-profiles"
                        onPress={onCancel}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors outline-none"
                        focusedClassName="bg-white/10 ring-2 ring-white"
                    >
                        <ArrowLeft className="w-8 h-8" />
                    </Focusable>
                    <h1 className="text-5xl font-medium tracking-tight">
                        {profile ? "Edit Profile" : "Add Profile"}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12 border-y border-white/10 py-12">
                    {/* Avatar Selection */}
                    <div className="flex flex-col gap-6">
                        <div className="relative w-40 h-40 rounded-md overflow-hidden ring-4 ring-white shadow-2xl">
                            <img src={avatar} alt="Current" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {AVATARS.map((av, idx) => (
                                <Focusable
                                    key={idx}
                                    focusKey={`avatar-${idx}`}
                                    onPress={() => setAvatar(av)}
                                    className={`relative w-10 h-10 rounded overflow-hidden transition-all outline-none ${avatar === av ? 'ring-2 ring-white scale-110' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                    focusedClassName="ring-2 ring-white scale-110 opacity-100 grayscale-0"
                                >
                                    <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                                </Focusable>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-8 justify-center">
                        <div className="space-y-4">
                            <label className="text-gray-400 font-bold uppercase tracking-wider text-sm">Profile Name</label>
                            <input
                                type="text"
                                placeholder="Enter Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#333] border-none text-white text-2xl p-4 outline-none focus:ring-2 ring-white/50 transition-all rounded"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-wrap gap-12">
                            <div className="space-y-4">
                                <label className="text-gray-400 font-bold uppercase tracking-wider text-sm">Language</label>
                                <div className="flex gap-4">
                                    {LANGUAGES.map((lang) => (
                                        <Focusable
                                            key={lang.code}
                                            focusKey={`lang-${lang.code}`}
                                            onPress={() => setLanguage(lang.code)}
                                            className={`px-4 py-2 border rounded font-medium transition-all outline-none ${language === lang.code ? 'bg-white text-black border-white' : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'}`}
                                            focusedClassName="border-white ring-2 ring-white/50"
                                        >
                                            {lang.name}
                                        </Focusable>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col items-center">
                                <label className="text-gray-400 font-bold uppercase tracking-wider text-sm">Children?</label>
                                <Focusable
                                    focusKey="toggle-children"
                                    onPress={() => setIsChildren(!isChildren)}
                                    className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all outline-none ${isChildren ? 'bg-cyan-600 border-cyan-600 shadow-[0_0_15px_rgba(8,145,178,0.5)]' : 'border-white/20 hover:border-white/40'}`}
                                    focusedClassName="ring-2 ring-white"
                                >
                                    {isChildren && <Check className="w-8 h-8 text-white" />}
                                </Focusable>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 mt-12">
                    <Focusable
                        focusKey="save-profile"
                        onPress={handleSave}
                        className={`px-8 py-3 bg-white text-black font-bold uppercase tracking-widest transition-all outline-none hover:bg-white/90 ${!name.trim() ? 'opacity-50 pointer-events-none' : ''}`}
                        focusedClassName="bg-white/90 ring-4 ring-white/40"
                    >
                        Continue
                    </Focusable>
                    <Focusable
                        focusKey="cancel-profile"
                        onPress={onCancel}
                        className="px-8 py-3 border border-white/20 text-white font-bold uppercase tracking-widest transition-all outline-none hover:bg-white/10"
                        focusedClassName="bg-white/10 border-white ring-2 ring-white/50"
                    >
                        Cancel
                    </Focusable>
                    {profile && profile.isCustom && (
                        <Focusable
                            focusKey="delete-profile"
                            onPress={handleDelete}
                            className="px-8 py-3 border border-red-600/20 text-red-600 font-bold uppercase tracking-widest transition-all outline-none hover:bg-red-600/10"
                            focusedClassName="bg-red-600/10 border-red-600 ring-2 ring-red-600/50"
                        >
                            Delete Profile
                        </Focusable>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProfile;
