const https = require('https');
const _ = require('underscore');

function get_request_promise(url, cookies, data, headers = {}, options = {}) {
	return new Promise((resolve, reject) => {
		if (cookies) {
			headers.Cookie = cookies;
		}
		if (!_.isEmpty(headers)) {
			options.headers = headers;
		}
		// console.log('options: ' + JSON.stringify(options));
		// console.log('data: ' + data);
		const req = https.request(url, options, (res) => {
			var chunks_of_data = [];
			res.on('data', (fragments) =>
				chunks_of_data.push(fragments));
			res.on('end', () => {
				var response_body = Buffer.concat(chunks_of_data).toString();
				// resolve(response_body);
				const return_val = {
					text: response_body,
					headers: res.headers,
				};
				return_val.cookies = return_val.headers['set-cookie'];
				resolve(return_val);
			});
		})
			.on('error', (error) => {
				reject(error);
			});
		if (!_.isEmpty(data)) {
			req.write(data);
		}
		req.end();
	});
}

function three_days_later() {
	const date_obj = new Date();
	date_obj.setDate(date_obj.getDate() + 3);
	const date_str = date_obj.toISOString().split('T')[0];
	return date_str;
}

module.exports.get_request_promise = get_request_promise;
module.exports.three_days_later = three_days_later;
