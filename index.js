#!node

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { user_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');
const { get_unpay_orders, drop_orders } = require('./drop_orders');

const date_str = '2022-12-06';

for (var i = 0; i < user_pool.length; ++i) {
	const username = user_pool[i][0];
	const password = user_pool[i][1];
	get_jsessionid_cookies_promise(username, password, (cookies) => {
		get_kaptcha_code_promise(cookies, (kaptcha_code) => {
			get_available_fields({} /*cookies*/, (all_fields) => {
				// 服务器会检测时间间隔, 间隔需大于 1997 ms, 考虑使用不同账号异步
				book_gym(
					cookies,
					username,
					kaptcha_code,
					all_fields.get(5627),
					date_str,
					'15712153690',
					() => {
						get_unpay_orders(cookies, (unpay_orders) => {
							for (const unpay_bookid of unpay_orders.keys()) {
								drop_orders(cookies, username, unpay_bookid);
							}
						});
					},
				);
			}, date_str, '乒乓球');
		});
	}
	);
}
