'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const XHR2 = require('xhr2');
var Method;
(function (Method) {
    Method[Method["GET"] = 0] = "GET";
    Method[Method["POST"] = 1] = "POST";
})(Method = exports.Method || (exports.Method = {}));
const post = function (url, body, timeout = 0) {
    return request(Method.POST, url, body, timeout);
};
const get = function (url, timeout = 0) {
    return request(Method.GET, url, null, timeout);
};
exports.HTTP = { get, post };
const request = function (method, url, body, timeout) {
    return new Promise((resolve, reject) => {
        const xhr = new XHR2();
        xhr.timeout = timeout;
        xhr.open(Method[method], url);
		if (method === Method.POST) {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                const res = {
                    Code: xhr.status,
                    Body: null,
                };
                if (xhr.status === 200) {
                    try {
                        res.Body = JSON.parse(xhr.responseText);
                    }
                    catch (e) {
                        return reject(new Error(`[thor-provider]Error parsing the response: ${e.message}`));
                    }
                }
                else if (xhr.responseText && xhr.responseText.length) {
                    res.Body = xhr.responseText;
                }
                return resolve(res);
            }
        };
        xhr.ontimeout = () => {
            return reject(new Error(`[thor-provider]Time out for whatever reason, check your provider`));
        };
        try {
            xhr.send(method === Method.POST ? JSON.stringify(body) : null);
        }
        catch (e) {
            return reject(new Error(`[thor-provider]Connect error: ${e.message}`));
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWh0dHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJvdmlkZXIvc2ltcGxlLWh0dHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUNaLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQVE1QixJQUFZLE1BR1g7QUFIRCxXQUFZLE1BQU07SUFDZCxpQ0FBTSxDQUFBO0lBQ04sbUNBQUksQ0FBQTtBQUNSLENBQUMsRUFIVyxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFHakI7QUFFRCxNQUFNLElBQUksR0FBRyxVQUFTLEdBQVcsRUFBRSxJQUFZLEVBQUUsT0FBTyxHQUFFLENBQUM7SUFDdkQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ25ELENBQUMsQ0FBQTtBQUVELE1BQU0sR0FBRyxHQUFHLFVBQVMsR0FBVyxFQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3pDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNsRCxDQUFDLENBQUE7QUFFWSxRQUFBLElBQUksR0FBRyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQTtBQUUvQixNQUFNLE9BQU8sR0FBRyxVQUFTLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBbUIsRUFBRSxPQUFlO0lBRXRGLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUN0QixHQUFHLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUU3QixHQUFHLENBQUMsa0JBQWtCLEdBQUcsR0FBRyxFQUFFO1lBQzFCLElBQUksR0FBRyxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCLE1BQU0sR0FBRyxHQUFtQjtvQkFDeEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFnQjtvQkFDMUIsSUFBSSxFQUFFLElBQUk7aUJBQ2IsQ0FBQTtnQkFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUNwQixJQUFJO3dCQUNBLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7cUJBQzFDO29CQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUNSLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFBO3FCQUN0RjtpQkFDSjtxQkFBTSxJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7b0JBQ3BELEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQTtpQkFDOUI7Z0JBRUQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdEI7UUFDTCxDQUFDLENBQUE7UUFFRCxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRTtZQUNqQixPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDLENBQUE7UUFDaEcsQ0FBQyxDQUFBO1FBRUQsSUFBSTtZQUNBLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ2pFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUN6RTtJQUNMLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBIn0=