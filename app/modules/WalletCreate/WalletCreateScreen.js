/**
 * @version 0.50
 */
import React, { PureComponent } from 'react'
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'

import Agreement from './elements/Agreement'

import NavStore from '@app/components/navigation/NavStore'

import { setCallback, setFlowType, setMnemonicLength, setWalletName } from '@app/appstores/Stores/CreateWallet/CreateWalletActions'

import { strings, sublocale } from '@app/services/i18n'

import BlocksoftCustomLinks from '@crypto/common/BlocksoftCustomLinks'

import { ThemeContext } from '@app/theme/ThemeProvider'
import { palette, typography, spacing, radius, shadow } from '@app/theme/designSystem'

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
        if (locale === 'uk') link += '_UK'
        else if (locale === 'ru') link += '_RU'
        else link += '_EN'

        const url = BlocksoftCustomLinks.getLink(link, this.context.isLight)
        NavStore.goNext('WebViewScreen', { url, title: strings('walletCreateScreen.termsTitle'), backOnClose: true })
    }

    handlePrivacyPolicyPress = () => {
        const locale = sublocale()
        let link = 'PRIVACY_POLICY'
        if (locale === 'uk') link += '_UK'
        else if (locale === 'ru') link += '_RU'
        else link += '_EN'

        const url = BlocksoftCustomLinks.getLink(link, this.context.isLight)
        NavStore.goNext('WebViewScreen', { url, title: strings('walletCreateScreen.privacyPolicyTitle'), backOnClose: true })
    }

    render() {
        const { checked } = this.state

        MarketingAnalytics.setCurrentScreen('WalletCreate.WalletCreateScreen')
        MarketingEvent.logEvent('gx_view_create_import_screen', {}, 'GX')

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='dark-content' backgroundColor={palette.bg} />

                <View style={styles.hero}>
                    <View style={styles.brandRow}>
                        <Text style={styles.brandMark}>Gravy</Text>
                        <View style={styles.brandDot} />
                    </View>
                    <Text style={styles.tagline}>{strings('walletCreateScreen.welcomeSubtitle')}</Text>
                </View>

                <View style={styles.cta}>
                    <View style={styles.agreementWrap}>
                        <Agreement
                            checked={checked}
                            onPress={this.changeAgreementCallback}
                            handleTerms={this.handleTermsPress}
                            handlePrivacyPolicy={this.handlePrivacyPolicyPress}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[styles.primaryBtn, !checked && styles.primaryBtnDisabled]}
                        onPress={this.handleCreate}
                        disabled={!checked}
                    >
                        <Text style={styles.primaryBtnText}>{strings('walletCreateScreen.createWallet')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.secondaryBtn}
                        onPress={this.handleImport}
                        disabled={!checked}
                    >
                        <Text style={[styles.secondaryBtnText, !checked && styles.secondaryBtnTextDisabled]}>
                            {strings('walletCreateScreen.importWallet')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}

WalletCreateScreen.contextType = ThemeContext

export default WalletCreateScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.bg
    },
    hero: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl2
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.lg
    },
    brandMark: {
        ...typography.display,
        color: palette.text1
    },
    brandDot: {
        width: 12,
        height: 12,
        borderRadius: radius.pill,
        backgroundColor: palette.primary,
        marginBottom: 10,
        marginLeft: 4
    },
    tagline: {
        ...typography.body,
        color: palette.text2,
        textAlign: 'center',
        maxWidth: 280
    },
    cta: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl
    },
    agreementWrap: {
        marginBottom: spacing.xl
    },
    primaryBtn: {
        backgroundColor: palette.primary,
        height: 56,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.lg
    },
    primaryBtnDisabled: {
        backgroundColor: palette.primarySubtle,
        shadowOpacity: 0,
        elevation: 0
    },
    primaryBtnText: {
        ...typography.bodyMedium,
        color: palette.textInverse,
        fontWeight: '600'
    },
    secondaryBtn: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm
    },
    secondaryBtnText: {
        ...typography.bodyMedium,
        color: palette.primary,
        fontWeight: '600'
    },
    secondaryBtnTextDisabled: {
        color: palette.text3
    }
})
