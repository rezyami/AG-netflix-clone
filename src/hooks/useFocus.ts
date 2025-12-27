import { useEffect, useRef } from "react";
import { useFocusContext } from "@/components/tv/FocusContext";

interface UseFocusOptions {
    focusKey: string;
    parentId?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onEnter?: () => void;
}

export function useFocus({ focusKey, parentId, onFocus, onBlur, onEnter }: UseFocusOptions) {
    const { focusedId, register, unregister, setFocusedId } = useFocusContext();
    const ref = useRef<HTMLDivElement>(null);

    const isFocused = focusedId === focusKey;

    useEffect(() => {
        if (ref.current) {
            register(focusKey, ref.current, parentId);
        }
        return () => unregister(focusKey);
    }, [focusKey, parentId, register, unregister]);

    useEffect(() => {
        if (isFocused) {
            onFocus?.();
            // Auto-scroll
            ref.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        } else {
            onBlur?.();
        }
    }, [isFocused, onFocus, onBlur]);

    // Handle Enter key on this specific element
    useEffect(() => {
        if (!isFocused) return;

        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                onEnter?.();
            }
        };

        window.addEventListener("keydown", handleEnter);
        return () => window.removeEventListener("keydown", handleEnter);
    }, [isFocused, onEnter]);

    return {
        ref,
        isFocused,
        focus: () => setFocusedId(focusKey)
    };
}
