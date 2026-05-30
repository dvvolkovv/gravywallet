/**
 * Gravy Settings row.
 * Modern minimal row: soft-tinted icon bubble, title, optional subtitle, chevron or switch.
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Switch from './Switch'
import { palette, typography, spacing, radius } from '@app/theme/designSystem'

const ICON_MAP = {
    swap: 'swap-horizontal-bold',
    wallet: 'wallet-outline',
    walletConnect: 'link-variant',
    pinCode: 'lock-outline',
    changePinCode: 'lock-reset',
    biometricLock: 'face-recognition',
    transactionConfirmation: 'shield-check-outline',
    darkMode: 'weather-night',
    notifications: 'bell-outline',
    localCurrency: 'currency-usd',
    language: 'translate',
    scanning: 'qrcode-scan',
    about: 'information-outline',
    shareLogs: 'file-document-outline',
    faq: 'help-circle-outline',
    supportMail: 'email-outline',
    config: 'cog-outline',
    testerMode: 'flask-outline'
}

const SettingsRowGravy = ({
    iconType,
    title,
    subtitle,
    onPress,
    onLongPress,
    delayLongPress,
    rightContent,
    switchParams,
    disabled,
    last
}) => {
    const isSwitch = rightContent === 'switch'
    const iconName = ICON_MAP[iconType] || 'circle-outline'

    return (
        <TouchableOpacity
            activeOpacity={isSwitch ? 1 : 0.6}
            onPress={isSwitch && switchParams ? switchParams.onPress : onPress}
            onLongPress={onLongPress}
            delayLongPress={delayLongPress}
            disabled={disabled}
            style={[styles.row, last && styles.rowLast, disabled && styles.rowDisabled]}
        >
            <View style={[styles.iconBubble, disabled && styles.iconBubbleDisabled]}>
                <MaterialCommunityIcon name={iconName} size={20} color={disabled ? palette.text3 : palette.primary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
            {isSwitch && switchParams ? (
                <Switch
                    value={!!switchParams.value}
                    onPress={switchParams.onPress}
                    disabled={disabled}
                    activeBackgroundColor={palette.primary}
                    inactiveBackgroundColor={palette.border}
                    circleColor={palette.bg}
                />
            ) : rightContent === 'arrow' ? (
                <MaterialCommunityIcon name='chevron-right' size={22} color={palette.text3} />
            ) : null}
        </TouchableOpacity>
    )
}

export default SettingsRowGravy

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: palette.border
    },
    rowLast: {
        borderBottomWidth: 0
    },
    rowDisabled: {
        opacity: 0.4
    },
    iconBubble: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: palette.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md
    },
    iconBubbleDisabled: {
        backgroundColor: palette.surface
    },
    content: {
        flex: 1
    },
    title: {
        ...typography.bodyMedium,
        color: palette.text1
    },
    subtitle: {
        ...typography.caption,
        color: palette.text2,
        marginTop: 2
    }
})
