export interface RPCPayload {
    id: number;
    jsonrpc: '2.0';
    method: string;
    params: any;
}
export interface RPCResult {
    id: number;
    jsonrpc: '2.0';
    result?: any;
    error?: {
        message: string;
    };
}
export interface RPCSubResult {
    id: number;
    jsonrpc: '2.0';
    method: string;
    params: {
        result: {
            data?: any;
            error?: any;
        };
        subscription: number;
    };
}
export declare class JSONRPC {
    id: number;
    method: string;
    params: any;
    constructor(payload: RPCPayload);
    makeResult(result: any): RPCResult;
    makeError(message: string): RPCResult;
    makeSubResult(result: any): RPCSubResult;
    makeSubError(error: any): RPCSubResult;
}
