'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Subscriptions = require('web3-core-subscriptions').subscriptions;
const formatters_1 = require("./formatters");
const extendMethods = function (web3) {
    web3.extend({
        property: 'eth',
        methods: [
            new web3.extend.Method({
                name: 'getEnergy',
                call: 'eth_getEnergy',
                params: 2,
                inputFormatter: [web3.extend.utils.toAddress, web3.extend.formatters.inputDefaultBlockNumberFormatter],
                outputFormatter: web3.extend.formatters.outputBigNumberFormatter,
            }),
            new web3.extend.Method({
                name: 'getTransaction',
                call: 'eth_getTransactionByHash',
                params: 1,
                inputFormatter: [null],
                outputFormatter: web3.extend.formatters.outputTransactionFormatter,
            }),
            new web3.extend.Method({
                name: 'getTransactionReceipt',
                call: 'eth_getTransactionReceipt',
                params: 1,
                inputFormatter: [null],
                outputFormatter: web3.extend.formatters.outputTransactionReceiptFormatter,
            }),
            new web3.extend.Method({
                name: 'sendTransaction',
                call: 'eth_sendTransaction',
                accounts: web3.eth.accounts,
                params: 1,
                inputFormatter: [web3.extend.formatters.inputTransactionFormatter],
            }),
            new web3.extend.Method({
                name: 'getBlockRef',
                call: 'eth_getBlockRef',
                params: 0,
            }),
            new web3.extend.Method({
                name: 'getChainTag',
                call: 'eth_getChainTag',
                params: 0,
            }),
            new web3.extend.Method({
                name: 'getPastLogs',
                call: 'eth_getLogs',
                params: 1,
                inputFormatter: [web3.extend.formatters.inputLogFormatter],
                outputFormatter: web3.extend.formatters.outputLogFormatter,
            }),
        ],
    });
    // subscriptions
    const subs = new Subscriptions({
        name: 'subscribe',
        type: 'eth',
        subscriptions: {
            newBlockHeaders: {
                subscriptionName: 'newHeads',
                params: 1,
                inputFormatter: [formatters_1.inputBlockFilterFormatter],
                subscriptionHandler(subscriptionMsg) {
                    if (subscriptionMsg.error) {
                        this.emit('error', subscriptionMsg.error);
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(subscriptionMsg.error, null, this);
                    }
                    else {
                        const result = web3.extend.formatters.outputBlockFormatter(subscriptionMsg.data);
                        if (result.removed) {
                            this.emit('changed', result);
                        }
                        else {
                            this.emit('data', result);
                        }
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(null, result, this);
                    }
                },
            },
            logs: {
                params: 1,
                inputFormatter: [formatters_1.inputLogFilterFormatter],
                subscriptionHandler(subscriptionMsg) {
                    if (subscriptionMsg.error) {
                        this.emit('error', subscriptionMsg.error);
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(subscriptionMsg.error, null, this);
                    }
                    else {
                        const result = web3.extend.formatters.outputLogFormatter(subscriptionMsg.data);
                        if (result.removed) {
                            this.emit('changed', result);
                        }
                        else {
                            this.emit('data', result);
                        }
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(null, result, this);
                    }
                },
            },
            transfers: {
                params: 1,
                inputFormatter: [formatters_1.inputTransferFilterFormatter],
                subscriptionHandler(subscriptionMsg) {
                    if (subscriptionMsg.error) {
                        this.emit('error', subscriptionMsg.error);
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(subscriptionMsg.error, null, this);
                    }
                    else {
                        const result = subscriptionMsg.data;
                        if (result.removed) {
                            this.emit('changed', result);
                        }
                        else {
                            this.emit('data', result);
                        }
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(null, result, this);
                    }
                },
            },
        },
    });
    subs.attachToObject(web3.eth);
    subs.setRequestManager(web3.eth._requestManager);
    web3.eth.clearSubscriptions = web3.eth._requestManager.clearSubscriptions.bind(web3.eth._requestManager);
};
exports.extendMethods = extendMethods;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHRlbmQvbWV0aG9kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7O0FBQ1osTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsYUFBYSxDQUFBO0FBQ3RFLDZDQUErRztBQUUvRyxNQUFNLGFBQWEsR0FBRyxVQUFTLElBQVM7SUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNSLFFBQVEsRUFBRSxLQUFLO1FBQ2YsT0FBTyxFQUFFO1lBQ0wsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxlQUFlO2dCQUNyQixNQUFNLEVBQUUsQ0FBQztnQkFDVCxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsZ0NBQWdDLENBQUM7Z0JBQ3RHLGVBQWUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0I7YUFDbkUsQ0FBQztZQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLElBQUksRUFBRSxnQkFBZ0I7Z0JBQ3RCLElBQUksRUFBRSwwQkFBMEI7Z0JBQ2hDLE1BQU0sRUFBRSxDQUFDO2dCQUNULGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQztnQkFDdEIsZUFBZSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLDBCQUEwQjthQUNyRSxDQUFDO1lBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsSUFBSSxFQUFFLDJCQUEyQjtnQkFDakMsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsY0FBYyxFQUFFLENB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