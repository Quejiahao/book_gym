#!/usr/bin/env node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=saveGymBook' \
	-H 'Cookie: JSESSIONID=aypuIgg4WSg40C5Dyt' \
	--data-raw 'bookData.book_person_phone=15712153690&selectedPayWay=1&allFieldTime=F1F54054648F1FD048AA0FB16DDEA7894C784753343F3228%232022-12-06&checkcodeuser=78' \
	--silent --noproxy '*' | iconv -t utf-8 -f gbk
 */

const { gym_book_url } = require('./url_const');
const { get_request_promise, three_days_later } = require('./utils');

function book_gym(
	cookies,
	username,
	kaptcha_code,
	field_code,
	date_str = three_days_later(),
	phone_number = '15712153690',
	callback = () => { },
	field_num,
	is_show_curl = false,
) {
	const gym_book_params = '?' + (new URLSearchParams({
		ms: 'saveGymBook',
	})).toString();
	const gym_book_url_params = gym_book_url + gym_book_params;
	const gym_book_data = {
		'bookData.book_person_phone': phone_number,
		selectedPayWay: '1',
		allFieldTime: field_code + '#' + date_str,
		checkcodeuser: kaptcha_code,
	};
	const gym_book_data_raw = (new URLSearchParams(gym_book_data)).toString();
	if (is_show_curl) {
		console.log(
			(new Date()).toISOString(),
			"curl "
			// + "-w '@a.txt' "
			+ "--silent '"
			+ gym_book_url_params
			+ "' --data-raw '"
			+ gym_book_data_raw
			+ "' -H 'Cookie: "
			+ cookies
			+ "' --noproxy '*' | iconv -t utf-8 -f gbk"
		);
	}
	get_request_promise(
		gym_book_url_params,
		cookies,
		gym_book_data_raw,
		{
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		{
			method: 'POST',
		},
	).then((resp) => {
		const resp_msg = JSON.parse(
			(new TextDecoder("gbk")).decode(resp.buffer)
		).msg;
		console.log((new Date()).toISOString(), username, field_num, resp_msg);
		callback();
	});
}

module.exports = book_gym;
