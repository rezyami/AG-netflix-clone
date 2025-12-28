"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Profile {
    id: string;
    name: string;
    avatar: string;
    language?: string;
    isChildren?: boolean;
    isCustom?: boolean;
}

interface ProfileContextType {
    profiles: Profile[];
    selectedProfile: Profile | null;
    selectProfile: (profile: Profile) => void;
    addProfile: (name: string, avatar: string, language: string, isChildren: boolean) => void;
    updateProfile: (id: string, updates: Partial<Profile>) => void;
    deleteProfile: (id: string) => void;
    clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const INITIAL_PROFILES: Profile[] = [
    {
        id: "1",
        name: "Rachid",
        avatar: "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABfjwXqIYd3kCEU6KWsiHSHvkft8VhZg0yyD50a_pHXku4dz9VgxWwfA2ontwogStpj1NE9NJMt7sCpSKFEY2zmgqqQfcw1FMWwB9.png?r=229",
        language: "FR",
    },
    {
        id: "2",
        name: "Nizar",
        avatar: "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABVTEUhowgYLWmAWhLf3T4LpDKKxcZ_2RQ8LxQX6O8P2cMTPrWRA55i83sngeLg0ltKmAE6fdZRj0sbs-jFmfjImayS4MPAiPkQ0f2Kwnll4ypLf4GeeBnVP1ojjVFFgmz0IKEQ9327tKXYT7BMk.png?r=9df",
        language: "AR",
    },
    {
        id: "3",
        name: "Children",
        avatar: "https://occ-0-2705-2706.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABX-3bFv-q3X8XqL1_8952467-5507-427c-9426-8051-507c-9426-8051-507c-9426-8051.png?r=123",
        isChildren: true,
        language: "FR",
    },
];

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedProfiles = localStorage.getItem("custom_profiles");
        if (savedProfiles) {
            try {
                const parsed = JSON.parse(savedProfiles);
                setProfiles([...INITIAL_PROFILES, ...parsed]);
            } catch (e) {
                console.error("Failed to parse saved profiles", e);
            }
        }

        const savedActiveProfile = localStorage.getItem("selected_profile");
        if (savedActiveProfile) {
            try {
                setSelectedProfile(JSON.parse(savedActiveProfile));
            } catch (e) {
                console.error("Failed to parse saved active profile", e);
            }
        }
        setMounted(true);
    }, []);

    const selectProfile = (profile: Profile) => {
        setSelectedProfile(profile);
        localStorage.setItem("selected_profile", JSON.stringify(profile));
    };

    const addProfile = (name: string, avatar: string, language: string, isChildren: boolean) => {
        const newProfile: Profile = {
            id: Date.now().toString(),
            name,
            avatar,
            language,
            isChildren,
            isCustom: true,
        };

        // Get current custom profiles
        const savedProfiles = localStorage.getItem("custom_profiles");
        const currentCustom = savedProfiles ? JSON.parse(savedProfiles) : [];
        const updatedCustom = [...currentCustom, newProfile];

        setProfiles([...INITIAL_PROFILES, ...updatedCustom]);
        localStorage.setItem("custom_profiles", JSON.stringify(updatedCustom));
    };

    const updateProfile = (id: string, updates: Partial<Profile>) => {
        // Only custom profiles can be updated in this implementation
        const savedProfiles = localStorage.getItem("custom_profiles");
        const currentCustom: Profile[] = savedProfiles ? JSON.parse(savedProfiles) : [];

        const updatedCustom = currentCustom.map(p => p.id === id ? { ...p, ...updates } : p);

        setProfiles([...INITIAL_PROFILES, ...updatedCustom]);
        localStorage.setItem("custom_profiles", JSON.stringify(updatedCustom));

        // Update active profile if it's the one edited
        if (selectedProfile?.id === id) {
            const updated = { ...selectedProfile, ...updates };
            setSelectedProfile(updated);
            localStorage.setItem("selected_profile", JSON.stringify(updated));
        }
    };

    const deleteProfile = (id: string) => {
        const savedProfiles = localStorage.getItem("custom_profiles");
        const currentCustom: Profile[] = savedProfiles ? JSON.parse(savedProfiles) : [];

        const updatedCustom = currentCustom.filter(p => p.id !== id);

        setProfiles([...INITIAL_PROFILES, ...updatedCustom]);
        localStorage.setItem("custom_profiles", JSON.stringify(updatedCustom));

        if (selectedProfile?.id === id) {
            clearProfile();
        }
    };

    const clearProfile = () => {
        setSelectedProfile(null);
        localStorage.removeItem("selected_profile");
    };

    return (
        <ProfileContext.Provider value={{ profiles, selectedProfile, selectProfile, addProfile, updateProfile, deleteProfile, clearProfile }}>
            {mounted ? children : <div className="min-h-screen bg-black" />}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};
