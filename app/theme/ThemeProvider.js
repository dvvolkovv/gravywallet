/**
 * @version 0.60
 *
 * Theme provider with three-state preference:
 *   - 'system' — follow OS scheme automatically (default for new installs)
 *   - 'light'  — force light
 *   - 'dark'   — force dark
 *
 * The effective scheme is exposed as `isLight`; `themePreference` carries
 * the raw user setting so the Settings UI can show "Auto / Light / Dark".
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Appearance, Dimensions, PixelRatio } from 'react-native'

import trusteeAsyncStorage from '@appV2/services/trusteeAsyncStorage/trusteeAsyncStorage'
import MarketingEvent from '@app/services/Marketing/MarketingEvent'

import { colorsLight } from '@app/theme/colorsLight'
import { colorsDark } from '@app/theme/colorsDark'
import { applyPalette } from '@app/theme/designSystem'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const PIXEL_RATIO = PixelRatio.get()

const COLOR_SCHEME_FLICKER_DELAY_MS = 250

let GRID_SIZE = 16
if (PIXEL_RATIO <= 2 && SCREEN_WIDTH < 330) {
    GRID_SIZE = 8 // iphone 5s
}

const VALID_PREFS = ['system', 'light', 'dark']

function resolveScheme(pref, systemScheme) {
    if (pref === 'light') return 'light'
    if (pref === 'dark') return 'dark'
    return systemScheme === 'dark' ? 'dark' : 'light'
}

export const ThemeContext = React.createContext({
    isLight: true,
    themePreference: 'system',
    color: colorsLight,
    GRID_SIZE
})

export const ThemeProvider = (props) => {
    const systemScheme = useSystemColorScheme()
    const [themePreference, setThemePreference] = useState('system')

    const effective = resolveScheme(themePreference, systemScheme)
    const isLight = effective === 'light'

    useEffect(() => {
        const load = async () => {
            const stored = await trusteeAsyncStorage.getThemeSetting()
            if (stored && VALID_PREFS.includes(stored)) {
                setThemePreference(stored)
            }
        }
        load()
    }, [])

    useEffect(() => {
        applyPalette(isLight)
        const colors = isLight ? colorsLight : colorsDark
        changeNavigationBarColor(colors.common.background, isLight)
        MarketingEvent.UI_DATA.IS_LIGHT = isLight
    }, [isLight])

    const value = useMemo(() => ({
        isLight,
        themePreference,
        colors: isLight ? colorsLight : colorsDark,
        GRID_SIZE,
        changeTheme: () => {
            const next = themePreference === 'system'
                ? (isLight ? 'dark' : 'light')
                : themePreference === 'light' ? 'dark'
                : themePreference === 'dark' ? 'system'
                : 'light'
            setThemePreference(next)
            trusteeAsyncStorage.setThemeSetting(next)
        },
        setThemePreference: (pref) => {
            if (!VALID_PREFS.includes(pref)) return
            setThemePreference(pref)
            trusteeAsyncStorage.setThemeSetting(pref)
        }
    }), [isLight, themePreference])

    return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>
}

export const useTheme = () => React.useContext(ThemeContext)

function useSystemColorScheme() {
    const [scheme, setScheme] = useState(Appearance.getColorScheme() || 'light')
    const timeout = useRef()

    const onChange = useCallback(({ colorScheme }) => {
        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => setScheme(colorScheme || 'light'), COLOR_SCHEME_FLICKER_DELAY_MS)
    }, [])

    useEffect(() => {
        const sub = Appearance.addChangeListener(onChange)
        return () => {
            if (timeout.current) clearTimeout(timeout.current)
            sub?.remove?.()
        }
    }, [onChange])

    return scheme
}
