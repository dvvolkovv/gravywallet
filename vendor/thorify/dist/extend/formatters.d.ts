import { LogFilterOptions, TransferFilterOptions } from '../types';
declare const extendFormatters: (web3: any) => void;
declare const inputLogFilterFormatter: (options: LogFilterOptions) => LogFilterOptions | undefined;
declare const inputBlockFilterFormatter: (blockID: string | null) => string | undefined;
declare const inputTransferFilterFormatter: (options: TransferFilterOptions) => TransferFilterOptions | undefined;
export { extendFormatters, inputLogFilterFormatter, inputBlockFilterFormatter, inputTransferFilterFormatter, };
