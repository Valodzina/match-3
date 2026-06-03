export const locales = {
    ru: {
        texts: {
            menuTitle: 'ВЫБОР УРОВНЯ',
            menuStars: 'Звезды: {current} / {total}',
            gameMoves: 'Ходы:',
            gameScore: 'Счет:',
        },
        styles: {
            // Для поддержки разных языков в будущем можно подгружать разные шрифты
            fontFamily: 'Arial, sans-serif',
            titleFontSize: 32,
            uiFontSize: 24,
        },
    },
    en: {
        texts: {
            menuTitle: 'SELECT LEVEL',
            menuStars: 'Stars: {current} / {total}',
            gameMoves: 'Moves:',
            gameScore: 'Score:',
        },
        styles: {
            fontFamily: 'Arial, sans-serif',
            titleFontSize: 32,
            uiFontSize: 24,
        },
    },
};

// По умолчанию ставим русский
export const currentLocale = locales.ru;

// Простая функция перевода с поддержкой параметров
export function t(
    key: keyof typeof currentLocale.texts,
    params?: Record<string, string | number>
): string {
    let text = currentLocale.texts[key];
    if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
            text = text.replace(`{${pKey}}`, String(pVal));
        }
    }
    return text;
}
