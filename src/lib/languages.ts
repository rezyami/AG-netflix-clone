export const LANGUAGE_FLAGS: Record<string, string> = {
    'AR': '🇸🇦', 'ARABIC': '🇸🇦',
    'FR': '🇫🇷', 'FRENCH': '🇫🇷',
    'EN': '🇺🇸', 'ENGLISH': '🇺🇸',
    'DE': '🇩🇪', 'GERMAN': '🇩🇪',
    'ES': '🇪🇸', 'SPANISH': '🇪🇸',
    'IT': '🇮🇹', 'ITALIAN': '🇮🇹', 'ITALY': '🇮🇹',
    'TR': '🇹🇷', 'TURKISH': '🇹🇷',
    'RU': '🇷🇺', 'RUSSIAN': '🇷🇺',
    'PT': '🇵🇹', 'PORTUGUESE': '🇵🇹',
    'NL': '🇳🇱', 'DUTCH': '🇳🇱',
    'PL': '🇵🇱', 'POLISH': '🇵🇱',
    'CH': '🇨🇳', 'CHINESE': '🇨🇳',
    'UK': '🇬🇧',
    'US': '🇺🇸',
    'CA': '🇨🇦',
    'IN': '🇮🇳', 'HINDI': '🇮🇳', 'INDIA': '🇮🇳',
    'LATINO': '🇲🇽',
    'EXYU': '🇧🇦',
    'ALB': '🇦🇱', 'ALBANIA': '🇦🇱',
    'BG': '🇧🇬', 'BULGARIAN': '🇧🇬',
    'RO': '🇷🇴', 'ROMANIAN': '🇷🇴',
    'MK': '🇲🇰', 'MACEDONIAN': '🇲🇰',
    'GR': '🇬🇷', 'GREEK': '🇬🇷',
    'ID': '🇮🇩', 'INDONESIA': '🇮🇩',
    'JP': '🇯🇵', 'JAPAN': '🇯🇵', 'JAPANESE': '🇯🇵',
    'KO': '🇰🇷', 'KOREA': '🇰🇷', 'KOREAN': '🇰🇷',
    'VN': '🇻🇳', 'VIETNAM': '🇻🇳', 'VIETNAMESE': '🇻🇳',
    'TH': '🇹🇭', 'THAILAND': '🇹🇭', 'THAI': '🇹🇭',
    'MY': '🇲🇾', 'MALAYSIA': '🇲🇾', 'MALAY': '🇲🇾',
    'IR': '🇮🇷', 'IRAN': '🇮🇷', 'PERSIAN': '🇮🇷', 'FA': '🇮🇷', 'FARSI': '🇮🇷', 'PR': '🇮🇷',
    'SE': '🇸🇪', 'SWEDEN': '🇸🇪', 'SWEDISH': '🇸🇪',
    'BR': '🇧🇷', 'BRAZIL': '🇧🇷', 'BRAZILIAN': '🇧🇷',
    'BE': '🇧🇪', 'BELGIUM': '🇧🇪',
    'AT': '🇦🇹', 'AUSTRIA': '🇦🇹',
    'HU': '🇭🇺', 'HUNGARY': '🇭🇺',
    'CZ': '🇨🇿', 'CZECH': '🇨🇿',
    'SK': '🇸🇰', 'SLOVAK': '🇸🇰',
    'IL': '🇮🇱', 'ISRAEL': '🇮🇱', 'HEBREW': '🇮🇱',
    'PK': '🇵🇰', 'PAKISTAN': '🇵🇰', 'URDU': '🇵🇰',
    'SC': '❄️', 'SCANDINAVIA': '❄️', 'SCANDINAVIAN': '❄️',
};

export function getFlaggedLanguage(lang: string): string {
    const key = lang.toUpperCase().trim();
    if (LANGUAGE_FLAGS[key]) {
        return `${LANGUAGE_FLAGS[key]} ${key}`;
    }
    return lang;
}

const SPACE_SEPARATOR_BLOCKLIST = new Set(['IT', 'IN', 'US', 'AT', 'TO', 'IS', 'ON', 'AN', 'WE', 'MY', 'HE', 'ME', 'AS', 'BY', 'OF', 'OR', 'SO', 'UP', 'ID', 'SE']);

export function replaceLanguageWrapper(text: string): string {
    // 1. Check for standard "CODE - " or "CODE | " (Strong signal)
    let match = text.match(/^([A-Z]{2,10})\s*[-|]\s*(.+)/i);
    if (match) {
        const langCode = match[1].toUpperCase();
        const rest = match[2];
        const flag = LANGUAGE_FLAGS[langCode];
        if (flag) {
            return `${flag} ${rest}`;
        }
    }

    // 2. Check for "CODE " (Weak signal, space only)
    // We only allow this for known flags that are NOT common words in the blocklist
    match = text.match(/^([A-Z]{2,10})\s+(.+)/i);
    if (match) {
        const langCode = match[1].toUpperCase();
        const rest = match[2]; // The rest of the title

        // Check if valid flag and not blocked
        if (LANGUAGE_FLAGS[langCode] && !SPACE_SEPARATOR_BLOCKLIST.has(langCode)) {
            return `${LANGUAGE_FLAGS[langCode]} ${rest}`;
        }
    }

    return text;
}
