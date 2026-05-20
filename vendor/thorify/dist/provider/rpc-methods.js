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
const thor_devkit_1 = require("thor-devkit");
const utils = require("../utils");
const simple_http_1 = require("./simple-http");
const debug = require('debug')('thor:http-provider:rpc');
exports.RPCMethodMap = new Map();
const HTTPPostProcessor = function (res) {
    if (res.Code === 0) {
        return Promise.reject(new Error(`[thor-provider] Invalid response, check the host`));
    }
    if (res.Code !== 200) {
        return Promise.reject(new Error(res.Body ? res.Body : ('[thor-provider] Invalid response code from provider: ' + res.Code)));
    }
    return Promise.resolve(res.Body);
};
exports.RPCMethodMap.set('eth_getBlockByNumber', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/blocks/' + utils.fromETHBlockNumber(rpc.params[0]);
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(res);
    });
});
exports.RPCMethodMap.set('eth_getBlockByHash', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/blocks/' + rpc.params[0];
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(res);
    });
});
exports.RPCMethodMap.set('eth_blockNumber', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/blocks/best';
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.number);
    });
});
exports.RPCMethodMap.set('eth_getBalance', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/accounts/' + rpc.params[0] + '?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[1]);
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.balance);
    });
});
exports.RPCMethodMap.set('eth_getEnergy', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/accounts/' + rpc.params[0] + '?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[1]);
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.energy);
    });
});
exports.RPCMethodMap.set('eth_getCode', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/accounts/' + rpc.params[0] + '/code?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[1]);
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.code);
    });
});
exports.RPCMethodMap.set('eth_getStorageAt', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/accounts/' + rpc.params[0] + '/storage/' + utils.leftPadToBytes32(rpc.params[1]) + '?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[2]);
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.value);
    });
});
exports.RPCMethodMap.set('eth_sendRawTransaction', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/transactions';
        const reqBody = {
            raw: rpc.params[0],
        };
        const res = yield simple_http_1.HTTP.post(URL, reqBody, timeout).then(HTTPPostProcessor);
        return rpc.makeResult(!res ? null : res.id);
    });
});
exports.RPCMethodMap.set('eth_getTransactionByHash', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/transactions/' + rpc.params[0];
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        if (!res) {
            return rpc.makeResult(null);
        }
        res.blockNumber = res.meta.blockNumber;
        return rpc.makeResult(res);
    });
});
exports.RPCMethodMap.set('eth_getTransactionReceipt', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/transactions/' + rpc.params[0] + '/receipt';
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        if (!res) {
            return rpc.makeResult(null);
        }
        res.blockNumber = res.meta.blockNumber;
        res.blockHash = res.meta.blockID;
        res.transactionHash = res.meta.txID;
        // For compatible with ethereum's receipt
        if (res.reverted) {
            res.status = '0x0';
        }
        else {
            res.status = '0x1';
        }
        if (res.outputs.length === 1) {
            res.contractAddress = res.outputs[0].contractAddress;
        }
        return rpc.makeResult(res);
    });
});
exports.RPCMethodMap.set('eth_call', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const extraURI = '?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[1]);
        const URL = host + '/accounts/*' + extraURI;
        const reqBody = {
            clauses: [{
                    to: rpc.params[0].to || null,
                    value: rpc.params[0].value || '',
                    data: rpc.params[0].data || '0x',
                }],
            gasPrice: rpc.params[0].gasPrice || undefined,
        };
        if (rpc.params[0].gas) {
            if (typeof rpc.params[0].gas === 'number') {
                reqBody.gas = rpc.params[0].gas;
            }
            else {
                reqBody.gas = parseInt(utils.sanitizeHex(rpc.params[0].gas), 16);
            }
        }
        if (rpc.params[0].from) {
            reqBody.caller = rpc.params[0].from;
        }
        const res = yield simple_http_1.HTTP.post(URL, reqBody, timeout).then(HTTPPostProcessor);
        debug('eth_call returns', res);
        if (!res || res.length === 0) {
            return rpc.makeResult(null);
        }
        else {
            const result = res[0];
            if (result.reverted || result.vmError) {
                if (result.data && result.data.startsWith('0x08c379a0')) {
                    return rpc.makeError('VM reverted: ' + thor_devkit_1.abi.decodeParameter('string', result.data.replace(/^0x08c379a0/i, '')));
                }
                else {
                    return rpc.makeError('VM executing failed' + (result.vmError ? ': ' + result.vmError : ''));
                }
            }
            else {
                return rpc.makeResult(result.data === '0x' ? '' : result.data);
            }
        }
    });
});
exports.RPCMethodMap.set('eth_estimateGas', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const extraURI = '?revision=' + utils.fromETHBlockNumberOrHash(rpc.params[1]);
        const URL = host + '/accounts/*' + extraURI;
        const reqBody = {
            clauses: [{
                    to: rpc.params[0].to || null,
                    value: rpc.params[0].value || '',
                    data: rpc.params[0].data || '0x',
                }],
            gasPrice: rpc.params[0].gasPrice || undefined,
        };
        if (rpc.params[0].gas) {
            if (typeof rpc.params[0].gas === 'number') {
                reqBody.gas = rpc.params[0].gas;
            }
            else {
                reqBody.gas = parseInt(utils.sanitizeHex(rpc.params[0].gas), 16);
            }
        }
        if (rpc.params[0].from) {
            reqBody.caller = rpc.params[0].from;
        }
        const res = yield simple_http_1.HTTP.post(URL, reqBody, timeout).then(HTTPPostProcessor);
        if (!res || res.length === 0) {
            return rpc.makeResult(null);
        }
        else {
            const result = res[0];
            if (result.reverted || result.vmError) {
                if (result.data && result.data.startsWith('0x08c379a0')) {
                    return rpc.makeError('Gas estimation failed with VM reverted: ' + thor_devkit_1.abi.decodeParameter('string', result.data.replace(/^0x08c379a0/i, '')));
                }
                else {
                    return rpc.makeError('Gas estimation failed' + (result.vmError ? ': ' + result.vmError : ''));
                }
            }
            else {
                debug('VM gas:', result.gasUsed);
                // ignore the overflow since block gas limit is uint64 and JavaScript's max number is 2^53
                const intrinsicGas = thor_devkit_1.Transaction.intrinsicGas(reqBody.clauses);
                // increase vm gas by 15000 for safe since it's estimated from current block state, final state for the transaction is not determined for now
                return rpc.makeResult(intrinsicGas + (result.gasUsed ? (result.gasUsed + 15000) : 0));
            }
        }
    });
});
exports.RPCMethodMap.set('eth_getLogs', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = utils.formatLogQuery(rpc.params[0]);
        const URL = host + '/logs/event';
        const res = yield simple_http_1.HTTP.post(URL, reqBody, timeout).then(HTTPPostProcessor);
        if (!res) {
            return rpc.makeResult(null);
        }
        for (const item of res) {
            item.blockNumber = item.meta.blockNumber;
            item.blockHash = item.meta.blockID;
            item.transactionHash = item.meta.txID;
        }
        return rpc.makeResult(res);
    });
});
exports.RPCMethodMap.set('eth_getBlockRef', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/blocks/best';
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        if (!res || !res.id) {
            return rpc.makeResult(null);
        }
        return rpc.makeResult(res.id.substr(0, 18));
    });
});
exports.RPCMethodMap.set('eth_getChainTag', function (rpc, host, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = host + '/blocks/0';
        const res = yield simple_http_1.HTTP.get(URL, timeout).then(HTTPPostProcessor);
        if (!res || !res.id || res.id.length !== 66) {
            return rpc.makeResult(null);
        }
        return rpc.makeResult('0x' + res.id.substr(64, 2));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLW1ldGhvZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXIvcnBjLW1ldGhvZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7OztBQUVaLDZDQUE0QztBQUM1QyxrQ0FBaUM7QUFFakMsK0NBQW9EO0FBQ3BELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0FBSTNDLFFBQUEsWUFBWSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFBO0FBRTFELE1BQU0saUJBQWlCLEdBQUcsVUFBUyxHQUFtQjtJQUNsRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ2hCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUE7S0FDdkY7SUFDRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO1FBQ2xCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLHVEQUF1RCxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLENBQUE7S0FDMUk7SUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3BDLENBQUMsQ0FBQTtBQUVELG9CQUFZLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLFVBQWUsR0FBWSxFQUFFLElBQVksRUFBRSxPQUFlOztRQUMvRixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFdkUsTUFBTSxH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