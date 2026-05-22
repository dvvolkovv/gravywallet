/**
 * @version 1.0
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { palette, radius, shadow } from '@app/theme/designSystem'

let CACHE_HEIGHT = 0

class AccountGradientBlock extends React.PureComponent {

    state = {
        viewHeight: 0
    }

    componentDidMount() {
        if (this.props.cleanCache) {
            CACHE_HEIGHT = 0
        }
    }

    processViewHeight = (e) => {
        if (this.props.height) return
        const height = e.nativeEvent.layout.height
        CACHE_HEIGHT = height > 0 ? height : CACHE_HEIGHT
        this.setState({ viewHeight: height })
    }

    render() {
        return (
            <View style={styles.card}>
                <View style={styles.content} onLayout={this.processViewHeight}>
                    {this.props.children}
                </View>
            </View>
        )
    }
}

export default AccountGradientBlock

const styles = StyleSheet.create({
    card: {
        backgroundColor: palette.bg,
        borderRadius: radius.lg,
        padding: 16,
        ...shadow.sm
    },
    content: {
        flex: 1
    }
})
