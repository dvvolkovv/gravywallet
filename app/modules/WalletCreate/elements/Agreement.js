/**
 * @version 0.50
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import CheckBox from '@app/components/elements/new/CheckBox'
import { ThemeContext } from '@app/theme/ThemeProvider'
import { strings } from '@app/services/i18n'
import { palette, typography } from '@app/theme/designSystem'

export default class Agreement extends React.PureComponent {

    getCheckboxTitle = () => {
        const { handleTerms, handlePrivacyPolicy } = this.props
        return (
            <View style={styles.row}>
                <Text style={styles.text}>
                    {strings('walletCreateScreen.agreement1') + ' '}
                </Text>
                <TouchableOpacity onPress={handleTerms}><Text style={styles.link}>{strings('walletCreateScreen.terms')}</Text></TouchableOpacity>
                <Text style={styles.text}>{' ' + strings('walletCreateScreen.agreement2') + ' '}</Text>
                <TouchableOpacity onPress={handlePrivacyPolicy}><Text style={styles.link}>{strings('walletCreateScreen.privacyPolicy')}</Text></TouchableOpacity>
            </View>
        )
    }

    render() {
        const { checked, onPress } = this.props
        return (
            <CheckBox
                checked={checked}
                onPress={onPress}
                title={this.getCheckboxTitle}
            />
        )
    }
}

const styles = StyleSheet.create({
    row: {
        marginLeft: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center'
    },
    text: {
        ...typography.caption,
        color: palette.text2
    },
    link: {
        ...typography.caption,
        color: palette.primary,
        fontWeight: '600'
    }
})

Agreement.contextType = ThemeContext
