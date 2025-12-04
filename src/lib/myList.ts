import { MediaItem } from "@/types/tmdb";

const MY_LIST_KEY = "netflix-clone-my-list";

// Check if localStorage is available (SSR-safe)
const isLocalStorageAvailable = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
        const test = "__localStorage_test__";
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

// Get all items from My List
export const getMyList = (): MediaItem[] => {
    if (!isLocalStorageAvailable()) return [];

    try {
        const stored = localStorage.getItem(MY_LIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading My List:", error);
        return [];
    }
};

// Add item to My List
export const addToMyList = (item: MediaItem): boolean => {
    if (!isLocalStorageAvailable()) return false;

    try {
        const currentList = getMyList();

        // Check if item already exists
        const exists = currentList.some((listItem) => listItem.id === item.id);
        if (exists) return false;

        const updatedList = [...currentList, item];
        localStorage.setItem(MY_LIST_KEY, JSON.stringify(updatedList));

        // Dispatch custom event for components to listen to
        window.dispatchEvent(new Event("myListUpdated"));

        return true;
    } catch (error) {
        console.error("Error adding to My List:", error);
        return false;
    }
};

// Remove item from My List
export const removeFromMyList = (itemId: number): boolean => {
    if (!isLocalStorageAvailable()) return false;

    try {
        const currentList = getMyList();
        const updatedList = currentList.filter((item) => item.id !== itemId);
        localStorage.setItem(MY_LIST_KEY, JSON.stringify(updatedList));

        // Dispatch custom event for components to listen to
        window.dispatchEvent(new Event("myListUpdated"));

        return true;
    } catch (error) {
        console.error("Error removing from My List:", error);
        return false;
    }
};

// Check if item is in My List
export const isInMyList = (itemId: number): boolean => {
    if (!isLocalStorageAvailable()) return false;

    const currentList = getMyList();
    return currentList.some((item) => item.id === itemId);
};

// Toggle item in My List (add if not present, remove if present)
export const toggleMyList = (item: MediaItem): boolean => {
    if (isInMyList(item.id)) {
        return removeFromMyList(item.id);
    } else {
        return addToMyList(item);
    }
};
