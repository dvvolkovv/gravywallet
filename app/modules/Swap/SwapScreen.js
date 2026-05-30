/**
 * Gravy Swap — cross-chain swap & bridge via LiFi.
 *
 * Phase 2 MVP: chain & token pickers, amount input, quote display.
 * Execution is wired in a follow-up (signs LiFi's transactionRequest via
 * the existing EthTransferProcessor).
 */
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import ScreenWrapper from '@app/components/elements/ScreenWrapper'
import NavStore from '@app/components/navigation/NavStore'
import Toast from '@app/services/UI/Toast/Toast'

import { palette, typography, spacing, radius, shadow } from '@app/theme/designSystem'
import LiFiApi from '@app/services/LiFi/LiFiApi'

const SUPPORTED_CHAINS = [
    { code: 'ETH', name: 'Ethereum' },
    { code: 'BASE', name: 'Base' },
    { code: 'ARB', name: 'Arbitrum' },
    { code: 'OPTIMISM', name: 'Optimism' },
    { code: 'MATIC', name: 'Polygon' },
    { code: 'AVAX', name: 'Avalanche' },
    { code: 'LINEA', name: 'Linea' },
    { code: 'SCROLL', name: 'Scroll' },
    { code: 'BNB_SMART', name: 'BNB Chain' }
]

const NATIVE_BY_CHAIN = {
    ETH: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    BASE: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    ARB: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    OPTIMISM: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    MATIC: { symbol: 'MATIC', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    AVAX: { symbol: 'AVAX', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    LINEA: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    SCROLL: { symbol: 'ETH', address: LiFiApi.NATIVE_TOKEN, decimals: 18 },
    BNB_SMART: { symbol: 'BNB', address: LiFiApi.NATIVE_TOKEN, decimals: 18 }
}

const USDC_BY_CHAIN = {
    ETH: { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    BASE: { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    ARB: { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
    OPTIMISM: { symbol: 'USDC', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 },
    MATIC: { symbol: 'USDC', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
    AVAX: { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
    LINEA: { symbol: 'USDC', address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', decimals: 6 },
    SCROLL: { symbol: 'USDC', address: '0x06eFdBFf2a14a7c8e15944D1F4A48F9F95F663A4', decimals: 6 },
    BNB_SMART: { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 }
}

const USDT_BY_CHAIN = {
    ETH: { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    BASE: { symbol: 'USDT', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
    ARB: { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
    OPTIMISM: { symbol: 'USDT', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
    MATIC: { symbol: 'USDT', address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimals: 6 },
    AVAX: { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
    LINEA: { symbol: 'USDT', address: '0xA219439258ca9da29E9Cc4cE5596924745e12B93', decimals: 6 },
    SCROLL: { symbol: 'USDT', address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df', decimals: 6 },
    BNB_SMART: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 }
}

function tokensFor(chainCode) {
    return [
        NATIVE_BY_CHAIN[chainCode],
        USDC_BY_CHAIN[chainCode],
        USDT_BY_CHAIN[chainCode]
    ].filter(Boolean)
}

function shiftToBigInt(amountStr, decimals) {
    const [whole, frac = ''] = String(amountStr).split('.')
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
    const combined = (whole + fracPadded).replace(/^0+/, '') || '0'
    return combined
}

function shiftFromBigInt(rawStr, decimals) {
    if (!rawStr) return '0'
    const padded = rawStr.padStart(decimals + 1, '0')
    const whole = padded.slice(0, -decimals)
    const frac = padded.slice(-decimals).replace(/0+$/, '')
    return frac ? `${whole}.${frac}` : whole
}

class SwapScreen extends PureComponent {

    state = {
        fromChainCode: 'BASE',
        toChainCode: 'ARB',
        fromTokenIdx: 1,   // USDC by default — most common swap unit
        toTokenIdx: 1,
        amount: '',
        loading: false,
        quote: null,
        error: null
    }

    handleBack = () => NavStore.goBack()

    pickChain = (side) => {
        const used = side === 'from' ? this.state.fromChainCode : this.state.toChainCode
        const idx = SUPPORTED_CHAINS.findIndex(c => c.code === used)
        const next = SUPPORTED_CHAINS[(idx + 1) % SUPPORTED_CHAINS.length].code
        if (side === 'from') {
            this.setState({ fromChainCode: next, fromTokenIdx: 0, quote: null })
        } else {
            this.setState({ toChainCode: next, toTokenIdx: 0, quote: null })
        }
    }

    pickToken = (side) => {
        const chainCode = side === 'from' ? this.state.fromChainCode : this.state.toChainCode
        const tokens = tokensFor(chainCode)
        const idx = side === 'from' ? this.state.fromTokenIdx : this.state.toTokenIdx
        const next = (idx + 1) % tokens.length
        if (side === 'from') {
            this.setState({ fromTokenIdx: next, quote: null })
        } else {
            this.setState({ toTokenIdx: next, quote: null })
        }
    }

    flipSides = () => {
        const { fromChainCode, toChainCode, fromTokenIdx, toTokenIdx } = this.state
        this.setState({
            fromChainCode: toChainCode,
            toChainCode: fromChainCode,
            fromTokenIdx: toTokenIdx,
            toTokenIdx: fromTokenIdx,
            quote: null
        })
    }

    fetchQuote = async () => {
        const { fromChainCode, toChainCode, fromTokenIdx, toTokenIdx, amount } = this.state
        const fromTokens = tokensFor(fromChainCode)
        const toTokens = tokensFor(toChainCode)
        const fromToken = fromTokens[fromTokenIdx]
        const toToken = toTokens[toTokenIdx]

        if (!amount || Number(amount) <= 0) {
            this.setState({ error: 'Enter amount' })
            return
        }

        const fromAddress = this.props.ethAddress
        if (!fromAddress) {
            this.setState({ error: 'No ETH wallet found. Create one first.' })
            return
        }

        this.setState({ loading: true, error: null, quote: null })

        try {
            const quote = await LiFiApi.getQuote({
                fromChainCode,
                toChainCode,
                fromTokenAddress: fromToken.address,
                toTokenAddress: toToken.address,
                fromAmount: shiftToBigInt(amount, fromToken.decimals),
                fromAddress
            })
            this.setState({ quote, loading: false })
        } catch (e) {
            this.setState({ error: e.message, loading: false })
        }
    }

    handleExecute = () => {
        Toast.setMessage('Execution coming in next release — Phase 2.5').show()
    }

    renderTokenRow(side) {
        const chainCode = side === 'from' ? this.state.fromChainCode : this.state.toChainCode
        const tokenIdx = side === 'from' ? this.state.fromTokenIdx : this.state.toTokenIdx
        const tokens = tokensFor(chainCode)
        const token = tokens[tokenIdx]
        const chain = SUPPORTED_CHAINS.find(c => c.code === chainCode)
        return (
            <View style={styles.row}>
                <TouchableOpacity style={styles.chip} onPress={() => this.pickChain(side)}>
                    <Text style={styles.chipLabel}>{chain.name}</Text>
                    <MaterialCommunityIcon name='chevron-down' size={16} color={palette.text2} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} onPress={() => this.pickToken(side)}>
                    <Text style={styles.chipLabel}>{token.symbol}</Text>
                    <MaterialCommunityIcon name='chevron-down' size={16} color={palette.text2} />
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { amount, loading, quote, error, fromChainCode, toChainCode, fromTokenIdx, toTokenIdx } = this.state
        const fromTokens = tokensFor(fromChainCode)
        const toTokens = tokensFor(toChainCode)
        const fromToken = fromTokens[fromTokenIdx]
        const toToken = toTokens[toTokenIdx]

        let estimateOut = null
        let estimateUsd = null
        let bridgeName = null
        let durationSec = null
        if (quote && quote.estimate) {
            estimateOut = shiftFromBigInt(quote.estimate.toAmount || '0', toToken.decimals)
            estimateUsd = quote.estimate.toAmountUSD
            bridgeName = quote.tool || quote.toolDetails?.name
            durationSec = quote.estimate.executionDuration
        }

        return (
            <ScreenWrapper
                leftType='back'
                leftAction={this.handleBack}
                title='Swap & Bridge'
            >
                <ScrollView style={{ backgroundColor: palette.bg }} contentContainerStyle={styles.page}>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>You pay</Text>
                        {this.renderTokenRow('from')}
                        <TextInput
                            style={styles.amountInput}
                            value={amount}
                            onChangeText={(t) => this.setState({ amount: t, quote: null })}
                            placeholder='0.0'
                            placeholderTextColor={palette.text3}
                            keyboardType='decimal-pad'
                        />
                    </View>

                    <TouchableOpacity style={styles.flipBtn} onPress={this.flipSides}>
                        <MaterialCommunityIcon name='swap-vertical' size={24} color={palette.primary} />
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>You receive</Text>
                        {this.renderTokenRow('to')}
                        <Text style={styles.receiveAmount} numberOfLines={1}>
                            {estimateOut ?? '—'}
                        </Text>
                        {estimateUsd ? <Text style={styles.usdHint}>≈ ${Number(estimateUsd).toFixed(2)}</Text> : null}
                    </View>

                    {quote && (
                        <View style={styles.metaCard}>
                            <View style={styles.metaRow}>
                                <Text style={styles.metaKey}>Route</Text>
                                <Text style={styles.metaVal}>{bridgeName || '—'}</Text>
                            </View>
                            {durationSec ? (
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaKey}>Est. time</Text>
                                    <Text style={styles.metaVal}>{Math.round(durationSec / 60)} min</Text>
                                </View>
                            ) : null}
                            <View style={styles.metaRow}>
                                <Text style={styles.metaKey}>Slippage</Text>
                                <Text style={styles.metaVal}>0.5%</Text>
                            </View>
                        </View>
                    )}

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    {!quote ? (
                        <TouchableOpacity
                            style={[styles.cta, loading && styles.ctaDisabled]}
                            onPress={loading ? null : this.fetchQuote}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={palette.textInverse} />
                            ) : (
                                <Text style={styles.ctaLabel}>Get quote</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.cta} onPress={this.handleExecute}>
                            <Text style={styles.ctaLabel}>Swap</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={styles.disclaimer}>
                        Quotes powered by LiFi. Execution in next release.
                    </Text>

                </ScrollView>
            </ScreenWrapper>
        )
    }
}

const styles = StyleSheet.create({
    page: {
        padding: spacing.lg,
        paddingBottom: spacing.xl3
    },
    card: {
        backgroundColor: palette.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md
    },
    cardLabel: {
        ...typography.caption,
        color: palette.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.6
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: palette.bg,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: palette.border
    },
    chipLabel: {
        ...typography.bodyMedium,
        color: palette.text1
    },
    amountInput: {
        ...typography.display,
        color: palette.text1,
        padding: 0,
        marginTop: spacing.sm
    },
    receiveAmount: {
        ...typography.display,
        color: palette.text1,
        marginTop: spacing.sm
    },
    usdHint: {
        ...typography.caption,
        color: palette.text2
    },
    flipBtn: {
        alignSelf: 'center',
        backgroundColor: palette.primarySubtle,
        borderRadius: radius.pill,
        padding: spacing.md,
        marginVertical: -spacing.md,
        zIndex: 1
    },
    metaCard: {
        marginTop: spacing.lg,
        backgroundColor: palette.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        gap: spacing.sm
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    metaKey: {
        ...typography.body,
        color: palette.text2
    },
    metaVal: {
        ...typography.bodyMedium,
        color: palette.text1
    },
    error: {
        ...typography.body,
        color: palette.danger,
        marginTop: spacing.lg,
        textAlign: 'center'
    },
    cta: {
        marginTop: spacing.xl,
        backgroundColor: palette.primary,
        borderRadius: radius.pill,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        ...shadow.lg
    },
    ctaDisabled: {
        backgroundColor: palette.text3
    },
    ctaLabel: {
        ...typography.heading,
        color: palette.textInverse
    },
    disclaimer: {
        ...typography.caption,
        color: palette.text3,
        textAlign: 'center',
        marginTop: spacing.lg
    }
})

const mapStateToProps = (state) => {
    const selectedWallet = state.mainStore?.selectedWallet?.walletHash
    const accountList = state.accountStore?.accountList || {}
    const ethAccount = selectedWallet && accountList[selectedWallet]
        ? accountList[selectedWallet]['ETH']
        : null
    return {
        ethAddress: ethAccount?.address || null
    }
}

export default connect(mapStateToProps)(SwapScreen)
