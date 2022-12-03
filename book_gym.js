#!node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=saveGymBook' \
	-H 'Cookie: JSESSIONID=anTmfm6TRx7eagodwt' \
	--data-raw 'bookData.book_person_phone=15712153690&selectedPayWay=1&allFieldTime=ABE2C41EC06BF6E5D74A7B236E5A7CD4DDC0C3D179C75F02%232022-12-06&checkcodeuser=50' \
	--silent --noproxy '*' | iconv -t utf-8 -f gbk
 */

const { book_url_root } = require('./url_const');
const { get_request_promise, three_days_later } = require('./utils');

function book_gym(
	cookies,
	kaptcha_code,
	phone_number = '15712153690',
	field_code = 'F1F54054648F1FD0ACF67DE5A03FD8E4D2460164396801A5',
	date_str = three_days_later(),
) {
	const gym_book_params = '?' + (new URLSearchParams({
		ms: 'saveGymBook',
	})).toString();
	const gym_book_url = book_url_root
		+ 'gymbook/gymbook/gymBookAction.do'
		+ gym_book_params;
	const gym_book_data = {
		'bookData.book_person_phone': phone_number,
		selectedPayWay: '1',
		allFieldTime: field_code + '#' + date_str,
		checkcodeuser: kaptcha_code,
	}
	get_request_promise(
		gym_book_url,
		cookies,
		(new URLSearchParams(gym_book_data)).toString(),
		{
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		{
			method: 'POST',
		},
	)
		.then((resp) => {
			const resp_msg = JSON.parse(
				(new TextDecoder("gbk")).decode(resp.buffer)
			).msg;
			console.log(resp_msg);
		})
}

module.exports = book_gym;
