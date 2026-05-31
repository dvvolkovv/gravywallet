/**
 * Gravy Design System tokens.
 *
 * Inspired by trientes.com — same blue+green accent on near-black surface
 * for dark, and a clean white-and-grey light counterpart. Switch by
 * importing `paletteLight` / `paletteDark` directly, or use the `palette`
 * proxy below which gives whichever is active via ThemeProvider.
 */

// Trientes brand accents — work on both modes.
const PRIMARY = '#304DB6'
const PRIMARY_HOVER = '#2740A0'
const SUCCESS = '#30B658'
const DANGER = '#EF4444'
const WARNING = '#F7931A'   // Bitcoin orange — also used by trientes for warm accents

export const paletteDark = {
    primary: PRIMARY,
    primaryHover: PRIMARY_HOVER,
    primarySubtle: '#1E2540',

    bg: '#161616',          // base background (trientes hero)
    surface: '#1E1D24',     // cards
    surfaceHover: '#252430',
    border: '#312F3A',

    text1: '#FFFFFF',
    text2: '#A1A1AA',
    text3: '#6B7280',
    textInverse: '#161616',

    success: SUCCESS,
    danger: DANGER,
    warning: WARNING
}

export const paletteLight = {
    primary: PRIMARY,
    primaryHover: PRIMARY_HOVER,
    primarySubtle: '#E5EAFA',

    bg: '#FFFFFF',
    surface: '#F4F4F6',
    surfaceHover: '#ECECEF',
    border: '#E5E5EA',

    text1: '#0A0A0F',
    text2: '#6B7280',
    text3: '#9CA3AF',
    textInverse: '#FFFFFF',

    success: SUCCESS,
    danger: DANGER,
    warning: WARNING
}

// `palette` is a Proxy — reads through to the active palette based on
// the ThemeContext. Components that want auto-themed values just import
// { palette } and read `palette.primary` etc. as before.
//
// For modules that read tokens at module-init time (outside React), use
// `getPalette()` which returns the dark palette by default — they should
// migrate to the hook-based form when they need correct theming.
let _active = paletteLight

export function applyPalette(isLight) {
    _active = isLight ? paletteLight : paletteDark
}

export const palette = new Proxy({}, {
    get: (_t, key) => _active[key]
})

const FONT = 'Manrope'

export const typography = {
    display: { fontFamily: FONT, fontSize: 48, fontWeight: '800', letterSpacing: -1.2 },
    title: { fontFamily: FONT, fontSize: 28, fontWeight: '700', letterSpacing: -0.3 },
    heading: { fontFamily: FONT, fontSize: 20, fontWeight: '600', letterSpacing: -0.1 },
    body: { fontFamily: FONT, fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyMedium: { fontFamily: FONT, fontSize: 16, fontWeight: '500', lineHeight: 24 },
    caption: { fontFamily: FONT, fontSize: 13, fontWeight: '400', lineHeight: 18 },
    small: { fontFamily: FONT, fontSize: 11, fontWeight: '500', letterSpacing: 0.4 }
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xl2: 32,
    xl3: 48,
    xl4: 64
}

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999
}

export const shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4
    },
    lg: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 8
    }
}
