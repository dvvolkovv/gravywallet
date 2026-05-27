/**
 * @version 1.1
 */
import React, { PureComponent } from 'react'
import { View, StyleSheet, StatusBar, BackHandler, SafeAreaView, Dimensions } from 'react-native'
import Video from 'react-native-video'

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

import { palette } from '@app/theme/designSystem'

import gravyVideo from '@assets/videos/gravy.mp4'

const MNEMONIC_PHRASE_LENGTH = 128
const MIN_VIDEO_MS = 5100

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const VIDEO_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT)

class WalletCreateWithAnimation extends PureComponent {

    walletDone = false
    videoDone = false
    navigated = false

    async componentDidMount() {
        this.backButtonHandler = this.backButtonHandler.bind(this)
        BackHandler.addEventListener('backPress', this.backButtonHandler)
        this.createWallet()
        setTimeout(() => {
            this.videoDone = true
            this.maybeNavigate()
        }, MIN_VIDEO_MS)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('backPress', this.backButtonHandler)
    }

    backButtonHandler() {
        return true
    }

    maybeNavigate = () => {
        if (this.navigated) return
        if (!this.walletDone || !this.videoDone) return
        this.navigated = true
        NavStore.reset('TabBar')
    }

    onVideoEnd = () => {
        this.videoDone = true
        this.maybeNavigate()
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

        this.walletDone = true
        this.maybeNavigate()
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='dark-content' backgroundColor={palette.bg} />
                <View style={styles.center}>
                    <Video
                        source={gravyVideo}
                        style={{ width: VIDEO_SIZE, height: VIDEO_SIZE }}
                        resizeMode='contain'
                        muted
                        repeat={false}
                        playInBackground={false}
                        playWhenInactive={false}
                        ignoreSilentSwitch='ignore'
                        onEnd={this.onVideoEnd}
                    />
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
        justifyContent: 'center'
    }
})
