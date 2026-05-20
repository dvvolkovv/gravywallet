/**
 * @version 0.41
 */
import React, { PureComponent } from 'react'
import { View, Image, Text, StatusBar, StyleSheet } from 'react-native'

import Agreement from './elements/Agreement'
import Button from '@app/components/elements/new/buttons/Button'

import NavStore from '@app/components/navigation/NavStore'

import { setCallback, setFlowType, setMnemonicLength, setWalletName } from '@app/appstores/Stores/CreateWallet/CreateWalletActions'

import { strings, sublocale } from '@app/services/i18n'

import BlocksoftCustomLinks from '@crypto/common/BlocksoftCustomLinks'

import { ThemeContext } from '@app/theme/ThemeProvider'

import MarketingAnalytics from '@app/services/Marketing/MarketingAnalytics'
import MarketingEvent from '@app/services/Marketing/MarketingEvent'

class WalletCreateScreen extends PureComponent {
    state = {
        checked: false
    }

    handleSelect = (data) => {
        setFlowType(data)
        setCallback({ callback: 'InitScreen' })
        setWalletName({ walletName: '' })
        setMnemonicLength({ mnemonicLength: 128 })

        if (data.flowType === 'CREATE_NEW_WALLET') {
            NavStore.goNext('BackupStep0Screen', { flowSubtype: 'createFirst' })
        } else {
            NavStore.goNext('EnterMnemonicPhrase', { flowSubtype: 'importFirst' })
        }
        setTimeout(() => {
            this.setState(() => ({ checked: false }))
        }, 500)
    }

    handleCreate = () => {
        NavStore.goNext('WalletCreateWithAnimation')
    }

    handleImport = () => {
        MarketingEvent.logEvent('gx_view_create_import_screen_tap_import', { number: '1', source: 'WalletCreateScreen' }, 'GX')
        this.handleSelect({ flowType: 'IMPORT_WALLET', source: 'WalletCreateScreen', walletNumber: 1 })
    }

    changeAgreementCallback = () => {
        this.setState((state) => ({ checked: !state.checked }))
    }

    handleTermsPress = () => {
        const locale = sublocale()

        let link = 'TERMS'
        if (locale === 'uk') {
            link += '_UK'
        } else if (locale === 'ru') {
            link += '_RU'
        } else {
            link += '_EN'
        }

        const url = BlocksoftCustomLinks.getLink(link, this.context.isLight)
        NavStore.goNext('WebViewScreen', { url, title: strings('walletCreateScreen.termsTitle'), backOnClose: true })
    }

    handlePrivacyPolicyPress = () => {
        const locale = sublocale()

        let link = 'PRIVACY_POLICY'
        if (locale === 'uk') {
            link += '_UK'
        } else if (locale === 'ru') {
            link += '_RU'
        } else {
            link += '_EN'
        }
        const url = BlocksoftCustomLinks.getLink(link, this.context.isLight)
        NavStore.goNext('WebViewScreen', { url, title: strings('walletCreateScreen.privacyPolicyTitle'), backOnClose: true })
    }

    render() {
        const { colors, GRID_SIZE } = this.context

        MarketingAnalytics.setCurrentScreen('WalletCreate.WalletCreateScreen')
        MarketingEvent.logEvent('gx_view_create_import_screen', {}, 'GX')

        return (
            <View style={styles.container}>
                <StatusBar barStyle='light-content' />
                <View style={styles.welcomeContainer}>
                    <Image
                        source={require('@assets/images/gravy-logo.png')}
                        style={styles.welcomeLogo}
                        resizeMode='contain'
                    />
                    <Text style={[styles.welcomeTitle, { color: colors.common.text1 }]}>{strings('walletCreateScreen.welcomeTitle')}</Text>
                    <Text style={[styles.welcomeSubtitle, { color: colors.common.text2 }]}>{strings('walletCreateScreen.welcomeSubtitle')}</Text>
                </View>
                <View style={[styles.bottomContent, { paddingHorizontal: GRID_SIZE, backgroundColor: colors.common.background }]}>
                    <View style={[styles.agreementContainer, { marginHorizontal: GRID_SIZE }]}>
                        <Agreement
                            checked={this.state.checked}
                            onPress={this.changeAgreementCallback}
                            handleTerms={this.handleTermsPress}
                            handlePrivacyPolicy={this.handlePrivacyPolicyPress}
                        />
                    </View>
                    <Button title={strings('walletCreateScreen.createWallet')} disabled={!this.state.checked} onPress={this.handleCreate} />
                    <Button
                        type='transparent'
                        title={strings('walletCreateScreen.importWallet')}
                        disabled={!this.state.checked}
                        onPress={this.handleImport}
                        containerStyle={styles.importButton}
                    />
                </View>
            </View>
        )
    }
}

WalletCreateScreen.contextType = ThemeContext

export default WalletCreateScreen

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bottomContent: {
        flex: 2,
        justifyContent: 'center',
        paddingBottom: 16
    },
    welcomeContainer: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32
    },
    welcomeLogo: {
        width: 120,
        height: 120,
        marginBottom: 32
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center'
    },
    welcomeSubtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center'
    },
    agreementContainer: {
        marginBottom: 20
    },
    importButton: {
        marginTop: 8
    }
})
