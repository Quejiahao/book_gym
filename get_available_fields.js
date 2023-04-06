#!/usr/bin/env node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/gymsite/cacheAction.do?ms=viewBook&gymnasium_id=2&item_id=5326&time_date=2022-11-20&userType=1' | grep resourcesm.put
 */

const { book_url_root } = require('./url_const');
const { get_request_promise, three_days_later } = require('./utils');

const sports_field_time = [...Array(14)].map(
	(e, index) => {
		return String(index + 8) + ':00-' + String(index + 9) + ':00';
	}
);

const sports = {
	'羽毛球': {
		item_id: '5326',
		time: sports_field_time,
		field_name: [
			'羽1', '羽4', '羽2', '羽3', '羽5', '羽6',
			'小综合馆1试运行', '小综合馆2试运行', '小综合馆3试运行', '小综合馆4试运行'
		],
	},
	'乒乓球': {
		item_id: '5462',
		time: sports_field_time,
		field_name: [...Array(11)].map(
			(e, index) => {
				return '乒' + String(index + 1);
			}
		),
	},
}

function generate_field_nums_array(first_row) {
	return [...Array(14)].map((e, index) => {
		return first_row.map((e) => {
			return e - index * 2;
		});
	});
}

const all_field_names = {
	'羽毛球': [
		'羽1', '羽2', '羽3', '羽4', '羽5', '羽6', '羽7', '羽8',
		'小综合1', '小综合2', '小综合3', '小综合4', '二层东', '二层西'
	],
	'乒乓球': [
		'乒1', '乒2', '乒3', '乒4', '乒5', '乒6',
		'乒7', '乒8', '乒9', '乒10', '乒11'
	]
}

const all_field_nums = {
	'羽毛球': generate_field_nums_array(
		[
			5897, 5947, 5997, 6047, 35426, 35476, 35526, 35576,
			50419, 50469, 50519, 50569, 737994, 738045
		]
	),
	'乒乓球': generate_field_nums_array(
		[
			5497, 5547, 5597, 5647, 5697, 5747,
			5797, 5847, 69134, 69184, 69234
		]
	),
}

function get_item_id(sport_name = '羽毛球') {
	return sports[sport_name].item_id;
}

function get_all_fields_codes(resp_text) {
	const stu_fields_regex = /t:'(.?)'.*\n.*'([0-9]{4,6})', '([0-9,A-Z]{48})/g;
	const all_fields = new Map();
	while (field = stu_fields_regex.exec(resp_text)) {
		all_fields.set(parseInt(field[2]), {
			field_code: field[3],
			can_see_student: field[1] ? parseInt(field[1]) : undefined,
		});
	}
	return all_fields;
}

function delete_student_cannot_see_fields(all_fields) {
	for (const [all_fields_num, all_fields_value] of all_fields) {
		if (all_fields_value.can_see_student) {
			all_fields.delete(all_fields_num);
		}
	}
	return all_fields;
}

function get_locked_fields(resp_text) {
	const locked_fields_regex = /(?<=r\(')([0-9]{4,6})','(.{2})','1/g;
	const locked_fields = new Map();
	while (field = locked_fields_regex.exec(resp_text)) {
		locked_fields.set(parseInt(field[1]), field[2]);
	}
	return locked_fields;
}

function delete_locked_fields(available_fields, locked_fields) {
	for (const locked_fields_num of locked_fields.keys()) {
		available_fields.delete(locked_fields_num);
	}
	return available_fields;
}

function get_available_fields(
	cookies,
	callback,
	date_str = three_days_later(),
	sport_name = '羽毛球',
	usertype = '',
	gymnasium_id = '2',
	is_delete_locked = false,	// locked_fields maybe wrong!!!
) {
	const view_book_params = '?' + (new URLSearchParams({
		ms: 'viewBook',
		gymnasium_id: gymnasium_id,
		item_id: get_item_id(sport_name),
		time_date: date_str,
		userType: usertype,
	})).toString();
	const view_book_url = book_url_root
		+ 'gymsite/cacheAction.do'
		+ view_book_params;
	get_request_promise(
		view_book_url,
		cookies
	).then((resp) => {
		const resp_text = (new TextDecoder("gbk")).decode(resp.buffer);
		const available_fields = get_all_fields_codes(resp_text);
		delete_student_cannot_see_fields(available_fields);
		if (is_delete_locked) {
			const locked_fields = get_locked_fields(resp_text);
			delete_locked_fields(available_fields, locked_fields);
		}
		callback(available_fields);
	});
}

module.exports.all_field_names = all_field_names;
module.exports.all_field_nums = all_field_nums;
module.exports.get_available_fields = get_available_fields;
