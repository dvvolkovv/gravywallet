'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require('debug')('thor:injector');
const utils = require("../utils");
const extendFormatters = function (web3) {
    const web3Utils = web3.utils;
    const outputTransactionFormatter = web3.extend.formatters.outputTransactionFormatter;
    web3.extend.formatters.outputTransactionFormatter = function (tx) {
        if (tx && tx.isThorified) {
            debug('outputTransactionFormatter');
            tx.chainTag = web3Utils.numberToHex(tx.chainTag);
            if (tx.clauses) {
                for (const clause of tx.clauses) {
                    clause.value = web3.extend.formatters.outputBigNumberFormatter(clause.value);
                }
            }
            return tx;
        }
        else {
            return outputTransactionFormatter(tx);
        }
    };
    const outputTransactionReceiptFormatter = web3.extend.formatters.outputTransactionReceiptFormatter;
    web3.extend.formatters.outputTransactionReceiptFormatter = function (receipt) {
        if (receipt && receipt.isThorified) {
            debug('outputTransactionReceiptFormatter');
            if (receipt.hasOwnProperty('transactionIndex')) {
                delete receipt.transactionIndex;
            }
            if (receipt.hasOwnProperty('cumulativeGasUsed')) {
                delete receipt.cumulativeGasUsed;
            }
            receipt.gasUsed = web3Utils.hexToNumber(receipt.gasUsed);
            for (const output of receipt.outputs) {
                if (web3Utils._.isArray(output.events)) {
                    output.events = output.events.map((event) => {
                        if (!event.isThorified) {
                            Object.defineProperty(event, 'isThorified', { get: () => true });
                        }
                        return web3.extend.formatters.outputLogFormatter(event);
                    });
                }
            }
            return receipt;
        }
        else {
            return outputTransactionReceiptFormatter(receipt);
        }
    };
    const outputLogFormatter = web3.extend.formatters.outputLogFormatter;
    web3.extend.formatters.outputLogFormatter = function (log) {
        if (log && log.isThorified) {
            debug('outputLogFormatter');
            if (log.hasOwnProperty('transactionIndex')) {
                delete log.transactionIndex;
            }
            if (log.hasOwnProperty('logIndex')) {
                delete log.logIndex;
            }
            if (log.hasOwnProperty('id')) {
                delete log.id;
            }
            return log;
        }
        else {
            return outputLogFormatter(log);
        }
    };
};
exports.extendFormatters = extendFormatters;
const inputLogFilterFormatter = function (options) {
    if (options) {
        const logFilterOptions = {};
        if (options.address) {
            logFilterOptions.address = utils.validAddressOrError(options.address);
        }
        if (options.pos) {
            logFilterOptions.pos = utils.validBytes32OrError(options.pos, 'Invalid position(block ID)');
        }
        if (options.t0) {
            logFilterOptions.t0 = utils.validBytes32OrError(options.t0, 'Invalid t0');
        }
        if (options.t1) {
            logFilterOptions.t1 = utils.validBytes32OrError(options.t1, 'Invalid t1');
        }
        if (options.t2) {
            logFilterOptions.t2 = utils.validBytes32OrError(options.t2, 'Invalid t2');
        }
        if (options.t3) {
            logFilterOptions.t3 = utils.validBytes32OrError(options.t3, 'Invalid t3');
        }
        if (options.t4) {
            logFilterOptions.t4 = utils.validBytes32OrError(options.t4, 'Invalid t4');
        }
        return logFilterOptions;
    }
};
exports.inputLogFilterFormatter = inputLogFilterFormatter;
const inputBlockFilterFormatter = function (blockID) {
    if (blockID) {
        blockID = utils.validBytes32OrError(blockID, 'Invalid position(block ID)');
        return blockID;
    }
};
exports.inputBlockFilterFormatter = inputBlockFilterFormatter;
const inputTransferFilterFormatter = function (options) {
    if (options) {
        const transferFilterOptions = {};
        if (options.pos) {
            transferFilterOptions.pos = utils.validBytes32OrError(options.pos, 'Invalid position(block ID)');
        }
        if (options.txOrigin) {
            transferFilterOptions.txOrigin = utils.validAddressOrError(options.txOrigin);
        }
        if (options.sender) {
            transferFilterOptions.sender = utils.validAddressOrError(options.sender);
        }
        if (options.recipient) {
            transferFilterOptions.recipient = utils.validAddressOrError(options.recipient);
        }
        return transferFilterOptions;
    }
};
exports.inputTransferFilterFormatter = inputTransferFilterFormatter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbmQvZm9ybWF0dGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7O0FBQ1osTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBRS9DLGtDQUFpQztBQUVqQyxNQUFNLGdCQUFnQixHQUFHLFVBQVMsSUFBUztJQUV2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQzVCLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMEJBQTBCLENBQUE7SUFDcEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMEJBQTBCLEdBQUcsVUFBUyxFQUFPO1FBQ2hFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7WUFDdEIsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUE7WUFDbkMsRUFBRSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUVoRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ1osS0FBSyxNQUFNLE1BQU0sSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO29CQUM3QixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtpQkFDL0U7YUFDSjtZQUNELE9BQU8sRUFBRSxDQUFBO1NBQ1o7YUFBTTtZQUNILE9BQU8sMEJBQTBCLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDeEM7SUFDTCxDQUFDLENBQUE7SUFFRCxNQUFNLGlDQUFpQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGlDQUFpQyxDQUFBO0lBQ2xHLElBQUksQ0FB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