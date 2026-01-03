export const LANGUAGE_FLAGS: Record<string, string> = {
    'AR': '🇸🇦', 'ARABIC': '🇸🇦', 'EAR': '🇸🇦',
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
    'CH': '🇨🇳', 'CHINESE': '🇨🇳', 'CN': '🇨🇳',
    'UK': '🇬🇧',
    'US': '🇺🇸',
    'CA': '🇨🇦',
    'IN': '🇮🇳', 'HINDI': '🇮🇳', 'INDIA': '🇮🇳', 'SIN': '🇮🇳', 'BL': '🇮🇳',
    'LT': '🇲🇽', 'LATINO': '🇲🇽',
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
    'SW': '🇸🇪', 'SWEDEN': '🇸🇪', 'SWEDISH': '🇸🇪',
    'BR': '🇧🇷', 'BRAZIL': '🇧🇷', 'BRAZILIAN': '🇧🇷',
    'BE': '🇧🇪', 'BELGIUM': '🇧🇪',
    'AT': '🇦🇹', 'AUSTRIA': '🇦🇹',
    'HU': '🇭🇺', 'HUNGARY': '🇭🇺',
    'CZ': '🇨🇿', 'CZECH': '🇨🇿',
    'SK': '🇸🇰', 'SLOVAK': '🇸🇰',
    'IL': '🇮🇱', 'ISRAEL': '🇮🇱', 'HEBREW': '🇮🇱',
    'PK': '🇵🇰', 'PAKISTAN': '🇵🇰', 'URDU': '🇵🇰',
    'SC': '❄️', 'SCANDINAVIA': '❄️', 'SCANDINAVIAN': '❄️',
    'DZ': '🇩🇿', 'ALGERIA': '🇩🇿', 'ALGERIAN': '🇩🇿',
    'MA': '🇲🇦', 'MOROCCO': '🇲🇦', 'MOROCCAN': '🇲🇦', 'MAGHREB': '🇲🇦',
    'TN': '🇹🇳', 'TUNISIA': '🇹🇳', 'TUNISIAN': '🇹🇳',
    'LY': '🇱🇾', 'LIBYA': '🇱🇾', 'LIBYAN': '🇱🇾',
    'AF': '🇦🇫', 'AFRICA': '🇦🇫', 'AFRICAN': '🇦🇫',
    'SOM': '🇸🇴', 'SOMALIA': '🇸🇴', 'SOMALIAN': '🇸🇴',
    'DK': '🇩🇰', 'DENMARK': '🇩🇰', 'DENMARKAN': '🇩🇰',
    'PH': '🇵🇭', 'PHILIPPINES': '🇵🇭', 'PHILIPPINE': '🇵🇭',
    'PUN': '🇵🇺', 'PUNJABI': '🇵🇺',
};

export function getFlaggedLanguage(lang: string): string {
    const key = lang.toUpperCase().trim();
    if (LANGUAGE_FLAGS[key]) {
        return `${LANGUAGE_FLAGS[key]} ${key}`;
    }
    return lang;
}

const SPACE_SEPARATOR_BLOCKLIST = new Set(['IT', 'IN', 'US', 'AT', 'TO', 'IS', 'ON', 'AN', 'WE', 'MY', 'HE', 'ME', 'AS', 'BY', 'OF', 'OR', 'SO', 'UP', 'ID', 'SE']);

function isLanguageCode(langCode: string): boolean {
    return !!LANGUAGE_FLAGS[langCode] && !SPACE_SEPARATOR_BLOCKLIST.has(langCode);
}

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
        if (isLanguageCode(langCode)) {
            return `${LANGUAGE_FLAGS[langCode]} ${rest}`;
        }
    }

    return text;
}

export const TMDB_LANGUAGE_CODES: Record<string, string> = {
    'AR': 'ar-SA', 'ARABIC': 'ar-SA', 'EAR': 'ar-SA',
    'FR': 'fr-FR', 'FRENCH': 'fr-FR',
    'EN': 'en-US', 'ENGLISH': 'en-US',
    'DE': 'de-DE', 'GERMAN': 'de-DE',
    'ES': 'es-ES', 'SPANISH': 'es-ES',
    'IT': 'it-IT', 'ITALIAN': 'it-IT', 'ITALY': 'it-IT',
    'TR': 'tr-TR', 'TURKISH': 'tr-TR',
    'RU': 'ru-RU', 'RUSSIAN': 'ru-RU',
    'PT': 'pt-PT', 'PORTUGUESE': 'pt-PT',
    'NL': 'nl-NL', 'DUTCH': 'nl-NL',
    'PL': 'pl-PL', 'POLISH': 'pl-PL',
    'CH': 'zh-CN', 'CHINESE': 'zh-CN', 'CN': 'zh-CN',
    'JP': 'ja-JP', 'JAPAN': 'ja-JP', 'JAPANESE': 'ja-JP',
    'KO': 'ko-KR', 'KOREA': 'ko-KR', 'KOREAN': 'ko-KR',
    'IN': 'hi-IN', 'HINDI': 'hi-IN', 'INDIA': 'hi-IN',
    'LT': 'es-MX', 'LATINO': 'es-MX',
};

export function getTMDBLanguageCode(text: string): string | undefined {
    const upper = text.toUpperCase().trim();

    // 1. Check if the text itself is exactly a code or name
    if (TMDB_LANGUAGE_CODES[upper]) {
        return TMDB_LANGUAGE_CODES[upper];
    }

    // 2. Check for Flags
    for (const [code, flag] of Object.entries(LANGUAGE_FLAGS)) {
        if (text.includes(flag)) {
            // Check if this flag's code has a TMDB mapping
            if (TMDB_LANGUAGE_CODES[code]) {
                return TMDB_LANGUAGE_CODES[code];
            }
        }
    }

    // 3. Extract all potential codes/names and check them
    // We look for any word that's 2-10 characters long
    const matches = text.matchAll(/\b([A-Z]{2,10})\b/gi);
    for (const match of matches) {
        const code = match[1].toUpperCase();
        if (TMDB_LANGUAGE_CODES[code]) {
            return TMDB_LANGUAGE_CODES[code];
        }
    }

    return undefined;
}
