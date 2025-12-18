"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// Types for navigation
export type Direction = "up" | "down" | "left" | "right";

interface FocusContextType {
    focusedId: string | null;
    setFocusedId: (id: string) => void;
    register: (id: string, element: HTMLElement, parentId?: string) => void;
    unregister: (id: string) => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export const useFocusContext = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error("useFocusContext must be used within a FocusProvider");
    }
    return context;
};

// Helper determines distance between two rects
function getDistance(rect1: DOMRect, rect2: DOMRect, direction: Direction): number {
    // Simple center-to-center distance, weighted by direction
    const c1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
    const c2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };

    if (direction === "left" && c2.x >= c1.x) return Infinity;
    if (direction === "right" && c2.x <= c1.x) return Infinity;
    if (direction === "up" && c2.y >= c1.y) return Infinity;
    if (direction === "down" && c2.y <= c1.y) return Infinity;

    return Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2));
}

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
    const [focusedId, setFocusedId] = useState<string | null>("sidebar-home"); // Default start?

    // Map of ID -> HTMLElement
    const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
    // Map of ID -> ParentID (for grouping like Rows)
    const parentsRef = useRef<Map<string, string>>(new Map());

    const register = useCallback((id: string, element: HTMLElement, parentId?: string) => {
        elementsRef.current.set(id, element);
        if (parentId) parentsRef.current.set(id, parentId);
    }, []);

    const unregister = useCallback((id: string) => {
        elementsRef.current.delete(id);
        parentsRef.current.delete(id);
    }, []);

    // Handle spatial navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!focusedId) return;

        const directionMap: Record<string, Direction> = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        };

        const direction = directionMap[e.key];
        if (!direction) return;

        e.preventDefault();

        const currentEl = elementsRef.current.get(focusedId);
        if (!currentEl) return;

        const currentRect = currentEl.getBoundingClientRect();

        let bestCandidateId: string | null = null;
        let minDistance = Infinity;

        // Naive spatial search over ALL registered elements
        // Optimization: Filter by parent container if needed, but global is easier for now
        elementsRef.current.forEach((el, id) => {
            if (id === focusedId) return; // Skip self

            // Skip invisible elements logic could go here
            if (el.offsetParent === null) return;

            const rect = el.getBoundingClientRect();
            const dist = getDistance(currentRect, rect, direction);

            // Bias towards aligned items
            // e.g. if moving Down, prefer items with similar X center

            if (dist < minDistance) {
                minDistance = dist;
                bestCandidateId = id;
            }
        });

        if (bestCandidateId && minDistance !== Infinity) {
            setFocusedId(bestCandidateId);
            // Scroll into view logic handled by Focusable effect
        }

    }, [focusedId]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <FocusContext.Provider value={{ focusedId, setFocusedId, register, unregister }}>
            {children}
        </FocusContext.Provider>
    );
};
