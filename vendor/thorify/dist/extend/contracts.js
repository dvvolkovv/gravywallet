'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require('debug')('thor:injector');
const Subscription = require('web3-core-subscriptions').subscription;
const formatters_1 = require("./formatters");
const extendContracts = function (web3) {
    const _encodeEventABI = web3.eth.Contract.prototype._encodeEventABI;
    web3.eth.Contract.prototype._encodeEventABI = function (event, options) {
        debug('_encodeEventABI');
        const result = _encodeEventABI.call(this, event, options);
        if (options.options) {
            result.options = options.options;
        }
        if (options.range) {
            result.range = options.range;
        }
        if (options.order) {
            result.order = options.order;
        }
        return result;
    };
    web3.eth.Contract.prototype._on = function () {
        debug('_on');
        // keeps the code from web3
        const subOptions = this._generateEventOptions.apply(this, arguments);
        // prevent the event "newListener" and "removeListener" from being overwritten
        this._checkListener('newListener', subOptions.event.name, subOptions.callback);
        this._checkListener('removeListener', subOptions.event.name, subOptions.callback);
        // TODO check if listener already exists? and reuse subscription if options are the same.
        // create new subscription
        /* changes from web3 starts the following
         */
        // subscription options in thor doesn't support array as topic filter object
        const filterOptions = {
            address: subOptions.params.address,
        };
        debug('Contract filter option: %O', filterOptions);
        if (subOptions.params.topics) {
            for (const [index, value] of subOptions.params.topics.entries()) {
                if (value === null) {
                    continue;
                }
                if (typeof value === 'string') {
                    filterOptions['t' + index] = value;
                }
                else {
                    throw new Error('[thorify] Array filter option is not supported in thor, must be null or bytes32 string');
                }
            }
        }
        const decodeEventABI = this._decodeEventABI.bind(subOptions.event);
        const subscription = new Subscription({
            subscription: {
                params: 1,
                inputFormatter: [formatters_1.inputLogFilterFormatter],
                subscriptionHandler(subscriptionMsg) {
                    if (subscriptionMsg.error) {
                        this.emit('error', subscriptionMsg.error);
                        // web3-core-subscriptions/subscription sets a default value for this.callback
                        this.callback(subscriptionMsg.error, null, this);
                    }
                    else {
                        const result = decodeEventABI(subscriptionMsg.data);
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
            type: 'eth',
            requestManager: this._requestManager,
        });
        subscription.subscribe('logs', filterOptions, subOptions.callback || function () { });
        return subscription;
    };
};
exports.extendContracts = extendContracts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuZC9jb250cmFjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUNaLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUMvQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQyxZQUFZLENBQUE7QUFFcEUsNkNBQXNEO0FBRXRELE1BQU0sZUFBZSxHQUFHLFVBQVMsSUFBUztJQUN0QyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFBO0lBQ25FLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsVUFBUyxLQUFVLEVBQUUsT0FBWTtRQUMzRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUN4QixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDekQsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtTQUNuQztRQUNELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtTQUMvQjtRQUNELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNmLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQTtTQUMvQjtRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2pCLENBQUMsQ0FBQTtJQUVELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUc7UUFDOUIsS0FBSyxD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