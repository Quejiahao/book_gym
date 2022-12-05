#!node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=unsubscribe' \
	-H 'Cookie: JSESSIONID=aKHnScKkgAt9zyenDn' \
	-H 'User-Agent: M' \
	--data-raw 'bookId=2115180' \
	--silent --noproxy '*' | iconv -t utf-8 -f gbk
 */

const { book_url_root, gym_book_url } = require('./url_const');
const { get_request_promise } = require('./utils');

function get_unpay_orders(cookies, callback) {
	const gym_view_params = '?' + (new URLSearchParams({
		ms: 'viewGymBook',
		gymnasium_id: '2',
		viewType: 'm',
	})).toString();
	const gym_view_url = gym_book_url + gym_view_params;
	return get_request_promise(gym_view_url, cookies).then((resp) => {
		resp.text = (new TextDecoder("gbk")).decode(resp.buffer);

		const unpay_strs_regex = /(?<=d">).*(?=<\/t)/g;
		const unpay_bookids_regex = /(?<=e\(')[0-9]{7}/g;
		const unpay_orders = new Map();
		while (unpay_order_bookid = unpay_bookids_regex.exec(resp.text)) {
			const unpay_order_strs = [];
			for (var i = 0; i < 4; ++i) {
				unpay_order_strs.push(unpay_strs_regex.exec(resp.text)[0]);
			}
			unpay_orders.set(parseInt(unpay_order_bookid), unpay_order_strs);
		}
		callback(unpay_orders);
	});
}

function drop_orders(cookies, username, bookid) {
	const gym_drop_params = '?' + (new URLSearchParams({
		ms: 'unsubscribe',
	})).toString();
	const gym_drop_url = book_url_root
		+ 'gymbook/gymbook/gymBookAction.do'
		+ gym_drop_params;
	const gym_drop_data = {
		bookId: bookid,
	};
	get_request_promise(
		gym_drop_url,
		cookies,
		(new URLSearchParams(gym_drop_data)).toString(),
		{
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		{
			method: 'POST',
		},
	).then((resp) => {
		const resp_msg = (new TextDecoder("gbk")).decode(resp.buffer);
		console.log(username, resp_msg);
	});
}

exports.get_unpay_orders = get_unpay_orders;
exports.drop_orders = drop_orders;
