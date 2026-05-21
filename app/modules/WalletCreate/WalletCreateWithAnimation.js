/**
 * @version 1.0
 */
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, StatusBar, BackHandler, ActivityIndicator, SafeAreaView } from 'react-native'

import NavStore from '@app/components/navigation/NavStore'

import { ThemeContext } from '@app/theme/ThemeProvider'

import Log from '@app/services/Log/Log'
import { strings } from '@app/services/i18n'
import MarketingEvent from '@app/services/Marketing/MarketingEvent'

import BlocksoftKeys from '@crypto/actions/BlocksoftKeys/BlocksoftKeys'

import walletActions from '@app/appstores/Stores/Wallet/WalletActions'
import { showModal } from '@app/appstores/Stores/Modal/ModalActions'
import App from '@app/appstores/Actions/App/App'
import { proceedSaveGeneratedWallet } from '@app/appstores/Stores/CreateWallet/CreateWalletActions'

import { deleteUserPinCode } from '@haskkor/react-native-pincode'
import { SettingsKeystore } from '@app/appstores/Stores/Settings/SettingsKeystore'

import { palette, typography, spacing, radius } from '@app/theme/designSystem'

const MNEMONIC_PHRASE_LENGTH = 128

class WalletCreateWithAnimation extends PureComponent {

    async componentDidMount() {
        this.backButtonHandler = this.backButtonHandler.bind(this)
        BackHandler.addEventListener('backPress', this.backButtonHandler)
        await this.createWallet()
        this.handleGoHomeScreen()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('backPress', this.backButtonHandler)
    }

    backButtonHandler() {
        return true
    }

    createWallet = async () => {
        deleteUserPinCode()
        await SettingsKeystore.setLockScreenStatus(false)

        let walletMnemonic = ''
        let walletName = ''

        try {
            walletMnemonic = (await BlocksoftKeys.newMnemonic(MNEMONIC_PHRASE_LENGTH)).mnemonic
            walletName = await walletActions.getNewWalletName()

            try {
                await proceedSaveGeneratedWallet({
                    walletName,
                    walletMnemonic,
                    walletNumber: 1
                })
            } catch (e) {
                e.message += ' while proceedSaveGeneratedWallet'
                throw e
            }

            try {
                App.init({ source: 'WalletCreateWithAnimation.createWallet', onMount: false })
            } catch (e) {
                e.message += ' while WalletCreateWithAnimation.createWallet'
                throw e
            }
        } catch {
            Log.log('WalletCreateWithAnimation.createWallet error mnemonic generation')
        }

        if (!walletMnemonic || walletMnemonic === '') {
            Log.log('WalletCreateWithAnimation.createWallet no mnenonic for new wallet')
            showModal({
                type: 'INFO_MODAL',
                icon: 'WARNING',
                title: strings('settings.walletList.backupModal.title'),
                description: 'new wallet is not generated - please reinstall and restart'
            })
        }

        MarketingEvent.logEvent('gx_view_create_gif_screen_tap_create', { number: '1', source: 'WalletCreateWithAnimation' }, 'GX')
    }

    handleGoHomeScreen = () => {
        NavStore.reset('TabBar')
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='dark-content' backgroundColor={palette.bg} />
                <View style={styles.center}>
                    <View style={styles.brandRow}>
                        <Text style={styles.brandMark}>Gravy</Text>
                        <View style={styles.brandDot} />
                    </View>
                    <ActivityIndicator size='large' color={palette.primary} style={styles.spinner} />
                    <Text style={styles.caption}>Generating your wallet…</Text>
                </View>
            </SafeAreaView>
        )
    }
}

WalletCreateWithAnimation.contextType = ThemeContext

export default WalletCreateWithAnimation

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.bg
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl2
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: spacing.xl2
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
    spinner: {
        marginBottom: spacing.lg
    },
    caption: {
        ...typography.body,
        color: palette.text2,
        textAlign: 'center'
    }
})
