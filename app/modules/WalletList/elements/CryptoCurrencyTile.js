/**
 * Square currency tile — used in the new 2-row dashboard grid.
 *
 * Mirrors the data flow of CryptoCurrency.js (redux-connected to
 * getAccountCurrency) but ditches the swipe-row/long-press UX in favour
 * of a tap-only tile suited for grid layout.
 */
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import CurrencyIcon from '@app/components/elements/CurrencyIcon'

import { getAccountCurrency } from '@app/appstores/Stores/Account/selectors'
import BlocksoftPrettyNumbers from '@crypto/common/BlocksoftPrettyNumbers'

import { ThemeContext } from '@app/theme/ThemeProvider'
import { paletteDark, paletteLight, typography, spacing, radius } from '@app/theme/designSystem'

import { handleCurrencySelect } from '../helpers'

class CryptoCurrencyTile extends PureComponent {

    handlePress = () => {
        handleCurrencySelect(this.props, false, null)
    }

    render() {
        const { cryptoCurrency, account, isBalanceVisible, size } = this.props
        const { isLight } = this.context
        const p = isLight ? paletteLight : paletteDark

        const currencyCode = cryptoCurrency?.currencyCode || 'BTC'
        const symbol = cryptoCurrency?.currencySymbol || ''
        const fiat = account?.basicCurrencyBalance
        const fiatSym = account?.basicCurrencySymbol || ''
        const change = Number(cryptoCurrency?.priceChangePercentage24h) || 0

        const balanceLine = isBalanceVisible
            ? (fiat ? `${fiatSym}${BlocksoftPrettyNumbers.makeCut(fiat, 2).separated}` : '—')
            : '••••'

        const changeColor = change >= 0 ? p.success : p.danger
        const changeLabel = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={this.handlePress}
                style={[
                    styles.tile,
                    {
                        width: size,
                        height: size,
                        backgroundColor: p.surface,
                        borderColor: p.border,
                        borderWidth: isLight ? 0 : 1
                    }
                ]}
            >
                <View style={styles.row}>
                    <CurrencyIcon currencyCode={currencyCode} containerStyle={styles.icon} markStyle={{}} />
                    {change !== 0 ? (
                        <Text style={[styles.change, { color: changeColor }]} numberOfLines={1}>
                            {changeLabel}
                        </Text>
                    ) : null}
                </View>
                <View style={styles.bottom}>
                    <Text style={[styles.symbol, { color: p.text1 }]} numberOfLines={1}>
                        {symbol || currencyCode}
                    </Text>
                    <Text style={[styles.balance, { color: p.text2 }]} numberOfLines={1}>
                        {balanceLine}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

CryptoCurrencyTile.contextType = ThemeContext

const styles = StyleSheet.create({
    tile: {
        borderRadius: radius.lg,
        padding: spacing.md,
        justifyContent: 'space-between'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    icon: {
        width: 36,
        height: 36
    },
    change: {
        ...typography.small,
        textTransform: 'none'
    },
    bottom: {
        gap: 2
    },
    symbol: {
        ...typography.heading,
        fontSize: 16
    },
    balance: {
        ...typography.caption
    }
})

const mapStateToProps = (state, props) => ({
    account: getAccountCurrency(state, props)
})

export default connect(mapStateToProps)(CryptoCurrencyTile)
