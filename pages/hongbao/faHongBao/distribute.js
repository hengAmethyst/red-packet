import apiUrl from '../../../api-url.js'
import * as tool from '../../../tool.js'
export default (that,itemData)=>{
  that.setData({
    showPaySure: false
  })
  let gData = itemData.gData//全局数据
  let getFromData = itemData.getFromData//来自模板的数据
  let token = gData.nowToken
  let unionId = gData.unionId
  // 根据红包类型,判断总金额算法
  if (getFromData.moneyCate == 1) {
    var totalAmount = getFromData.input_1 * 100
  } else {
    var totalAmount = getFromData.input_1 * getFromData.input_2 * 100
  }
  let param = {
    "totalAmount": totalAmount,//总金额
    "totalCount": itemData.totalCount,//总数量
    "rules": getFromData.moneyCate + 1,//1为均分,2为拼手气
    "pos": itemData.pos,//经纬度
    "scope": itemData.scopeType,//发送红包范围
    "redbagCategory": 1,//1个人红包,2店铺红包
    "redbagType": 1,//1贺卡红包
    "style": {
      "bgmUrl": itemData.getFromData.templateData.bgmUrl,
      "templateUrl": itemData.getFromData.templateData.templateUrl,//模板背景图
      "greeting": itemData.userInfo.blessing,//祝福语
      "logo": itemData.userInfo.headImg,//头像
      "name": itemData.userInfo.nickName,//昵称
      "cardId": 0
    },
    "payType": itemData.payType,//1为微信支付,2为小金库
    "share": itemData.ableShare,//可被分享
    "visual": true,//可被搜索到
    "reward": itemData.reward//赏金金额
  }
  /**
   * @type=1；微信支付
   * @type=2;小金库支付
   */
  console.log(itemData,'$$$$$')
  if (itemData.payType == 1) {
    let param_1 = {
      totalAmount: totalAmount + itemData.reward * getFromData.input_2,
      tradeType: 3//代表3km
    }
    /**
       * 请求步骤:
       * 1.请求账单信息.
       * 2.请求支付权限和信息.
       * 3.调用微信支付接口.
       */
    //1.
    tool.request(apiUrl.redbag.payInfo, token, param_1, unionId)
      .then((data) => {
        return data
      })
      .then(data => {
        let param_2 = {
          orderNo: data.outTradeNo,
          openid: data.openId,
          tradeType: 'JSAPI',
          billType: 12
        }
        param.outTradeNo = data.outTradeNo
        //2.
        tool.request(apiUrl.redbag.payment, token, param_2, unionId)
          .then((data) => {
            return data
          })
          .then(data => {
            //3.
            wx.requestPayment({
              timeStamp: data.timeStamp,
              nonceStr: data.nonceStr,
              package: data.package,
              signType: data.signType,
              paySign: data.paySign,
              'success': (res) => {
                // 支付成功之后,分发红包
                tool.request(apiUrl.redbag.distribute, token, param, unionId).then(data => {
                  console.log(data, '我是红包Id')
                  // 如果是分享红包
                  if (itemData.ableShare) {
                    that.setData({
                      showShareBtn: true,
                      hongbaoId: data
                    })
                    // 生成推广记录
                    let param_now = {
                      redbagId: data,
                      pUnionId: unionId
                    }
                    tool.request(apiUrl.redbag.genSpreadDetail, token, param_now, unionId).then(data =>{
                      console.log(data, '我是推广记录')
                    })
                  } else {
                    // 成功后跳转到模板选择页
                    wx.showToast({
                      title: '发送成功',
                      complete: () => {
                        setTimeout(() => {
                          wx.switchTab({
                            url: '/pages/hongbao/hongbao'
                          })
                        }, 700)
                      }
                    })
                  }
                })
              },
              'fail': function (res) {
                wx.showToast({
                  title: '支付失败',
                })
              }
            })
          })
      })
  }
  if (itemData.payType == 2) {
    tool.request(apiUrl.redbag.distribute, token, param, unionId).then(data => {
      // 如果是分享红包
      if (itemData.ableShare) {
        that.setData({
          showShareBtn: true,
          hongbaoId: data//data就是id
        })
        let param_now = {
          redbagId: data,
          pUnionId: unionId
        }
        tool.request(apiUrl.redbag.genSpreadDetail, token, param_now, unionId).then(data =>{
          console.log(data, '我是推广记录')
        })
      } else {
        // 成功后跳转
        wx.showToast({
          title: '发送成功',
          complete: () => {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/hongbao/hongbao'
              })
            }, 700)
          }
        })
      }
    })
  }
  if (itemData.payType == 3) {
    wx.showToast({
      title: '余额不足',
      image: '/img/warning.png'
    })
  }
}