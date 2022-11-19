#!node
const { strEnc } = require('./des');
const { username_pool, password_pool } = require('./get_user_pool');
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
	username = username_pool[0],
	password = password_pool[0],
	callback
) {
	const cas_login_params = '?' + (new URLSearchParams({
		'service': book_url_root + 'login.jsp',
	})).toString();
	const cas_login_lt_url = cas_login_url + cas_login_params;
	get_request_promise(cas_login_lt_url).then((resp) => {
		const lt_regex = /(?<=name="lt" value=").*(?=")/;
		const execution_regex = /(?<=name="execution" value=").*(?=")/;
		const lt = resp.text.match(lt_regex)[0];
		const execution = resp.text.match(execution_regex)[0];

		cas_login_data = {
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
				// 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.50',
				// 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
				// 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
				// 'Cache-Control': 'no-cache',
				// 'Connection': 'keep-alive',
				// 'DNT': '1',
				// 'Origin': 'http://cas.bnu.edu.cn',
				// 'Pragma': 'no-cache',
				// 'Referer': 'http://cas.bnu.edu.cn/cas/login?service=https%3A%2F%2Fcgyd.prsc.bnu.edu.cn%2Flogin.jsp',
				// 'Upgrade-Insecure-Requests': '1',
			},
			{ method: 'POST' }
		)
			.then((resp) => {
				console.log('resp.cookies: ' + resp.cookies);
				get_request_promise(resp.headers.location).then((resp) => {
					const JSESSIONID = get_cookies_jsessionid(resp.cookies);
					callback(JSESSIONID);
				});
			});
	});
}

module.exports = get_jsessionid_cookies_promise;
