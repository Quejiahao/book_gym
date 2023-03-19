#!/usr/bin/env node
const { strEnc } = require('./des');
const { book_url_root, cas_login_url } = require('./url_const');
const { get_request_promise } = require('./utils');
const { URLSearchParams } = require('url');

function get_cookies_jsessionid(cookies) {
	return cookies
		.join('')
		.split(/=|;/)
		.map((cookies_string, cookies_index, cookies_array) => {
			if (cookies_string.includes('JSESSIONID')) {
				return cookies_array[cookies_index + 1];
			}
		})
		.join('');
}

function get_jsessionid_cookies_promise(
	username,
	password,
	callback
) {
	const cas_login_params = '?' + (new URLSearchParams({
		service: book_url_root + 'login.jsp',
	})).toString();
	const cas_login_lt_url = cas_login_url + cas_login_params;
	get_request_promise(cas_login_lt_url).then((resp) => {
		const lt_regex = /(?<=name="lt" value=").*(?=")/;
		const execution_regex = /(?<=name="execution" value=").*(?=")/;
		const lt = resp.text.match(lt_regex)[0];
		const execution = resp.text.match(execution_regex)[0];

		const cas_login_data = {
			rsa: strEnc(username + password + lt, '1', '2', '3'),
			ul: username.length,
			pl: password.length,
			lt: lt,
			execution: execution,
			_eventId: 'submit'
		};
		const JSESSIONID = get_cookies_jsessionid(resp.cookies);
		const cas_login_submit_url = cas_login_url
			+ ';jsessionid='
			+ JSESSIONID
			+ cas_login_params;
		const respcookies =
			'cas_hash=; Language=zh_CN; JSESSIONID=' + JSESSIONID;
		get_request_promise(
			cas_login_submit_url,
			respcookies,
			(new URLSearchParams(cas_login_data)).toString(),
			{
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			{
				method: 'POST',
			}
		).then((resp) => {
			if (resp.statusCode != 302) {
				console.log(username, '登录失败!');
				return;
			}
			get_request_promise(resp.headers.location).then((resp) => {
				const cookies = 'JSESSIONID='
					+ get_cookies_jsessionid(resp.cookies);
				get_request_promise(
					resp.headers.location,
					cookies
				).then((resp) => {
					get_request_promise(
						resp.headers.location,
						cookies
					).then((resp) => {
						get_request_promise(
							resp.headers.location,
							cookies
						).then((resp) => {
							callback(cookies);
						});
					});
				});
			});
		});
	});
}

module.exports = get_jsessionid_cookies_promise;
