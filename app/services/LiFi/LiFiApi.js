/**
 * LiFi REST API wrapper for cross-chain swaps and bridges.
 *
 * Docs: https://docs.li.fi/li.fi-api
 * Base: https://li.quest/v1
 *
 * Phase 2 — quotes only. Execution is wired in a follow-up via
 * EthTransferProcessor.
 */

const BASE_URL = 'https://li.quest/v1'

const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000'

const CHAIN_ID_BY_CODE = {
    ETH: 1,
    OPTIMISM: 10,
    BNB_SMART: 56,
    MATIC: 137,
    BASE: 8453,
    ARB: 42161,
    AVAX: 43114,
    LINEA: 59144,
    SCROLL: 534352,
    FTM: 250
}

const CHAIN_CODE_BY_ID = Object.fromEntries(
    Object.entries(CHAIN_ID_BY_CODE).map(([k, v]) => [v, k])
)

const HEADERS = { 'Content-Type': 'application/json' }

async function call(path, params) {
    const qs = params
        ? '?' + Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&')
        : ''
    const url = `${BASE_URL}${path}${qs}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`LiFi ${res.status}: ${body.slice(0, 200)}`)
    }
    return res.json()
}

/**
 * Get a swap/bridge quote.
 *
 * @param {Object} args
 * @param {string} args.fromChainCode   currencyCode of source chain (e.g. 'BASE')
 * @param {string} args.toChainCode     currencyCode of destination chain
 * @param {string} args.fromTokenAddress contract address or NATIVE_TOKEN for native coin
 * @param {string} args.toTokenAddress   contract address or NATIVE_TOKEN
 * @param {string} args.fromAmount      raw amount in source token's smallest unit (wei-like)
 * @param {string} args.fromAddress     user's wallet address (also used as toAddress unless overridden)
 * @param {string} [args.toAddress]     override destination — defaults to fromAddress
 * @param {number} [args.slippage]      0.005 = 0.5% (default 0.005)
 */
async function getQuote(args) {
    const fromChain = CHAIN_ID_BY_CODE[args.fromChainCode]
    const toChain = CHAIN_ID_BY_CODE[args.toChainCode]
    if (!fromChain || !toChain) {
        throw new Error(`Unsupported chain: ${args.fromChainCode} → ${args.toChainCode}`)
    }
    return call('/quote', {
        fromChain,
        toChain,
        fromToken: args.fromTokenAddress || NATIVE_TOKEN,
        toToken: args.toTokenAddress || NATIVE_TOKEN,
        fromAmount: args.fromAmount,
        fromAddress: args.fromAddress,
        toAddress: args.toAddress || args.fromAddress,
        slippage: args.slippage ?? 0.005,
        integrator: 'gravy-wallet'
    })
}

/**
 * Poll the cross-chain status of an executed swap.
 * Source tx hash from broadcast → bridging progress.
 */
async function getStatus({ txHash, fromChainCode, toChainCode, bridge }) {
    return call('/status', {
        txHash,
        fromChain: CHAIN_ID_BY_CODE[fromChainCode],
        toChain: CHAIN_ID_BY_CODE[toChainCode],
        bridge
    })
}

/**
 * Fetch token list for one chain. Cached at LiFi side, no auth needed.
 */
async function getTokens(chainCode) {
    const chainId = CHAIN_ID_BY_CODE[chainCode]
    if (!chainId) return []
    const res = await call('/tokens', { chains: chainId })
    return (res.tokens && res.tokens[chainId]) || []
}

export default {
    NATIVE_TOKEN,
    CHAIN_ID_BY_CODE,
    CHAIN_CODE_BY_ID,
    getQuote,
    getStatus,
    getTokens
}
