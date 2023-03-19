#!/usr/bin/env node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/Kaptcha.jpg' -H 'Cookie: JSESSIONID=aGIaieL83GqgzvWBMa' -O /dev/null --silent

for i in {0..200}
do
	curl 'https://cgyd.prsc.bnu.edu.cn/front/frontAction.do?ms=checkCodeAjax&checkcodeuser='$i -H 'Cookie: JSESSIONID=aLZZvgRG9rTbP9YmHi' --silent
done
 */

const { book_url_root } = require('./url_const');
const { get_request_promise } = require('./utils');

function test_kaptcha_code_promise(test_code, cookies, callback) {
	const check_code_url = book_url_root
		+ 'front/frontAction.do?ms=checkCodeAjax&checkcodeuser='
		+ test_code;

	return get_request_promise(check_code_url, cookies)
		.then(
			resp => {
				if (resp.text === 'success') {
					callback(test_code);
					return test_code;
				}
			}
		);
}

function get_kaptcha_code_promise(cookies, callback) {
	const kaptcha_url = book_url_root + 'Kaptcha.jpg';

	return get_request_promise(kaptcha_url, cookies).then(
		() => [...Array(200)].map(
			(e, kaptcha_code) =>
				test_kaptcha_code_promise(kaptcha_code, cookies, callback)
		)
	);
}

module.exports = get_kaptcha_code_promise;
