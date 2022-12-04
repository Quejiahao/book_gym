#!node
/**
https://cgyd.prsc.bnu.edu.cn/gymbook/payAction.do?ms=getOrdersForUnpay

curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=unsubscribe' \
	-H 'Cookie: JSESSIONID=aKHnScKkgAt9zyenDn' \
	-H 'User-Agent: M' \
	--data-raw 'bookId=2115180' \
	--silent --noproxy '*' | iconv -t utf-8 -f gbk
 */

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { username_pool, password_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');

get_jsessionid_cookies_promise(
	username_pool[0],
	password_pool[0],
	(cookies) => {
		get_kaptcha_code_promise(cookies, (kaptcha_code) => {
			get_available_fields({} /*cookies*/, (all_fields) => {
				// 服务器会检测时间间隔, 间隔需大于 1997 ms, 以后考虑使用不同账号异步
				book_gym(
					cookies,
					kaptcha_code,
					'15712153690',
					all_fields.get(6027),
					'2022-12-06',
				);
			}, '2022-12-06', '羽毛球');
		});
	}
);
