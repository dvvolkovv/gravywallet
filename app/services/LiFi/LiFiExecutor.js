/**
 * LiFi swap executor.
 *
 * Pipeline:
 *   1. Load private key for the wallet's ETH account.
 *   2. If swapping from ERC-20: check allowance, send approve(MAX) if needed.
 *   3. Sign & broadcast LiFi's transactionRequest.
 *   4. Return source-chain txHash. (Cross-chain status polling lives in
 *      the UI layer via LiFiApi.getStatus.)
 *
 * Signs via `web3.eth.accounts.signTransaction` — same primitive as
 * `EthTxSendProvider.sign()` (crypto/blockchains/eth/basic/EthTxSendProvider.ts:53).
 * Broadcasts via the chain's Web3 RPC directly — bypasses the proxy
 * pipeline which is bound to the redux Send flow.
 */
import { Web3Injected } from '@crypto/services/Web3Injected'
import BlocksoftPrivateKeysUtils from '@crypto/common/BlocksoftPrivateKeysUtils'
import LiFiApi from './LiFiApi'

const NATIVE = '0x0000000000000000000000000000000000000000'
const MAX_UINT256 = '0x' + 'f'.repeat(64)

const ERC20_APPROVE_SELECTOR = '0x095ea7b3'
const ERC20_ALLOWANCE_SELECTOR = '0xdd62ed3e'

function pad32(hex) {
    const h = hex.replace(/^0x/, '').toLowerCase()
    return h.padStart(64, '0')
}

function encodeApprove(spender, amountHex = MAX_UINT256) {
    return ERC20_APPROVE_SELECTOR + pad32(spender) + pad32(amountHex)
}

function encodeAllowance(owner, spender) {
    return ERC20_ALLOWANCE_SELECTOR + pad32(owner) + pad32(spender)
}

async function readAllowance(web3, tokenAddress, owner, spender) {
    const data = encodeAllowance(owner, spender)
    const res = await web3.eth.call({ to: tokenAddress, data })
    if (!res || res === '0x') return 0n
    return BigInt(res)
}

async function signAndSend(web3, tx, privateKey) {
    const pk = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey
    const signed = await web3.eth.accounts.signTransaction(tx, pk)
    const txHash = await new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signed.rawTransaction)
            .on('transactionHash', resolve)
            .on('error', reject)
    })
    return txHash
}

async function waitMined(web3, txHash, { timeoutMs = 180000, pollMs = 4000 } = {}) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        const receipt = await web3.eth.getTransactionReceipt(txHash)
        if (receipt) {
            if (receipt.status === false || receipt.status === '0x0') {
                throw new Error(`Tx reverted: ${txHash}`)
            }
            return receipt
        }
        await new Promise(r => setTimeout(r, pollMs))
    }
    throw new Error(`Tx not mined within ${timeoutMs / 1000}s: ${txHash}`)
}

function buildTxFromQuote(quote, nonce) {
    const t = quote.transactionRequest
    if (!t) throw new Error('LiFi quote missing transactionRequest')
    return {
        from: t.from,
        to: t.to,
        data: t.data,
        value: t.value || '0x0',
        gasPrice: t.gasPrice,
        gas: t.gasLimit,
        nonce
    }
}

/**
 * @param {Object} args
 * @param {Object} args.quote          LiFi quote response (full)
 * @param {string} args.fromChainCode  e.g. 'BASE'
 * @param {Object} args.fromAccount    { address, derivationPath, walletHash, currencyCode }
 * @param {(step:string)=>void} [args.onStep] progress callback ('approve'|'swap'|'done')
 * @returns {Promise<{txHash:string}>}
 */
export async function executeSwap({ quote, fromChainCode, fromAccount, onStep }) {
    const step = onStep || (() => {})

    const web3 = Web3Injected(fromChainCode)

    const { privateKey } = await BlocksoftPrivateKeysUtils.getPrivateKey({
        walletHash: fromAccount.walletHash,
        derivationPath: fromAccount.derivationPath,
        currencyCode: 'ETH',
        addressToCheck: fromAccount.address
    }, 'LiFiExecutor.executeSwap')

    const fromTokenAddress = quote.action?.fromToken?.address || NATIVE
    const approvalAddress = quote.estimate?.approvalAddress
    const fromAmount = BigInt(quote.action?.fromAmount || '0')
    const isNative = !fromTokenAddress || fromTokenAddress.toLowerCase() === NATIVE
    let nonce = Number(await web3.eth.getTransactionCount(fromAccount.address, 'pending'))

    if (!isNative && approvalAddress) {
        const allowance = await readAllowance(web3, fromTokenAddress, fromAccount.address, approvalAddress)
        if (allowance < fromAmount) {
            step('approve')
            const gasPrice = quote.transactionRequest?.gasPrice
                ? quote.transactionRequest.gasPrice
                : await web3.eth.getGasPrice()
            const approveTx = {
                from: fromAccount.address,
                to: fromTokenAddress,
                data: encodeApprove(approvalAddress),
                value: '0x0',
                gasPrice,
                gas: 80000,
                nonce
            }
            const approveHash = await signAndSend(web3, approveTx, privateKey)
            await waitMined(web3, approveHash)
            nonce += 1
        }
    }

    step('swap')
    const swapTx = buildTxFromQuote(quote, nonce)
    const swapHash = await signAndSend(web3, swapTx, privateKey)

    step('done')
    return { txHash: swapHash }
}

/**
 * Cross-chain status helper — thin wrapper kept here so the screen
 * can poll with a single import.
 */
export async function pollSwapStatus({ txHash, fromChainCode, toChainCode, bridge, onUpdate, intervalMs = 8000, maxMs = 900000 }) {
    const start = Date.now()
    while (Date.now() - start < maxMs) {
        try {
            const res = await LiFiApi.getStatus({ txHash, fromChainCode, toChainCode, bridge })
            if (onUpdate) onUpdate(res)
            if (res.status === 'DONE' || res.status === 'FAILED') return res
        } catch (_) {
            // transient — keep polling
        }
        await new Promise(r => setTimeout(r, intervalMs))
    }
    throw new Error('LiFi status poll timed out')
}

export default { executeSwap, pollSwapStatus }
