
 async function getKey(type){
	const toidData = (await axios.get(`https://webapi.account.mihoyo.com/Api/login_by_cookie?t=${Date.now()}`, {
	    withCredentials: true,
	})).data
	
	if(!toidData.data.account_info?.account_id){
		return false
	}
	
	const uid = toidData.data.account_info.account_id
	const token = toidData.data.account_info.weblogin_token
	const tidData = (await axios.get(`https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket?login_ticket=${token}&token_types=3&uid=${uid}`, {
	    withCredentials: true,
	})).data
	
	var d = new Date();
	d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000)); 
	document.querySelector('iframe').contentDocument.cookie = `stuid=${uid}; domain=.mihoyo.com; expires=${d.toUTCString()}; path=/;`
	tidData.data.list.map(v => {
		document.querySelector('iframe').contentDocument.cookie = `${v.name}=${v.token}; domain=.mihoyo.com; expires=` + d.toUTCString() + "; path=/";
	})
	
	const uidData = (await axios.get('https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn', {
	    withCredentials: true,
	})).data
	const { game_uid, game_biz, region } = uidData.data.list[0]
	
	const authkeyData = await axios.post("https://api-takumi.mihoyo.com/binding/api/genAuthKey", {
	    auth_appid: type,
	    game_biz,
	    game_uid,
	    region,
	}, {
		withCredentials: true,
	    headers: {
	        "Content-Type": "application/json;charset=utf-8",
	        "Accept": "application/json, text/plain, */*",
			'Access-Control-Allow-Credentials': true,
	        "x-rpc-app_version": "2.28.1",
	        "x-rpc-client_type": "5",
	        "x-rpc-device_id": "CBEC8312-AA77-489E-AE8A-8D498DE24E90",
	        "DS": getDs(),
	    }
	})
	const authkey = authkeyData.data.data.authkey
	if(type == 'csc'){
		return 'https://hk4e-api.mihoyo.com/event/payLog/api/info?win_mode=fullscreen&authkey_ver=1&authkey=' + encodeURIComponent(authkey) + '&page=1&end_id=0'
	} else {
		return `https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?win_mode=fullscreen&authkey_ver=1&sign_type=2&auth_appid=webview_gacha&lang=zh-cn&device_type=mobile&plat_type=ios&game_biz=${game_biz}&size=20&authkey=${encodeURIComponent(authkey)}&region=${region}&timestamp=${Date.now()}&gacha_type=200&page=1&end_id=0`
	}
	
	
	function getDs() {
	    const salt = "ulInCDohgEs557j0VsPDYnQaaz6KJcv5"
	    const randomStr = getStr();
	    const timestamp = Math.floor(Date.now() / 1000)
	    let sign = md5(`salt=${salt}&t=${timestamp}&r=${randomStr}`);
	    return `${timestamp},${randomStr},${sign}`
	}
	
	function getStr() {
	    const _charStr = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
	    let min = 0, max = _charStr.length-1, _str = ''
	    let len = 6
	    for(let i = 0, index; i < len; i++){
	        index = Math.floor(Math.random() * (max-min)) + min;
	        _str += _charStr[index]
	    }
	    return _str
	}
}