#!node

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { user_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');
const { get_unpay_orders, drop_orders } = require('./drop_orders');
const { three_days_later, sleep } = require('./utils');

const date_str = three_days_later();
const sport_name = '乒乓球';
const phone_number = '15712153690';
const field_nums = [5527];
const time_step = 10;	// 1997;
const is_loop_book = false;

user_pool.map((user, user_ind) => {
	const username = user[0];
	const password = user[1];
	user[0] = 0;
	get_jsessionid_cookies_promise(username, password, (cookies) => {
		get_kaptcha_code_promise(cookies, (kaptcha_code) => {
			get_available_fields({}, (all_fields) => {
				function _book_gym() {
					const field_num = field_nums[(user_ind + user[0]) % field_nums.length];
					// console.log(field_num);
					book_gym(
						cookies,
						username,
						kaptcha_code,
						all_fields.get(field_num),
						date_str,
						phone_number,
						() => {
							get_unpay_orders(cookies, (unpay_orders) => {
								for (const unpay_bookid
									of unpay_orders.keys()) {
									// drop_orders(
									// 	cookies,
									// 	username,
									// 	unpay_bookid,
									// );
								}
							});
						},
					);
					if (is_loop_book) {
						sleep(time_step).then(_book_gym);
						user[0] += 2;
					}
				}
				_book_gym();
			}, date_str, sport_name);
		});
	});
});
