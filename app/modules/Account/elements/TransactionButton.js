/**
 * @version 1.0
 */

import React from 'react'
import { Text } from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '@app/theme/ThemeProvider'
import TouchableDebounce from '@app/components/elements/new/TouchableDebounce'

const ICON_MAP = {
    receive: 'arrow-down',
    send: 'arrow-up',
    buy: 'plus',
    rbf: 'rocket-launch-outline',
    canceled: 'undo-variant'
}

const TransactionButton = ({ text, type, action, style, textStyle }) => {
    const { colors } = useTheme()
    const iconName = ICON_MAP[type?.toLowerCase()] || 'help-circle-outline'

    return (
        <TouchableDebounce style={style} onPress={action} activeOpacity={0.7}>
            <MaterialCommunityIcon name={iconName} size={20} color={colors.common.text1} />
            {text && (
                <Text style={{ ...textStyle, paddingTop: 4, color: colors.common.text1 }}>{text}</Text>
            )}
        </TouchableDebounce>
    )
}

export default TransactionButton
