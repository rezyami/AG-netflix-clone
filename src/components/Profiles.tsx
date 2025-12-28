"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Check } from "lucide-react";
import { useProfile, Profile } from "@/context/ProfileContext";
import { Focusable } from "@/components/tv/Focusable";
import { getTopContent } from "@/actions/getTopContent";
import { MediaItem } from "@/types/tmdb";
import AddProfile from "./AddProfile";

export const Profiles: React.FC = () => {
    const { profiles, selectProfile } = useProfile();
    const [topContent, setTopContent] = useState<MediaItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAddingProfile, setIsAddingProfile] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [editingProfile, setEditingProfile] = useState<Profile | undefined>(undefined);

    useEffect(() => {
        const fetchContent = async () => {
            const content = await getTopContent();
            setTopContent(content as MediaItem[]);
        };
        fetchContent();
    }, []);

    useEffect(() => {
        if (topContent.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % topContent.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [topContent]);

    const handleProfileClick = (profile: Profile) => {
        if (isManageMode) {
            setEditingProfile(profile);
            setIsAddingProfile(true);
        } else {
            selectProfile(profile);
        }
    };

    if (isAddingProfile) {
        return (
            <AddProfile
                onCancel={() => {
                    setIsAddingProfile(false);
                    setEditingProfile(undefined);
                }}
                profile={editingProfile}
            />
        );
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden select-none">
            {/* Background Slider */}
            <div className="absolute inset-0 z-0">
                {topContent.map((item, index) => (
                    <div
                        key={item.id}
                        className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${index === currentIndex ? "opacity-30" : "opacity-0"
                            }`}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/original${(item as any).backdrop_path || (item as any).poster_path}`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                        {/* Title at Bottom Right */}
                        <div className={`absolute bottom-12 right-12 text-right transition-all duration-1000 delay-500 ${index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}>
                            <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase drop-shadow-2xl">
                                {(item as any).title || (item as any).name}
                            </h2>
                            <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">
                                {item.media_type === 'tv' ? 'Series' : 'Movie'} • Trending Now
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full max-w-6xl px-12 flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
                <div className="mb-12 text-center">
                    <h1 className="text-white text-2xl font-bold mb-2">NETFLIX</h1>
                    <h2 className="text-white text-5xl font-medium tracking-tight mt-6">
                        {isManageMode ? "Manage Profiles" : "Who's watching?"}
                    </h2>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {profiles.map((profile) => (
                        <Focusable
                            key={profile.id}
                            focusKey={`profile-${profile.id}`}
                            onPress={() => handleProfileClick(profile)}
                            className="group flex flex-col items-center gap-4 transition-transform hover:scale-110 outline-none"
                            focusedClassName="scale-110"
                        >
                            <div className="relative w-40 h-40 rounded-md overflow-hidden ring-0 group-hover:ring-4 group-focus:ring-4 ring-white transition-all shadow-2xl">
                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className={`w-full h-full object-cover transition-all ${isManageMode ? "brightness-50" : ""}`}
                                />
                                {isManageMode && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/50 rounded-full p-2 border-2 border-white/50">
                                            <Edit2 className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                )}
                                {profile.isChildren && (
                                    <div className="absolute bottom-0 inset-x-0 flex items-center justify-center bg-black/40 py-1">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-tighter bg-cyan-600 px-1.5 py-0.5 rounded shadow-lg">
                                            Kids
                                        </span>
                                    </div>
                                )}
                            </div>
                            <span className="text-gray-400 text-2xl font-medium group-hover:text-white group-focus:text-white transition-colors">
                                {profile.name}
                            </span>
                        </Focusable>
                    ))}

                    {!isManageMode && (
                        <Focusable
                            focusKey="add-profile"
                            onPress={() => setIsAddingProfile(true)}
                            className="group flex flex-col items-center gap-4 transition-transform hover:scale-110 outline-none"
                            focusedClassName="scale-110"
                        >
                            <div className="w-40 h-40 rounded-md bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-focus:bg-white/10 ring-0 group-hover:ring-4 group-focus:ring-4 ring-white transition-all border-2 border-dashed border-white/20">
                                <Plus className="w-16 h-16 text-white/40 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-gray-400 text-2xl font-medium group-hover:text-white group-focus:text-white transition-colors">
                                Add Profile
                            </span>
                        </Focusable>
                    )}
                </div>

                <div className="mt-20">
                    <Focusable
                        focusKey="toggle-manage-profiles"
                        onPress={() => setIsManageMode(!isManageMode)}
                        className={`px-8 py-2 border font-medium tracking-widest uppercase transition-all outline-none ${isManageMode
                                ? "bg-white text-black border-white hover:bg-gray-200"
                                : "border-white/40 text-white/40 hover:border-white hover:text-white"
                            }`}
                        focusedClassName={isManageMode ? "ring-4 ring-white/20" : "border-white text-white ring-2 ring-white/50"}
                    >
                        {isManageMode ? (
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                <span>Done</span>
                            </div>
                        ) : "Manage Profiles"}
                    </Focusable>
                </div>
            </div>
        </div>
    );
};

export default Profiles;
