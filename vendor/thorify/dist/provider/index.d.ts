import { Callback } from '../types';
import { EventEmitter } from 'eventemitter3';
import { JSONRPC } from './json-rpc';
declare class ThorProvider extends EventEmitter {
    private RESTHost;
    private WSHost;
    private timeout;
    private sockets;
    constructor(host: string, timeout?: number);
    sendAsync(payload: any, callback: Callback): void;
    ManagerSubscription(rpc: JSONRPC, callback: Callback): void;
}
export { ThorProvider, };
