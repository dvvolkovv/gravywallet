'use strict';
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./params"));
__export(require("./option-formatters"));
exports.toPrefixedHex = function (hexStr) {
    if (hexStr.indexOf('0x') === 0) {
        return hexStr;
    }
    else {
        return '0x' + hexStr;
    }
};
exports.sanitizeHex = function (hexStr) {
    if (hexStr.indexOf('0x') === 0) {
        return hexStr.substr(2);
    }
    else {
        return hexStr;
    }
};
exports.isHex = function (hex) {
    return !!hex && ((typeof hex === 'string') && /^(-0x|0x)?[0-9a-f]+$/i.test(hex));
};
exports.newNonce = function () {
    return Math.floor((new Date().getTime() / 0xffff) * Math.random() * 0xffff);
};
exports.toInteger = function (input) {
    const num = Number.parseInt(input);
    if (Number.isInteger(num)) {
        return num;
    }
    else {
        return null;
    }
};
exports.isArray = function (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
};
exports.isObject = function (o) {
    return Object.prototype.toString.call(o) === '[object Object]';
};
exports.isNull = function (o) {
    return Object.prototype.toString.call(o) === '[object Null]';
};
exports.isUndefined = function (o) {
    return Object.prototype.toString.call(o) === '[object Undefined]';
};
exports.isFunction = function (o) {
    return typeof o === 'function';
};
exports.validNumberOrDefault = function (value, defaultValue) {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return Math.abs(value);
    }
    if (Number.isNaN(Number.parseInt(value)) === false) {
        return Math.abs(Number.parseInt(value));
    }
    return defaultValue;
};
exports.validAddressOrError = function (input, msg = 'Invalid address string') {
    if (/^(-0x|0x)?[0-9a-fA-F]{40}$/i.test(input)) {
        return exports.toPrefixedHex(input);
    }
    else {
        throw new Error(msg);
    }
};
exports.validBytes32OrError = function (input, msg = 'Invalid hex string') {
    if (/^(-0x|0x)?[0-9a-fA-F]{64}$/i.test(input)) {
        return exports.toPrefixedHex(input);
    }
    else {
        throw new Error(msg);
    }
};
exports.leftPadToBytes32 = function (input) {
    return ('0x' + '0'.repeat(64 - exports.sanitizeHex(input).length) + exports.sanitizeHex(input));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7OztBQUVaLDhCQUF3QjtBQUN4Qix5Q0FBbUM7QUFFdEIsUUFBQSxhQUFhLEdBQUcsVUFBUyxNQUFjO0lBQ2hELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDNUIsT0FBTyxNQUFNLENBQUE7S0FDaEI7U0FBTTtRQUNILE9BQU8sSUFBSSxHQUFHLE1BQU0sQ0FBQTtLQUN2QjtBQUNMLENBQUMsQ0FBQTtBQUVZLFFBQUEsV0FBVyxHQUFHLFVBQVMsTUFBYztJQUM5QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzVCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUMxQjtTQUFNO1FBQ0gsT0FBTyxNQUFNLENBQUE7S0FDaEI7QUFDTCxDQUFDLENBQUE7QUFFWSxRQUFBLEtBQUssR0FBRyxVQUFTLEdBQVc7SUFDckMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNwRixDQUFDLENBQUE7QUFFWSxRQUFBLFFBQVEsR0FBRztJQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQTtBQUMvRSxDQUFDLENBQUE7QUFFWSxRQUFBLFNBQVMsR0FBRyxVQUFTLEtBQVU7SUFDeEMsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxL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