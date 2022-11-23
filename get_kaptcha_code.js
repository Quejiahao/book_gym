const { book_url_root } = require('./url_const');
const { get_request_promise } = require('./utils');

var startTime;

function test_kaptcha_code_promise(test_code, cookies, callback) {
	const check_code_url = book_url_root
		+ 'front/frontAction.do?ms=checkCodeAjax&checkcodeuser='
		+ test_code;

	return get_request_promise(check_code_url, cookies)
		.then(
			resp => {
				if (resp.text === 'success') {
					const endTime = performance.now();
					console.log(
						`Get kaptcha code took ${endTime - startTime} ms.`
					);
					callback(cookies, test_code);
					return test_code;
				}
			}
		);
}

function get_kaptcha_code_promise(cookies, callback) {
	const kaptcha_url = book_url_root + 'Kaptcha.jpg';

	startTime = performance.now();
	return get_request_promise(kaptcha_url, cookies).then(
		() => [...Array(200)].map(
			(e, kaptcha_code) =>
				test_kaptcha_code_promise(kaptcha_code, cookies, callback)
		)
	);
}

module.exports = get_kaptcha_code_promise;
