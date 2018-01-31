import apiUrl from '../../../api-url.js' 
import * as tool from '../../../tool.js' 
Page({
  data: { 
    showPaySure:false,//展示支付确认框
    btn_status:false,//按钮激活
    input_1:'',//该页面的第一个输入框的值
    input_2:'',//该页面的第二个输入框的值
    disType:null,//距离类型
    latitude:null,//纬度
    longitude:null,//经度
    nowCate:'普通红包',//普通红包
    otherCate:'拼手气红包',//手气红包
    moneyCate:1,//0为手气红包,1为普通红包
    fromTemplateData:null,//从模板页面传来的数据
    ableUseRepository:false
  },
  // 确认支付,选择支付方式
  surePay(){
    let gData = getApp().globalData
    let token = gData.nowToken
    let unionId = gData.unionId
    // 根据红包类型,判断总金额算法
    if (this.data.moneyCate == 0) {
      var totalAmount = this.data.input_1 * 100
    } else {
      var totalAmount = this.data.input_1 * this.data.input_2 * 100
    }
    let param = {

    }
    console.log(totalAmount)
    // 查询小金库金额和应支付金额对比,计算小金库余额是否可以支付
    tool.request(apiUrl.userCenter.personCenter, token, param, unionId).then(data=>{
      console.log(data.remainAmount)
      if (data.remainAmount > totalAmount){
        this.setData({
          ableUseRepository:true
        })
      }
      else{
        this.setData({
          ableUseRepository: false
        })
      }
    })
    this.setData({
      showPaySure: true
    })
  },
  // 取消支付
  cancelPay(){
    this.setData({
      showPaySure: false
    })
  },
  // 跳转到其它页面
  goOtherPage(e){
    /**
     * @type:0; 跳转到个人信息页面
     * @type:1; 跳转到高级设置页面
     */
    if(e.currentTarget.dataset.type == 0){
      wx:wx.navigateTo({
        url: '/pages/hongbao/faHongBao/personInfo/personInfo'
      })
    }
    else{
      wx: wx.navigateTo({
        url: '/pages/hongbao/faHongBao/advancedSet/advancedSet'
      })
    }
  },
  // 修改红包方式
  changeCate(){
    if(this.data.moneyCate==1){
      this.setData({
        nowCate:'拼手气红包',
        otherCate:'普通红包',
        moneyCate: 0,
        input_1:'',
        input_2:'',
        rules: 2//拼手气
      })
      name = '拼手气红包'
    }else{
      this.setData({
        nowCate: '普通红包',
        otherCate: '拼手气红包',
        moneyCate:1,
        input_1: '',
        input_2: '',
        rules: 1//均分
      })
    }
  },
  // 发红包
  distribute(e){
    let type = e.currentTarget.dataset.type
    let gData = getApp().globalData
    let advancedSet = gData.hongbaoSet.advancedSet
    let info = gData.hongbaoSet.info
    let token = gData.nowToken
    let unionId = gData.unionId
    let totalCount = Number(this.data.input_2)
    let pos = [this.data.longitude, this.data.latitude]
    let templateUrl = this.data.fromTemplateData.templateUrl
    // 根据红包类型,判断总金额算法
    if (this.data.moneyCate == 0) {
      var totalAmount = this.data.input_1 * 100
    } else {
      var totalAmount = this.data.input_1 * this.data.input_2 * 100
    }
    let param = {
      "totalAmount": totalAmount,//总金额
      "totalCount": totalCount,//总数量
      "rules": this.data.rules,//1为均分,2为拼手气
      "pos": pos,//经纬度
      "scope": advancedSet.scopeType,//发送红包范围
      "redbagCategory": 1,//1个人红包,2店铺红包
      "redbagType": 1,//1贺卡红包
      "style": {
        "templateUrl": templateUrl,//模板背景图
        "greeting": info.blessing,//祝福语
        "logo": info.headImg,//头像
        "name": info.nickName,//昵称
        "cardId": 0
      },
      "payType":type,//1为微信支付,2为小金库
      "share": advancedSet.ableShared,//可被分享
      "visual": advancedSet.ableSearched//可被搜索到
    }
    /**
     * @type=1；微信支付
     * @type=2;小金库支付
     */
    if (type==1){
      let param_1 = {
        totalAmount: totalAmount,
        tradeType: 3//代表3km
      }
      /**
         * 请求步骤:
         * 1.请求账单信息.
         * 2.请求支付权限和信息.
         * 3.调用微信支付接口.
         */
      //1.
      tool.request(apiUrl.redbag.payInfo, token, param_1,unionId)
      .then((data) => {
        return data
      })
      .then(data=>{
        let param_2 = {
          orderNo: data.outTradeNo,
          openid: data.openId,
          tradeType:'JSAPI',
          billType:12
        }
        //2.
        tool.request(apiUrl.redbag.payment, token, param_2, unionId)
        .then((data) => {
          return data
        })
        .then(data=>{
          //3.
          wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            'success': function (res) {
              wx.showToast({
                title: '支付成功',
              })
              // 支付成功之后,分发红包
              tool.request(apiUrl.redbag.distribute, token, param, unionId).then(data => {
                wx.showToast({
                  title: '发送成功'
                })
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
    if(type==2){
      tool.request(apiUrl.redbag.distribute, token, param, unionId).then(data=>{
        wx.showToast({
          title: '发送成功'
        })
      })
    }
    if(type==3){
      wx.showToast({
        title: '余额不足',
        image: '/img/warning.png'
      })
    }
    this.setData({
      showPaySure: false
    })
  }
  ,
  // input输入框
  inputSome(e){
    /**
     * @type=0; 操作第一个输入框
     * @type=1; 操作第二个输入框
     */
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    switch(type){
      case 0: this.data.input_1 = value
      break;
      case 1: this.data.input_2 = value
    }
    this.setData({
      input_1: this.data.input_1,
      input_2: this.data.input_2
    })
    let tem_btn_status = false
    // 判断按钮是否可以点击
    if (this.data.input_1.length>0&this.data.input_2.length>0){
      tem_btn_status = true
    }
    this.setData({
      btn_status: tem_btn_status
    })
  },
  formSubmit(e){
    let gData = getApp().globalData
    let token = gData.nowToken
    let unionId = gData.unionId
    console.log(e.detail,'11111111111')
    let param = {
      formId: e.detail.formId
    }
    tool.request(apiUrl.formId.formId, token,param ,unionId).then(data => {
      console.log('123', data)
    })
  }
  ,
  onShow: function (options) {
    getApp().onReady((err) => {
      // 如果主动设置了红包发送的位置
      if (getApp().globalData.hongbaoSet.advancedSet.latitude) {
        this.setData({
          latitude: getApp().globalData.hongbaoSet.advancedSet.latitude,
          longitude: getApp().globalData.hongbaoSet.advancedSet.longitude
        })
      } else {
        // 获取经纬度
        tool.getLocation().then((data) => {
          this.setData({
            latitude: data.latitude,
            longitude: data.longitude
          })
        })
      }
    })
  },
  onLoad: function(options){
    options = decodeURIComponent(options.info)
    options = JSON.parse(options)
    this.setData({
      fromTemplateData: options
    })
  }
})