import ApiUrl from './api-url';

/**
 * 自定义 Error 类
 *
 * code == 0 正确
 * code > 0 HTTP 请求，服务器端返回的错误码
 * code == -1 HTTP 请求，服务器返回的数据格式不正确，服务器错误
 */
export function MyError(message, code, extra) {
    if (!Error.captureStackTrace) {
        this.stack = (new Error()).stack;
    } else {
        Error.captureStackTrace(this, this.constructor);
    }
    this.message = message;
    this.code = code;
    this.extra = extra;
}

MyError.prototype = new Error();
MyError.prototype.name = 'MyError';
MyError.prototype.constructor = MyError;

export const CancelAuthError = new MyError('没有授权', -100);

// 可以把 wx 对象里的方法(传入参数中包含 success 和 fail)转换为返回 promise 的方法
function promisifyWx(name) {
    return function (param) {
        console.log('wx.' + name + ' [executing] ->', param);
        return new Promise((resolve, reject) => {
            let base = {
                success: (res) => {
                    console.log('wx.' + name + ' [success]:', res);
                    resolve(res);
                },
                fail: (err) => {
                    console.log('wx.' + name + ' [fail]:', err);
                    reject(new MyError(err.errMsg, -2));
                }
            };
            wx[name](Object.assign({}, param, base));
        });
    };
}

exports.wx = {};

for (let name in wx) {
    exports.wx[name] = promisifyWx(name);
}

export function genReqBody(token, param, unionId) {
    let body = {
        reqId: 0,
        channel: 10,
        os: '',
        ver: '',
        appVer: '',
        model: '',
        lng: '',
        lat: '',
        signType: '',
        sign: '',
        token,
        param,
        unionId,
        appId: 7
    };

    return body;
}

/**
 * 对 Tool.wx.request 进一步处理
 */
export function request(url, token, param, unionId, callback) {
    if (typeof unionId === 'function') {
        callback = unionId;
        unionId = undefined;
    }
    let p = exports.wx.request({
        url,
        method: 'POST',
        data: genReqBody(token, param, unionId)
    }).then(res => {
        let resBody = res.data;
        if (resBody && typeof resBody === 'object') {
            if (resBody.code === 0) {
                return resBody.data;
            } else if (resBody.code > 0) {
                let message = resBody.showMsg || '服务器错误';
                let extra;
                if (message.length > 50) {
                    extra = message;
                    message = '服务器错误';
                }
                throw new MyError(message, resBody.code, extra);
            }
        }
        throw new MyError('服务器错误', -1, resBody);
    }, err => {
        throw new MyError('没有网络连接或服务器错误', err.code, err);
    });

    if (typeof callback === 'function') {
        p.then(data => callback(null, data), callback);
    } else {
        return p;
    }
}

/**
 * @param {string} options.fn
 * @param {string} options.confirm.title
 * @param {string} options.confirm.content
 * @param {string} options.confirm.showCancel
 * @param {object} options.params
 * @param {boolean} options.onlyOnce
 */
export function ensureAuth(options) {
    return exports.wx[options.fn]({ ...options.params })
        .then(res => res, err => {
            if (err && err.message && /auth deny/i.test(err.message)) {
                return exports.wx.showModal({
                    showCancel: options.confirm.showCancel,
                    title: options.confirm.title,
                    content: options.confirm.content,
                }).then(res => {
                    if (res.confirm) {
                        return exports.wx.openSetting()
                            .then(res => {
                                if (options.onlyOnce) {
                                    throw err;
                                } else {
                                    return ensureAuth(options);
                                }
                            });
                    } else {
                        throw CancelAuthError;
                    }
                });
            } else {
                throw err;
            }
        });
}

export function login() {
    let options = {
        fn: 'getUserInfo',
        confirm: {
            title: '微信授权',
            content: '新乐汇卡券包需要获得你的公开信息（昵称、头像等）',
            showCancel: true
        }
    };

    return Promise.all([
        exports.wx.login(),
        ensureAuth(options)
    ]).then(res => {
        let code = res[0].code;
        let userInfo = res[1].userInfo;
        let param = {
            code,
            nickName: userInfo.nickName,
            sex: userInfo.gender,
            province: userInfo.province,
            headImgUrl: userInfo.avatarUrl,
            city: userInfo.city,
            country: userInfo.country,
            encryptedData: res[1].encryptedData,
            iv: res[1].iv
        };

        return exports.wx.request({
            url: ApiUrl.user.login,
            method: 'POST',
            data: genReqBody('', param)
        }).then(res => {
            if (res.data.code === 0) {
                return {
                    userInfo,
                    loginInfo: res.data.data
                };
            } else {
                let message = res.data.showMsg || '服务器错误';
                let extra;
                if (message.length > 50) {
                    extra = message;
                    message = '服务器错误';
                }
                throw new MyError(message, res.data.code, extra);
            }
        })
    });
}

export function getLocation() {
    let options = {
        fn: 'getLocation',
        params: { type: 'gcj02' },
        confirm: {
            title: '微信授权',
            content: '新乐汇卡券包需要获取你的位置信息',
            showCancel: true,
            onlyOnce: true
        }
    }
    return ensureAuth(options);
}
export function chooseLocation() {
    let options = {
        fn: 'chooseLocation',
        confirm: {
            title: '微信授权',
            content: '新乐汇卡券包需要获取你的位置信息',
            showCancel: true,
            onlyOnce: true
        }
    }
    return ensureAuth(options);
}

export function formatMoeny(money, digits = 2) {
    let num = parseInt(money);
    if (digits < 0) {
        if (num % 10 > 0) {
            digits = 2;
        } else if (num % 100 > 0) {
            digits = 1;
        } else {
            digits = 0;
        }
    }
    return (num / 100).toFixed(digits);
}

export function formatDistance(distance, digits = 2) {
    let num = Math.round(parseInt(distance) / 10);
    if (digits < 0) {
        if (num % 10 > 0) {
            digits = 2;
        } else if (num % 100 > 0) {
            digits = 1;
        } else {
            digits = 0;
        }
    }
    return (num / 100).toFixed(digits);
}

/**
 * 封禁无限回调
 */
export function disabledCallBack() {
    wx.showModal({
        title: '账号封禁',
        content: '您的账号涉嫌违规/作弊/其他原因被封禁，若申诉请联系客服：400-6858-188进行处理',
        confirmText: '确 定',
        confirmColor: '#ee4126',
        showCancel: false,
        success: (res) => {
            if (res.confirm) {
                // wx.makePhoneCall({
                //     phoneNumber: '4006858188'
                // })
                disabledCallBack();
            } else {
                wx.navigateBack();
            }
        }
    })
}