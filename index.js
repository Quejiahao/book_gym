#!/usr/bin/env node

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { user_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const { all_field_names, all_field_nums, get_available_fields }
	= require('./get_available_fields');
const { get_unpay_orders, drop_orders } = require('./drop_orders');
const { three_days_later, sleep, senven_thirty_do } = require('./utils');

const date_str = three_days_later();
const sport_name = '羽毛球'	// '羽毛球' '乒乓球';
const phone_number = '15712153690';
const book_hours = [20];
const book_field_names = [
	// 	'乒10'
	// ];
	'小综合2', '小综合3', '小综合1', '小综合4',
	'羽1', '羽2', '羽3', '羽4', '羽5', '羽6',
];
const book_field_indexes = book_field_names.map(
	(field_name) => all_field_names[sport_name].indexOf(field_name)
);
const field_nums = book_field_indexes.map(
	(field_index) => {
		return book_hours.map(
			(book_hour) => {
				return all_field_nums[sport_name][book_hour - 8][field_index];
			}
		);
	}
).flat();
const time_step = 2003;	// 1997;
const is_loop_book = true;
const is_drop_test = true;

user_pool.map((user, user_ind) => {
	const username = user[0];
	const password = user[1];
	get_jsessionid_cookies_promise(username, password, (cookies) => {
		get_kaptcha_code_promise(cookies, (kaptcha_code) => {
			get_available_fields('', (available_fields) => {
				console.log(available_fields);
				field_nums.map((field_num) => {
					const field_value = available_fields.get(field_num);
					if (!field_value) {
						console.log(field_num, '场地无法预定!');
						const field_num_ind = field_nums.indexOf(field_num);
						field_nums.splice(field_num_ind, 1);
					}
				})
				function _book_gym() {
					if (user_ind === -1) {
						console.log(username, '已经订了 2 个场地了!');
						return;
					}
					if (!field_nums.length) {
						console.log('没有需要预定的场地了!');
						process.exit();
					}
					const field_num = field_nums[user_ind % field_nums.length];
					const field_value = available_fields.get(field_num);
					if (field_value) {
						const field_code = field_value.field_code;
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
										const unpay_order_str
											= unpay_order_strs
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
									if (unpay_orders.size === 2) {
										user_ind = -1;
									}
								});
							},
							field_num,
							true,
						);
						if (is_loop_book) {
							user_ind += user_pool.length;
							sleep(time_step).then(_book_gym);
						}
					}
					else {
						console.log(field_num, '场地无法预定!');
						const field_num_ind = field_nums.indexOf(field_num);
						field_nums.splice(field_num_ind, 1);
						if (is_loop_book) {
							user_ind += user_pool.length;
							_book_gym();
						}
					}
				}
				senven_thirty_do(_book_gym);
				senven_thirty_do(() => sleep(Math.max(
					10000,
					time_step * book_hours.length * book_field_names.length
				)).then(process.exit));
			}, date_str, sport_name, '', '2', true);
		});
	});
});
