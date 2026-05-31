/**
 * Two-row horizontal grid of currency tiles.
 *
 * Layout: data is chunked into pairs; horizontal FlatList renders one
 * "column" per pair, each column being a vertical stack of 2 tiles.
 * Result: 2 rows, scrolling sideways through assets.
 */
import React, { PureComponent } from 'react'
import { View, FlatList, Dimensions, StyleSheet } from 'react-native'

import CryptoCurrencyTile from './CryptoCurrencyTile'
import { spacing } from '@app/theme/designSystem'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Tile sized so 2.5 columns fit on screen — leaves a "peek" so the user
// can see the grid is scrollable.
const HORIZONTAL_PADDING = spacing.lg
const GAP = spacing.md
const TILES_VISIBLE = 2.5
const TILE_SIZE = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (TILES_VISIBLE - 1)) / TILES_VISIBLE)

function chunkPairs(arr) {
    const pairs = []
    for (let i = 0; i < arr.length; i += 2) {
        pairs.push([arr[i], arr[i + 1]])
    }
    return pairs
}

export default class CryptoCurrencyGrid extends PureComponent {

    keyExtractor = (pair, idx) => `pair-${idx}-${pair[0]?.currencyCode || ''}`

    renderColumn = ({ item: pair }) => (
        <View style={styles.column}>
            <CryptoCurrencyTile
                cryptoCurrency={pair[0]}
                isBalanceVisible={this.props.isBalanceVisible}
                size={TILE_SIZE}
            />
            {pair[1] ? (
                <CryptoCurrencyTile
                    cryptoCurrency={pair[1]}
                    isBalanceVisible={this.props.isBalanceVisible}
                    size={TILE_SIZE}
                />
            ) : (
                <View style={{ width: TILE_SIZE, height: TILE_SIZE }} />
            )}
        </View>
    )

    render() {
        const { data } = this.props
        if (!data?.length) return null
        const pairs = chunkPairs(data)

        return (
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={pairs}
                renderItem={this.renderColumn}
                keyExtractor={this.keyExtractor}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            />
        )
    }
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingVertical: spacing.md
    },
    column: {
        gap: GAP
    }
})
