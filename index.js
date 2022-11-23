#!node
/**
curl 'https://cgyd.prsc.bnu.edu.cn/Kaptcha.jpg' -H 'Cookie: JSESSIONID=aGIaieL83GqgzvWBMa' -O /dev/null --silent

for i in {0..200}
do
	curl 'https://cgyd.prsc.bnu.edu.cn/front/frontAction.do?ms=checkCodeAjax&checkcodeuser='$i -H 'Cookie: JSESSIONID=aLZZvgRG9rTbP9YmHi' --silent
done

curl 'https://cgyd.prsc.bnu.edu.cn/gymsite/cacheAction.do?ms=viewBook&gymnasium_id=2&item_id=5326&time_date=2022-11-20&userType=1' | grep resourcesm.put
curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=unsubscribe' \
	-H 'Cookie: JSESSIONID=aKHnScKkgAt9zyenDn' \
	-H 'User-Agent: M' \
	--data-raw 'bookId=2115180' \
	--silent \
	--noproxy '*' | iconv -t utf-8 -f gbk
https://cgyd.prsc.bnu.edu.cn/gymbook/payAction.do?ms=getOrdersForUnpay

curl 'https://cgyd.prsc.bnu.edu.cn/gymbook/gymbook/gymBookAction.do?ms=saveGymBook' \
	-H 'Accept: /*'* \
	-H 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
	-H 'Cache-Control: no-cache' \
	-H 'Connection: keep-alive' \
	-H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
	-H 'Cookie: JSESSIONID=aVdiYha7CpZhYZbXDs' \
	-H 'DNT: 1' \
	-H 'Origin: https://cgyd.prsc.bnu.edu.cn' \
	-H 'Pragma: no-cache' \
	-H 'Referer: https://cgyd.prsc.bnu.edu.cn/gymbook/gymBookAction.do?ms=viewGymBook&gymnasium_id=2&item_id=5462&time_date=2022-11-25&userType=&viewType=m' \
	-H 'Sec-Fetch-Dest: empty' \
	-H 'Sec-Fetch-Mode: cors' \
	-H 'Sec-Fetch-Site: same-origin' \
	-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.56' \
	-H 'X-Requested-With: XMLHttpRequest' \
	-H 'sec-ch-ua: "Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"' \
	-H 'sec-ch-ua-mobile: ?0' \
	-H 'sec-ch-ua-platform: "macOS"' \
	--data-raw 'bookData.totalCost=&bookData.book_person_zjh=&bookData.book_person_name=&bookData.book_person_phone=15712153690&bookData.book_mode=from-phone&gymnasium_idForCache=2&item_idForCache=5462&time_dateForCache=2022-11-25&userTypeNumForCache=1&putongRes=putongRes&selectedPayWay=1&allFieldTime=1F055109E64AFBFD338452E73F55D5FD4832CF8C698258FD%232022-11-25&companion_1=&companion_2=&companion_3=&companion_4=&companion_5=&companion_6=&companion_7=&companion_8=&companion_9=&checkcodeuser=119&selectPayWay=1' \
	--compressed | iconv -t utf-8 -f gbk
 */

const get_kaptcha_code_promise = require('./get_kaptcha_code');
const get_jsessionid_cookies_promise = require('./get_jsessionid_cookies');
const { username_pool, password_pool } = require('./get_user_pool');
const book_gym = require('./book_gym');
const get_available_fields = require('./get_available_fields');

get_jsessionid_cookies_promise(
	username_pool[0],
	password_pool[0],
	(JSESSIONID) => {
		// const JSESSIONID = 'aVdiYha7CpZhYZbXDs';
		const cookies = 'JSESSIONID=' + JSESSIONID;
		console.log(cookies);
		get_available_fields(cookies, (all_fields) => {
			console.log(all_fields.get(69214));
		}, '2022-11-25', '乒乓球');
		// 验证码没问题, 前面登录可能有问题
		get_kaptcha_code_promise(cookies, book_gym);
	}
);
