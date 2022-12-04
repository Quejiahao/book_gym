#!node

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { username_pool, password_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');
const { get_unpay_orders, drop_orders } = require('./drop_orders');

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
					all_fields.get(6027),
					'2022-12-06',
					'15712153690',
					// () => {
					// 	get_unpay_orders(cookies, (unpay_orders) => {
					// 		for (const unpay_bookid of unpay_orders.keys()) {
					// 			drop_orders(cookies, unpay_bookid);
					// 		}
					// 	});
					// },
				);
			}, '2022-12-06', '羽毛球');
		});
	}
);
