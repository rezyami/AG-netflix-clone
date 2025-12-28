"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import {
  Search,
  Home,
  TrendingUp,
  Tv,
  Film,
  Plus,
  Settings,
  LogOut
} from "lucide-react";
import { useFocusContext } from "@/components/tv/FocusContext";
import { Focusable } from "@/components/tv/Focusable";
import { useProfile } from "@/context/ProfileContext";

export const AppSidebarMenu: React.FC = () => {
  const [focused, setFocused] = useState(false); // Visual expansion state
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { focusedId } = useFocusContext();

  useEffect(() => {
    if (focusedId?.startsWith("sidebar-")) {
      setFocused(true);
    } else {
      setFocused(false);
    }
  }, [focusedId]);

  // Keep mouse interaction logic for hybrid support
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Only collapse if not focused via keyboard? 
        // For now, let context win if keyboard is used.
        if (!focusedId?.startsWith("sidebar-")) {
          setFocused(false);
        }
      }
    };
    // ... logic remains similar but simpler
  }, [focusedId]);

  return (
    <SidebarMenu
      focused={focused}
      setFocused={setFocused}
      activeIdx={activeIdx}
      setActiveIdx={setActiveIdx}
      sidebarRef={sidebarRef}
    />
  );
};

type SidebarMenuProps = {
  focused: boolean;
  setFocused: (f: boolean) => void;
  activeIdx: number | null;
  setActiveIdx: (idx: number | null) => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
};

const menuItems = [
  { label: "Search", icon: <Search className="w-6 h-6" />, href: "/search" },
  { label: "Home", icon: <Home className="w-6 h-6" />, href: "/" },
  { label: "New & Popular", icon: <TrendingUp className="w-6 h-6" />, href: "/new-popular" },
  { label: "TV Shows", icon: <Tv className="w-6 h-6" />, href: "/tv-shows" },
  { label: "Movies", icon: <Film className="w-6 h-6" />, href: "/movies" },
  { label: "My List", icon: <Plus className="w-6 h-6" />, href: "/my-list" },
  { label: "Live TV", icon: <Tv className="w-6 h-6" />, href: "/live-tv" }
];


const settingsItems = [
  { label: "Settings", icon: <Settings className="w-6 h-6" /> },
  { label: "Exit Netflix", icon: <LogOut className="w-6 h-6" /> }
];

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  focused,
  setFocused,
  activeIdx,
  setActiveIdx,
  sidebarRef,
}) => {
  const router = useRouter()
  const { selectedProfile, clearProfile } = useProfile();

  if (!selectedProfile) return null;

  return (
    <div
      ref={sidebarRef}
      className={`min-h-screen p-4 flex flex-col fixed top-0 left-0 justify-between z-50 transition-all duration-700
        ${focused ? "w-full bg-[linear-gradient(90deg,_#000_0%,_#000_15%,_rgba(0,212,255,0)_100%)]" : "w-20 bg-transparent"}
      `}
    >
      {/* Profile Section */}
      <div
        className={`transition-all duration-500 ${focused ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        style={{ transitionDelay: focused ? "0.1s" : "0s" }}
      >
        <div className="flex items-center mb-4">
          <img
            src={selectedProfile.avatar}
            alt="User Profile"
            className="w-12 h-12 rounded-md mr-3 object-cover"
          />
          <div>
            <span className="text-white font-bold">{selectedProfile.name}</span>
            <div
              onClick={() => clearProfile()}
              className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
              Switch Profiles
            </div>
          </div>
        </div>
      </div>


      {/* Menu List */}
      <nav className="flex mt-6">
        <div className="flex flex-col space-y-2">
          {menuItems.map((item, idx) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={activeIdx === idx}
              focused={focused}
              delay={0.15 + 0.05 * idx}
              onIconClick={() => {
                setFocused(!focused);
                setActiveIdx(idx);
              }}
            />
          ))}
        </div>
      </nav>

      {/* Settings Section */}
      <div
        className={`mt-8 transition-all duration-500 ${focused ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        style={{ transitionDelay: focused ? "0.7s" : "0s" }}
      >
        <ul className="space-y-2">
          {settingsItems.map((item, idx) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeIdx === menuItems.length + idx}
              focused={focused}
              delay={0.75 + 0.05 * idx}
              onIconClick={() => {
                setFocused(!focused);
                setActiveIdx(menuItems.length + idx);
                if (item.label === 'Settings') {
                  router.push('/settings');
                }
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  focused?: boolean;
  delay?: number;
  href?: string;
  onIconClick?: () => void;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  focused,
  delay,
  href,
  onIconClick
}) => {
  const router = useRouter();
  const baseClasses = "flex items-center px-3 py-2 rounded transition-all duration-500 font-semibold";
  const stateClasses = active ? "text-white" : "text-gray-300";
  const cursorClass = "cursor-pointer";

  const itemContent = (
    <>
      <span className={`mr-2 ${active ? "border-b-[0.3rem] border-b-[#c00] border-solid" : ""}`}>
        {icon}
      </span>
      <span
        className="transition-all duration-500"
        style={{
          opacity: focused ? 1 : 0,
          transform: focused ? "translateX(0)" : "translateX(-2.5rem)",
          transitionDelay: focused ? `${delay ?? 0}s` : "0s",
          display: "inline-block",
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>
    </>
  );

  const handlePress = () => {
    onIconClick?.();
    if (href) router.push(href);
  };

  return (
    <Focusable
      focusKey={`sidebar-item-${label}`}
      onPress={handlePress}
      className={`${baseClasses} ${stateClasses} ${cursorClass} outline-none focus:bg-gray-800`}
      focusedClassName="bg-gray-800 ring-2 ring-white"
    >
      <div className="flex items-center w-full">
        {itemContent}
      </div>
    </Focusable>
  );
};

export default AppSidebarMenu;
