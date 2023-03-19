#!/usr/bin/env node

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { user_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');
const { get_unpay_orders, drop_orders } = require('./drop_orders');
const { three_days_later, sleep, senven_thirty_do } = require('./utils');

const date_str = three_days_later();
const sport_name = '乒乓球';
const phone_number = '15712153690';
const field_nums = [5477, 5527];
const time_step = 1997;//15;	// 1997;
const is_loop_book = true;
const is_drop_test = true;

user_pool.map((user, user_ind) => {
	const username = user[0];
	const password = user[1];
	get_jsessionid_cookies_promise(username, password, (cookies) => {
		get_kaptcha_code_promise(cookies, (kaptcha_code) => {
			get_available_fields({}, (all_fields) => {
				function _book_gym() {
					const field_num = field_nums[user_ind % field_nums.length];
					const field_code = all_fields.get(field_num);
					// for (const [field_num, field_code] of all_fields)
					book_gym(
						cookies,
						username,
						kaptcha_code,
						field_code,
						date_str,
						phone_number,
						() => {
							get_unpay_orders(cookies, (unpay_orders) => {
								for (const [unpay_bookid, unpay_order_strs]
									of unpay_orders) {
									const unpay_order_str = unpay_order_strs
										.join(' ')
										.replace('&nbsp;&nbsp;', ' ');
									console.log(
										'已经预定未支付',
										unpay_order_str,
									);
									if (is_drop_test) {
										drop_orders(
											cookies,
											username,
											unpay_bookid,
											unpay_order_str,
										);
									}
								}
							});
						},
						field_num,
					);
					if (is_loop_book) {
						sleep(time_step).then(_book_gym);
						user_ind += user_pool.length;
					}
				}
				senven_thirty_do(_book_gym);
			}, date_str, sport_name);
		});
	});
});
