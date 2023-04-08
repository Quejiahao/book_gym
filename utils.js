#!/usr/bin/env node

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
		const req = https.request(url, options, (res) => {
			var chunks_of_data = [];
			res.on('data', (fragments) =>
				chunks_of_data.push(fragments));
			res.on('end', () => {
				const response_body = Buffer.concat(chunks_of_data).toString();
				const return_val = {
					text: response_body,
					headers: res.headers,
					buffer: Buffer.concat(chunks_of_data),
					statusCode: res.statusCode,
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
	const date_str = date_obj.toLocaleDateString("lt");
	return date_str;
}

function senven_thirty_do(callback, delta = -100) {
	const now = new Date();
	var wait_time = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		7, 30, 0, 0
	) + delta - now;
	if (wait_time < 0) {
		wait_time = 0;
	}
	setTimeout(callback, wait_time);
	console.log('还需等待', wait_time, 'ms.');
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.get_request_promise = get_request_promise;
module.exports.three_days_later = three_days_later;
module.exports.sleep = sleep;
module.exports.senven_thirty_do = senven_thirty_do;
