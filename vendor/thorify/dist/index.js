'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const extend_1 = require("./extend");
const provider_1 = require("./provider");
const thorify = function (web3Instance, host = 'http://localhost:8669', timeout = 0) {
    const provider = new provider_1.ThorProvider(host, timeout);
    web3Instance.setProvider(provider);
    extend_1.extend(web3Instance);
    return web3Instance;
};
exports.thorify = thorify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUVaLHFDQUFpQztBQUNqQyx5Q0FBeUM7QUFFekMsTUFBTSxPQUFPLEdBQUcsVUFBUyxZQUFpQixFQUFFLElBQUksR0FBRyx1QkFBdUIsRUFBRSxPQUFPLEdBQUcsQ0FBQztJQUNuRixNQUFNLFFBQVEsR0FBRyxJQUFJLHVCQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ2hELFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFbEMsZUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBRXBCLE9BQU8sWUFBWSxDQUFBO0FBQ3ZCLENBQUMsQ0FBQTtBQUVRLDBCQUFPIn0=