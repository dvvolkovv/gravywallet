export declare type ResponseBody = object | string | null;
export interface SimpleResponse {
    Code: number;
    Body: ResponseBody;
}
export declare enum Method {
    GET = 0,
    POST = 1
}
export declare const HTTP: {
    get: (url: string, timeout?: number) => Promise<SimpleResponse>;
    post: (url: string, body: object, timeout?: number) => Promise<SimpleResponse>;
};
