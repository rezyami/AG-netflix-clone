"use client";

import React from "react";
import { useProfile } from "@/context/ProfileContext";
import Profiles from "./Profiles";

export const ProfileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { selectedProfile } = useProfile();

    console.log("ProfileGuard: Rendering, selectedProfile =", selectedProfile);

    if (!selectedProfile) {
        console.log("ProfileGuard: No profile selected, showing selection screen.");
        return <Profiles />;
    }

    return <>{children}</>;
};


export default ProfileGuard;
