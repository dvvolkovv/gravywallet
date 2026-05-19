'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const debug = require('debug')('thor:http-provider');
const eventemitter3_1 = require("eventemitter3");
const WebSocket = require("isomorphic-ws");
const QS = require("querystring");
const json_rpc_1 = require("./json-rpc");
const rpc_methods_1 = require("./rpc-methods");
class ThorProvider extends eventemitter3_1.EventEmitter {
    constructor(host, timeout = 0) {
        super();
        if (!host) {
            throw new Error('[thor-provider]Thorify requires that the host be specified(e.g. "http://localhost:8669")');
        }
        const hostURL = url_1.parse(host);
        if (!hostURL.protocol || !hostURL.host) {
            throw new Error('[thor-provider]Parsing url failed!');
        }
        this.RESTHost = `${hostURL.protocol}//${hostURL.host}`;
        this.WSHost = `${hostURL.protocol.replace('http', 'ws')}//${hostURL.host}`;
        this.timeout = timeout;
        this.sockets = [];
    }
    sendAsync(payload, callback) {
        debug('payload: %O', payload);
        const rpc = new json_rpc_1.JSONRPC(payload);
        // kindly remind developers about the usage about send transaction
        if (rpc.method === 'eth_sendTransaction') {
            return callback(null, rpc.makeError('[thor-provider]The private key corresponding to from filed can\'t be found in local eth.accounts.wallet!'));
        }
        // subscriptions
        if (rpc.method === 'eth_subscribe' || rpc.method === 'eth_unsubscribe') {
            return this.ManagerSubscription(rpc, callback);
        }
        if (rpc_methods_1.RPCMethodMap.has(rpc.method)) {
            const executor = rpc_methods_1.RPCMethodMap.get(rpc.method);
            executor(rpc, this.RESTHost, this.timeout).then((ret) => {
                debug('response: %O', ret.result);
                omitCallBackedPromise(callback(null, ret));
                return;
            }).catch((err) => {
                omitCallBackedPromise(callback(err, null));
                return;
            });
        }
        else {
            callback(null, rpc.makeError('[thor-provider]Method not supported!'));
            return;
        }
    }
    ManagerSubscription(rpc, callback) {
        let query = '';
        if (rpc.method === 'eth_subscribe') {
            let URI = '/subscriptions/';
            switch (rpc.params[0]) {
                case 'newHeads':
                    URI += 'block';
                    if (rpc.params[1] && rpc.params[1] !== 'best') {
                        URI += '?pos=' + rpc.params[1];
                    }
                    break;
                case 'logs':
                    URI += 'event';
                    query = QS.stringify(rpc.params[1]);
                    if (query) {
                        URI += '?' + query;
                    }
                    break;
                case 'transfers':
                    URI += 'transfer';
                    query = QS.stringify(rpc.params[1]);
                    if (query) {
                        URI += '?' + query;
                    }
                    break;
                default:
                    callback(null, rpc.makeError(`Subscription ${rpc.params[0]} not supported!`));
                    return;
            }
            /*  web3-core-requestmanager doesn't respond to error event, so in thorify both "data" level and "error" level are emitted
                by "data" event and will add subscriptionHandler to handle the message, regarding the process in request manager, the
                format of data emitted is not the standard JSON-RPC format, so built to func makeSubResult and makeSubError to work with that
            */
            const ws = new WebSocket(this.WSHost + URI);
            ws.onerror = (event) => {
                debug('error from ws: %O', event);
                this.emit('data', rpc.makeSubError(event.error ? event.error : 'Error from upstream'));
            };
            ws.onmessage = (event) => {
                debug('[ws]message from ws: %O', event.data);
                try {
                    // wrong type define of message, typeof message turns to be string
                    const obj = JSON.parse(event.data);
                    obj.removed = obj.obsolete;
                    delete obj.obsolete;
                    this.emit('data', rpc.makeSubResult(obj));
                }
                catch (e) {
                    debug('Parse message failed %O', e);
                }
            };
            ws.onopen = () => {
                debug('[ws]opened');
                ws.onclose = (event) => {
                    debug('[ws]close', event.code, event.reason);
                    let errMsg = 'Connection closed.';
                    if (event.code) {
                        errMsg += ' Error code: ' + event.code;
                    }
                    if (event.reason) {
                        errMsg += ' Error reason: ' + event.reason;
                    }
                    this.emit('data', rpc.makeSubError(new Error(errMsg)));
                };
            };
            this.sockets[rpc.id] = { rpc, ws };
            callback(null, rpc.makeResult(rpc.id));
            return;
        }
        else {
            if (this.sockets[rpc.params[0]]) {
                const ws = this.sockets[rpc.params[0]].ws;
                if (ws && ws.readyState === ws.OPEN) {
                    ws.close();
                    // clean up
                    if (ws.removeAllListeners) {
                        ws.removeAllListeners();
                    }
                    else {
                        ws.onopen = null;
                        ws.onerror = null;
                        ws.onmessage = null;
                        ws.onclose = null;
                    }
                    delete this.sockets[rpc.params[0]];
                    callback(null, rpc.makeResult(true));
                }
                else {
                    delete this.sockets[rpc.params[0]];
                    callback(null, rpc.makeResult(true));
                }
            }
            else {
                callback(null, rpc.makeResult(true));
            }
        }
    }
}
exports.ThorProvider = ThorProvider;
const omitCallBackedPromise = function (callBackedRet) {
    /*  when developer calling a method using promise,when error return from provider,the function in web3-core-method
        will return a Promise in,it's ok when writing provider in callback mode but it will cause problems when
        writing provider in Promise, this function is used to omit the rejected promise
    */
    if (callBackedRet && callBackedRet.catch) {
        callBackedRet.catch(() => null);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUNaLDZCQUEyQjtBQUUzQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUNwRCxpREFBNEM7QUFDNUMsMkNBQTJDO0FBQzNDLGtDQUFpQztBQUNqQyx5Q0FBb0M7QUFDcEMsK0NBQXlEO0FBU3pELE1BQU0sWUFBYSxTQUFRLDRCQUFZO0lBTW5DLFlBQVksSUFBWSxFQUFFLE9BQU8sR0FBRyxDQUFDO1FBQ2pDLEtBQUssRUFBRSxDQUFBO1FBQ1AsSUFBSSxDQUFDLElBQUksRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEZBQTBGLENBQUMsQ0FBQTtTQUFFO1FBRTFILE1BQU0sT0FBTyxHQUFHLFdBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO1NBQ3hEO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3RELElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQzFFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ3JCLENBQUM7SUFFTSxTQUFTLENBQUMsT0FBWSxFQUFFLFFBQWtCO1FBQzdDLEtBQUssQ0FBQyxhQUFh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