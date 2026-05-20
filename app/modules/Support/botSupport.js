/**
 * @version 1.0
 * @description Gravy Wallet static support screen (email + website)
 */
import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity
} from 'react-native'

import { strings } from '@app/services/i18n'
import { ThemeContext } from '@app/theme/ThemeProvider'
import MarketingAnalytics from '@app/services/Marketing/MarketingAnalytics'

import ScreenWrapper from '@app/components/elements/ScreenWrapper'

class BotSupportScreen extends React.PureComponent {

    componentDidMount() {
        MarketingAnalytics.setCurrentScreen('BotSupportScreen')
    }

    handleBack = () => {
        this.props.navigation.goBack()
    }

    handleEmail = () => {
        Linking.openURL('mailto:support@gravy.app')
    }

    handleSite = () => {
        Linking.openURL('https://gravy.app')
    }

    render() {
        const { colors } = this.context

        return (
            <ScreenWrapper
                title={strings('settings.about.contactSupportTitle')}
                leftType='back'
                leftAction={this.handleBack}
            >
                <View style={[styles.container, { backgroundColor: colors.common.background }]}>
                    <Text style={[styles.title, { color: colors.common.text1 }]}>
                        {strings('support.title')}
                    </Text>
                    <Text style={[styles.body, { color: colors.common.text2 }]}>
                        {strings('support.body')}
                    </Text>
                    <TouchableOpacity onPress={this.handleEmail} style={styles.linkRow}>
                        <Text style={[styles.link, { color: colors.common.checkbox.bgChecked }]}>
                            support@gravy.app
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.handleSite} style={styles.linkRow}>
                        <Text style={[styles.link, { color: colors.common.checkbox.bgChecked }]}>
                            gravy.app
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        )
    }
}

BotSupportScreen.contextType = ThemeContext

export default BotSupportScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontFamily: 'SFUIDisplay-SemiBold',
        fontSize: 22,
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 16
    },
    body: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24
    },
    linkRow: {
        marginTop: 12
    },
    link: {
        fontFamily: 'SFUIDisplay-SemiBold',
        fontSize: 16,
        lineHeight: 22,
        textDecorationLine: 'underline'
    }
})
