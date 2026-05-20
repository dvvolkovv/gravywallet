'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../utils");
const thorifyResult = function (result) {
    // tricks for compatible with original web3 instance
    // non-objects or non-arrays doesn't need isThorified property since thorify just overwritten 3 formatters
    // which all accept object as input
    if (utils.isArray(result)) {
        result = result.map((item) => {
            Object.defineProperty(item, 'isThorified', { get: () => true });
            return item;
        });
    }
    else if (utils.isObject(result)) {
        Object.defineProperty(result, 'isThorified', { get: () => true });
    }
    return result;
};
class JSONRPC {
    constructor(payload) {
        this.id = payload.id;
        this.method = payload.method;
        this.params = payload.params;
    }
    makeResult(result) {
        return {
            id: this.id,
            jsonrpc: '2.0',
            result: thorifyResult(result),
        };
    }
    makeError(message) {
        return {
            id: this.id,
            jsonrpc: '2.0',
            error: {
                message,
            },
        };
    }
    makeSubResult(result) {
        return {
            id: this.id,
            jsonrpc: '2.0',
            method: this.method,
            params: {
                result: {
                    data: thorifyResult(result),
                },
                subscription: this.id,
            },
        };
    }
    makeSubError(error) {
        return {
            id: this.id,
            jsonrpc: '2.0',
            method: this.method,
            params: {
                result: {
                    error,
                },
                subscription: this.id,
            },
        };
    }
}
exports.JSONRPC = JSONRPC;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1ycGMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXIvanNvbi1ycGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUNaLGtDQUFpQztBQWdDakMsTUFBTSxhQUFhLEdBQUcsVUFBUyxNQUFXO0lBQ3RDLG9EQUFvRDtJQUNwRCwwR0FBMEc7SUFDMUcsbUNBQW1DO0lBQ25DLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN2QixNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFO1lBQzlCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBQy9ELE9BQU8sSUFBSSxDQUFBO1FBQ2YsQ0FBQyxDQUFDLENBQUE7S0FDTDtTQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUMvQixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUNwRTtJQUNELE9BQU8sTUFBTSxDQUFBO0FBQ2pCLENBQUMsQ0FBQTtBQUVELE1BQWEsT0FBTztJQUtoQixZQUFZLE9BQW1CO1FBQzNCLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQTtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBO0lBQ2hDLENBQUM7SUFFTSxVQUFVLENBQUMsTUFBVztRQUN6QixPQUFPO1lBQ0gsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQztTQUNoQyxDQUFBO0lBQ0wsQ0FBQztJQUVNLFNBQVMsQ0FBQyxPQUFlO1FBQzVCLE9BQU87WUFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRTtnQkFDSCxPQUFPO2FBQ1Y7U0FDSixDQUFBO0lBQ0wsQ0FBQztJQUVNLGFBQWEsQ0FBQyxNQUFXO1FBQzVCLE9BQU87WUFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixNQUFNLEVBQUU7Z0JBQ0osTUFBTSxFQUFFO29CQUNKLElBQUksRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDO2lCQUM5QjtnQkFDRCxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7YUFDeEI7U0FDSixDQUFBO0lBQ0wsQ0FBQztJQUVNLFlBQVksQ0FBQyxLQUFVO1FBQzFCLE9BQU87WUFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxPQUFPLEVBQUUsS0FBSztZQUNkLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixNQUFNLEVBQUU7Z0JBQ0osTUFBTSxFQUFFO29CQUNKLEtBQUs7aUJBQ1I7Z0JBQ0QsWUFBWSxFQUFFLElBQUksQ0FBQyxFQUFFO2FBQ3hCO1NBQ0osQ0FBQTtJQUNMLENBQUM7Q0FFSjtBQXpERCwwQkF5REMifQ==