import { LogQueryBody, LogQueryOptions, LogQueryRange } from '../types';
export declare const fromETHBlockNumber: (blockNumber: string | number) => string | number;
export declare const fromETHBlockNumberOrHash: (blockRevision: any) => string | number;
export declare const formatRange: (range: any) => LogQueryRange | null;
export declare const formatOptions: (options: any) => LogQueryOptions | null;
export declare const formatLogQuery: (params: any) => LogQueryBody;
