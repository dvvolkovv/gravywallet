'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const accounts_1 = require("./accounts");
const contracts_1 = require("./contracts");
const formatters_1 = require("./formatters");
const methods_1 = require("./methods");
const extend = function (web3) {
    accounts_1.extendAccounts(web3);
    formatters_1.extendFormatters(web3);
    methods_1.extendMethods(web3);
    contracts_1.extendContracts(web3);
};
exports.extend = extend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7QUFFWix5Q0FBMkM7QUFDM0MsMkNBQTZDO0FBQzdDLDZDQUErQztBQUMvQyx1Q0FBeUM7QUFFekMsTUFBTSxNQUFNLEdBQUcsVUFBUyxJQUFTO0lBQzdCLHlCQUFjLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDcEIsNkJBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdEIsdUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNuQiwyQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3pCLENBQUMsQ0FBQTtBQUdHLHdCQUFNIn0=