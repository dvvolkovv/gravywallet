/**
 * Gravy Design System tokens.
 *
 * Used by redesigned screens. Existing Trustee screens still consume
 * `colorsLight`/`colorsDark` until they are migrated.
 */

export const palette = {
    primary: '#6B4EFF',
    primaryHover: '#5A3FE5',
    primarySubtle: '#EEEAFF',

    bg: '#FFFFFF',
    surface: '#F8F8FA',
    surfaceHover: '#F0F0F4',
    border: '#EEEFF3',

    text1: '#0A0A0F',
    text2: '#6B7280',
    text3: '#9CA3AF',
    textInverse: '#FFFFFF',

    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B'
}

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
        shadowColor: '#6B4EFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 8
    }
}
