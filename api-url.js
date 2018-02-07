// const ENV = 'dev';
// const ENV = 'test';
const ENV = 'prod';

let baseUrl = {
    wallet: {
        dev: 'http://192.168.2.6:9101/xcx-wallet',
        // test: 'http://192.168.2.132:9081/xcx-wallet',
        test: 'http://192.168.2.143:9101/xcx-wallet',
        prod: 'https://wallet.jinghanit.com/xcx-wallet'
    },
    fastdfs: {
        dev: 'https://file.jinghanit.com/jinghan-fastdfs',
        test: 'https://file.jinghanit.com/jinghan-fastdfs',
        prod: 'https://file.jinghanit.com/jinghan-fastdfs'
    },
    payment: {
        dev: 'http://192.168.2.6:9089/jinghan-payment/api/wx/wxUnifiedOrder',
        test: 'http://192.168.2.143:9089/jinghan-payment/api/wx/wxUnifiedOrder',
        prod: 'https://payxcx.jinghanit.com/jinghan-payment/api/wx/wxUnifiedOrder'
    },
    websocket: {
        dev: 'ws://192.168.2.6:9101/xcx-wallet/websocket',
        test: 'ws://192.168.2.143:9101/xcx-wallet/websocket',
        prod: 'wss://wallet.jinghanit.com/xcx-wallet/websocket'
    },
    uploadUrl: {//上传图片
        dev: 'https://file.jinghanit.com/jinghan-fastdfs/fdfs/upload.shtml',
        test: 'https://file.jinghanit.com/jinghan-fastdfs/fdfs/upload.shtml',
        prod: 'https://file.jinghanit.com/jinghan-fastdfs/fdfs/upload.shtml'
    },
    cacheFormId: {
        dev: 'http://192.168.2.6:9099/jinghan-user/api/access/v2/skip/cacheFormId',
        test: 'http://192.168.2.143:9099/jinghan-user/api/access/v2/skip/cacheFormId',
        prod: 'https://user.jinghanit.com/jinghan-user/api/access/v2/skip/cacheFormId'
    }
};

const b = (c = 'website', e = 'dev') => {
    if (ENV !== 'dev') {
        return baseUrl[c][ENV];
    } else {
        return baseUrl[c][e];
    }
};

export default {
    index: b('wallet') + '/',
    socket: b('websocket'),
    file: b('fastdfs') + '/fdfs/upload.shtml',
    user: {
        login: b('wallet') + '/api/user/v2/skip/login',
        validate: b('wallet') + '/api/redbag/v2/validateRedbagAndUser'
    },
    redbag: {
        leaveWordAfterReceiveRedbag: b('wallet') + '/api/redbag/v2/leaveWordAfterReceiveRedbag',
        search: b('wallet') + '/api/redbag/v2/search',
        snatch: b('wallet') + '/api/redbag/v2/snatch',
        distribute: b('wallet') + '/api/redbag/v2/distribute',
        template: b('wallet') + '/api/blessTemplate/v2/templateList',
        payInfo: b('wallet') + '/api/redbag/v2/payInfo',
        complainAfterReceiveRedbag: b('wallet') + '/api/redbag/v2/complainAfterReceiveRedbag',//投诉建议
        payment: b('payment'),
        rank: b('wallet') + '/api/redbag/v2/rank',
        genSpreadDetail: b('wallet') + '/api/redbag/v2/genSpreadDetail',
        qrCode: b('wallet') + '/api/redbag/v2/image',
        advertise: b('wallet') + '/api/redbag/v2/advertise',
    },
    myhb: {
        tradeList: b('wallet') + '/api/account/v2/tradeList', // 我的红包
        detail: b('wallet') + '/api/redbag/v2/detail' // 详情
    },
    userCenter: {
        personCenter: b('wallet') + '/api/user/v2/personCenter',//获取用户基础信息
        withdraw: b('wallet') + '/api/account/v2/withdraw',//提现
        tradeList: b('wallet') + '/api/account/v2/tradeList',//提现

    },
    uploadUrl: {
        uploadUrl: b('uploadUrl')
    },
    formId: {
        formId: b('cacheFormId')
    }
}