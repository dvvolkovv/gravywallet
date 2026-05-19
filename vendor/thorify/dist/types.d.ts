/// <reference types="node" />
export declare type StringOrNull = string | null;
export declare type StringOrNumber = string | number;
export declare type Callback = (err: Error | null, result?: any) => void;
export interface ThorTransaction {
    chainTag?: number;
    blockRef?: Buffer;
    expiration?: StringOrNumber;
    gasPriceCoef?: StringOrNumber;
    gas?: string;
    dependsOn?: Buffer | null;
    nonce?: string;
    signature?: string;
    clauses: Clause[];
    origin?: string;
    isThorified?: () => boolean;
}
export interface Clause {
    to?: StringOrNull;
    value: string;
    data?: Buffer;
}
export interface EthTransaction {
    chainId?: StringOrNumber;
    to?: StringOrNull;
    value?: string;
    data?: string;
    gas?: StringOrNumber;
    gasPrice?: StringOrNumber;
    nonce?: StringOrNumber;
    chainTag?: StringOrNumber;
    blockRef?: StringOrNumber;
    expiration?: StringOrNumber;
    gasPriceCoef?: StringOrNumber;
    dependsOn?: string;
}
export declare type topicName = 'topic0' | 'topic1' | 'topic2' | 'topic3' | 'topic4';
export interface TopicItem {
    name: string;
    array: [string];
}
export interface EventCriteriaSet {
    address?: string;
    topic0?: string;
    topic1?: string;
    topic2?: string;
    topic3?: string;
    topic4?: string;
}
export declare type Order = 'ASC' | 'DESC';
export interface LogQueryBody {
    range?: LogQueryRange;
    options?: LogQueryOptions;
    criteriaSet: EventCriteriaSet[];
    order: Order;
}
export interface LogQueryRange {
    unit?: string;
    from?: number;
    to?: number;
}
export interface LogQueryOptions {
    offset?: number;
    limit?: number;
}
export interface LogFilterOptions {
    address?: string;
    pos?: string;
    t0?: string;
    t1?: string;
    t2?: string;
    t3?: string;
    t4?: string;
}
export interface TransferFilterOptions {
    pos?: string;
    txOrigin?: string;
    sender?: string;
    recipient?: string;
}
