'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require('debug')('thor:injector');
const thor_devkit_1 = require("thor-devkit");
const utils = require("../utils");
const extendAccounts = function (web3) {
    const web3Utils = web3.utils;
    // signTransaction supports both callback and promise style
    web3.eth.accounts.signTransaction = function signTransaction(ethTx, privateKey, callback) {
        debug('tx to sign: %O', ethTx);
        const sign = function (tx) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!tx.chainTag) {
                    const chainTag = yield web3.eth.getChainTag();
                    if (chainTag) {
                        tx.chainTag = chainTag;
                    }
                    else {
                        throw new Error('error getting chainTag');
                    }
                }
                if (!tx.blockRef) {
                    const blockRef = yield web3.eth.getBlockRef();
                    if (blockRef) {
                        tx.blockRef = blockRef;
                    }
                    else {
                        throw new Error('error getting blockRef');
                    }
                }
                if (tx.data && utils.isHex(tx.data)) {
                    tx.data = utils.toPrefixedHex(tx.data);
                }
                else if (tx.data) {
                    throw new Error('Data must be valid hex');
                }
                else {
                    tx.data = '0x';
                }
                if (!tx.gas) {
                    const pubKey = thor_devkit_1.cry.secp256k1.derivePublicKey(Buffer.from(utils.sanitizeHex(privateKey), 'hex'));
                    const from = '0x' + thor_devkit_1.cry.publicKeyToAddress(pubKey).toString('hex');
                    const gas = yield web3.eth.estimateGas({
                        from,
                        to: tx.to ? tx.to : '',
                        value: tx.value ? tx.value : 0,
                        data: tx.data,
                    });
                    tx.gas = gas;
                }
                if (!tx.nonce) {
                    tx.nonce = utils.newNonce();
                }
                const clause = {
                    value: tx.value || 0,
                    to: tx.to || null,
                    data: tx.data,
                };
                const body = {
                    chainTag: utils.validNumberOrDefault(tx.chainTag, 0),
                    blockRef: tx.blockRef,
                    gas: tx.gas,
                    expiration: utils.validNumberOrDefault(tx.expiration, utils.params.defaultExpiration),
                    gasPriceCoef: utils.validNumberOrDefault(tx.gasPriceCoef, utils.params.defaultGasPriceCoef),
                    dependsOn: !tx.dependsOn ? null : tx.dependsOn,
                    nonce: typeof tx.nonce === 'string' ? utils.toPrefixedHex(tx.nonce) : tx.nonce,
                    clauses: [clause],
                };
                debug('body: %O', body);
                const ThorTx = new thor_devkit_1.Transaction(body);
                const priKey = Buffer.from(utils.sanitizeHex(privateKey), 'hex');
                const signingHash = thor_devkit_1.cry.blake2b256(ThorTx.encode());
                ThorTx.signature = thor_devkit_1.cry.secp256k1.sign(signingHash, priKey);
                const result = {
                    rawTransaction: utils.toPrefixedHex(ThorTx.encode().toString('hex')),
                    messageHash: signingHash,
                };
                return result;
            });
        };
        // for supporting both callback and promise
        if (callback instanceof Function) {
            sign(ethTx).then((ret) => {
                return callback(null, ret);
            }).catch((e) => {
                return callback(e);
            });
        }
        else {
            return sign(ethTx);
        }
    };
    web3.eth.accounts.recoverTransaction = function recoverTransaction(encodedRawTx) {
        const decoded = thor_devkit_1.Transaction.decode(Buffer.from(utils.sanitizeHex(encodedRawTx), 'hex'));
        return decoded.origin;
    };
    web3.eth.accounts.hashMessage = function hashMessage(data) {
        const message = web3Utils.isHexStrict(data) ? web3Utils.hexToBytes(data) : data;
        const messageBuffer = Buffer.from(message);
        const prefix = '\u0019VeChain Signed Message:\n' + message.length.toString();
        const prefixBuffer = Buffer.from(prefix);
        const prefixedMessage = Buffer.concat([prefixBuffer, messageBuffer]);
        return utils.toPrefixedHex(thor_devkit_1.cry.blake2b256(prefixedMessage).toString('hex'));
    };
    web3.eth.accounts.sign = function sign(data, privateKey) {
        const hash = this.hashMessage(data);
        const hashBuffer = Buffer.from(utils.sanitizeHex(hash), 'hex');
        const privateKeyBuffer = Buffer.from(utils.sanitizeHex(privateKey), 'hex');
        const signature = thor_devkit_1.cry.secp256k1.sign(hashBuffer, privateKeyBuffer).toString('hex');
        return {
            message: data,
            messageHash: utils.toPrefixedHex(hash),
            signature: utils.toPrefixedHex(signature),
        };
    };
    web3.eth.accounts.recover = function recover(message, signature, preFixed) {
        if (utils.isObject(message)) {
            return this.recover(message.messageHash, message.signature, true);
        }
        if (!preFixed) {
            message = this.hashMessage(message);
        }
        const hexBuffer = Buffer.from(utils.sanitizeHex(message), 'hex');
        const signatureBuffer = Buffer.from(utils.sanitizeHex(signature), 'hex');
        const pubKey = thor_devkit_1.cry.secp256k1.recover(hexBuffer, signatureBuffer);
        const address = thor_devkit_1.cry.publicKeyToAddress(pubKey);
        return utils.toPrefixedHex(address.toString('hex'));
    };
};
exports.extendAccounts = extendAccounts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL2FjY291bnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7QUFFWixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDL0MsNkNBQThDO0FBRTlDLGtDQUFpQztBQUVqQyxNQUFNLGNBQWMsR0FBRyxVQUFTLElBQVM7SUFFckMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUM1QiwyREFBMkQ7SUFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLFNBQVMsZUFBZSxDQUFDLEtBQXFCLEVBQUUsVUFBa0IsRUFBRSxRQUFrQjtRQUN0SCxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFOUIsTUFBTSxJQUFJLEdBQUcsVUFBZSxFQUFrQjs7Z0JBQzFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUNkLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtvQkFDN0MsSUFBSSxRQUFRLEVBQUU7d0JBQ1YsRUFBRSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7cUJBQ3pCO3lCQUFNO3dCQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtxQkFDNUM7aUJBQ0o7Z0JBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQ2QsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFBO29CQUM3QyxJQUFJLFFBQVEsRUFBRTt3QkFDVixFQUFFLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtxQkFDekI7eUJBQU07d0JBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFB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