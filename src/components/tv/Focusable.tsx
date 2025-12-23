"use client";

import React from "react";
import { useFocus } from "@/hooks/useFocus";
import { cn } from "@/lib/utils";

interface FocusableProps {
    focusKey: string;
    children: React.ReactNode;
    className?: string;
    focusedClassName?: string;
    onPress?: () => void;
    onFocus?: () => void;
    as?: any; // Allow customizing the render tag
}

export function Focusable({
    focusKey,
    children,
    className,
    focusedClassName = "ring-4 ring-white scale-105 z-10",
    onPress,
    onFocus,
    as: Component = "div"
}: FocusableProps) {
    const { ref, isFocused, focus } = useFocus({
        focusKey,
        onEnter: onPress,
        onFocus
    });

    return (
        <Component
            ref={ref}
            className={cn(
                "transition-all duration-200 outline-none cursor-pointer",
                className,
                isFocused && focusedClassName
            )}
            onClick={() => {
                focus();
                onPress?.();
            }}
            // Accessibility
            tabIndex={isFocused ? 0 : -1}
        >
            {children}
        </Component>
    );
}
