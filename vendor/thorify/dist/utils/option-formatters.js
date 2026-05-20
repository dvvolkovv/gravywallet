'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./");
exports.fromETHBlockNumber = function (blockNumber) {
    if (typeof blockNumber === 'number') {
        return blockNumber;
    }
    else if (typeof blockNumber === 'string') {
        if (blockNumber === 'earliest') {
            return 0;
        }
        else if (blockNumber === 'latest' || blockNumber === 'pending') {
            return 'best';
        }
        else {
            const num = utils.toInteger(blockNumber);
            return num || num === 0 ? num : 'best';
        }
    }
    else {
        return 'best';
    }
};
exports.fromETHBlockNumberOrHash = function (blockRevision) {
    if (/^(-0x|0x)?[0-9a-fA-F]{64}$/i.test(blockRevision)) {
        return blockRevision;
    }
    else {
        return exports.fromETHBlockNumber(blockRevision);
    }
};
exports.formatRange = function (range) {
    const ret = {};
    if (range.unit !== 'block' && range.unit !== 'time') {
        return null;
    }
    else {
        ret.unit = range.unit;
    }
    if (range.hasOwnProperty('from')) {
        const temp = exports.fromETHBlockNumber(range.from);
        if (temp !== 'best') {
            ret.from = temp;
        }
        else {
            ret.from = 0;
        }
    }
    else {
        ret.from = 0;
    }
    if (range.hasOwnProperty('to')) {
        const temp = utils.fromETHBlockNumber(range.to);
        if (temp !== 'best') {
            ret.to = temp;
        }
        else {
            ret.to = Number.MAX_SAFE_INTEGER;
        }
    }
    else {
        ret.to = Number.MAX_SAFE_INTEGER;
    }
    return ret;
};
exports.formatOptions = function (options) {
    const ret = {};
    if (options.hasOwnProperty('limit')) {
        const temp = utils.toInteger(options.limit);
        if (temp) {
            ret.limit = temp;
        }
    }
    if (options.hasOwnProperty('offset')) {
        const temp = utils.toInteger(options.offset);
        if (temp) {
            ret.offset = temp;
        }
    }
    if (ret.hasOwnProperty('limit') || ret.hasOwnProperty('offset')) {
        return ret;
    }
    else {
        return null;
    }
};
exports.formatLogQuery = function (params) {
    let address = '';
    let order = 'ASC';
    if (params.address) {
        address = params.address;
    }
    if (params.order && (params.order.toUpperCase() === 'ASC' || params.order.toUpperCase() === 'DESC')) {
        order = params.order.toUpperCase();
    }
    const body = {
        criteriaSet: [],
        order,
    };
    if (params.range) {
        const ret = exports.formatRange(params.range);
        if (ret) {
            body.range = ret;
        }
    }
    if (params.options) {
        const ret = exports.formatOptions(params.options);
        if (ret) {
            body.options = ret;
        }
    }
    if (!body.range && (params.hasOwnProperty('fromBlock') || params.hasOwnProperty('toBlock'))) {
        body.range = {
            unit: 'block',
        };
        if (params.hasOwnProperty('fromBlock')) {
            body.range.from = params.fromBlock;
        }
        if (params.hasOwnProperty('toBlock')) {
            body.range.to = params.toBlock;
        }
        body.range = exports.formatRange(body.range);
    }
    const topics = [];
    if (params.topics && params.topics.length) {
        for (let i = 0; i < params.topics.length; i++) {
            if (typeof params.topics[i] === 'string') {
                topics.push({
                    name: 'topic' + i,
                    array: [params.topics[i]],
                });
            }
            else if (utils.isArray(params.topics[i]) && params.topics[i].length) {
                topics.push({
                    name: 'topic' + i,
                    array: params.topics[i],
                });
            }
        }
    }
    const outputTopic = function (inputTopics, index, receiver, current) {
        if (index === inputTopics.length) {
            const o = {};
            if (address) {
                current.address = address;
            }
            Object.assign(o, current);
            receiver.push(o);
            return;
        }
        for (const item of inputTopics[index].array) {
            current[inputTopics[index].name] = item;
            outputTopic(inputTopics, index + 1, receiver, current);
        }
    };
    if (topics.length) {
        outputTopic(topics, 0, body.criteriaSet, {});
    }
    if (!body.criteriaSet.length && address) {
        body.criteriaSet.push({
            address,
        });
    }
    return body;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9uLWZvcm1hdHRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvb3B0aW9uLWZvcm1hdHRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUdaLDRCQUEyQjtBQUVkLFFBQUEsa0JBQWtCLEdBQUcsVUFBUyxXQUEyQjtJQUNsRSxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRTtRQUNqQyxPQUFPLFdBQVcsQ0FBQTtLQUNyQjtTQUFNLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO1FBQ3hDLElBQUksV0FBVyxLQUFLLFVBQVUsRUFBRTtZQUM1QixPQUFPLENBQUMsQ0FBQTtTQUNYO2FBQU0sSUFBSSxXQUFXLEtBQUssUUFBUSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDOUQsT0FBTyxNQUFNLENBQUE7U0FDaEI7YUFBTTtZQUNILE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDeEMsT0FBTyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUE7U0FDekM7S0FDSjtTQUFNO1FBQ0gsT0FBTyxNQUFNLENBQUE7S0FDaEI7QUFDTCxDQUFDLENBQUE7QUFFWSxRQUFBLHdCQUF3QixHQUFHLFVBQVMsYUFBa0I7SUFDL0QsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDbkQsT0FBTyxhQUFhLENBQUE7S0FDdkI7U0FBTTtRQUNILE9BQU8sMEJBQWtCLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDM0M7QUFDTCxDQUFDLENBQUE7QUFFWSxRQUFBLFdBQVcsR0FBRyxVQUFTLEtBQVU7SUFDMUMsTUFBTSxHQUFHLEdBQWtCLEVBQUUsQ0FBQTtJQUM3QixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxJQUFJLEtB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