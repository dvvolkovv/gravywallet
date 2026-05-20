import { JSONRPC, RPCResult } from './json-rpc';
export declare type RPCExecutor = (rpc: JSONRPC, host: string, timeout: number) => Promise<RPCResult>;
export declare const RPCMethodMap: Map<string, RPCExecutor>;
