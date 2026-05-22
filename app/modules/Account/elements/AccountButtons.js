/**
 * @version 1.0
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { strings } from '@app/services/i18n'
import TouchableDebounce from '@app/components/elements/new/TouchableDebounce'

import { palette, typography, spacing, radius } from '@app/theme/designSystem'

const ICON_MAP = {
    receive: 'arrow-down',
    buy: 'plus',
    send: 'arrow-up'
}

const ActionButton = ({ type, label, onPress }) => (
    <TouchableDebounce style={styles.action} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.bubble}>
            <MaterialCommunityIcon name={ICON_MAP[type]} size={24} color={palette.primary} />
        </View>
        {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableDebounce>
)

const AccountButtons = ({ title, actionReceive, actionBuy, actionSend }) => (
    <View style={styles.row}>
        <ActionButton
            type='receive'
            label={title && strings('account.receive', { receive: strings('repeat.receive') })}
            onPress={actionReceive}
        />
        <ActionButton
            type='buy'
            label={title && strings('dashboardStack.buy')}
            onPress={actionBuy}
        />
        <ActionButton
            type='send'
            label={title && strings('account.send')}
            onPress={actionSend}
        />
    </View>
)

export default AccountButtons

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.lg
    },
    action: {
        alignItems: 'center',
        marginHorizontal: spacing.lg
    },
    bubble: {
        width: 56,
        height: 56,
        borderRadius: radius.pill,
        backgroundColor: palette.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: {
        ...typography.caption,
        color: palette.text2,
        marginTop: spacing.sm
    }
})
