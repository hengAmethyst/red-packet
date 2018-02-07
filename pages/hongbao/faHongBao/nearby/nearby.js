import apiUrl from '../../../../api-url.js' 
import * as tool from '../../../../tool.js'
import distribute from '../distribute.js'
Page({
  data: {
    token:null,
    unionId:null,
    headImg:null,//头像
    nickName:null,//昵称
    blessing:'大吉大利,万事如意',//祝福语
    scopeName: '附近3km',
    scopeType: 3,//范围类型
    address: '默认当前位置',//地理位置
    showPaySure:false,//显示支付方式
    getFromData:null,
    ableUseRepository:false,
    moneyCate: null,
    userInfo: null,//个人信息及祝福语
    pos:[],//经纬度
    blessing:null
  },
  // 改变头像
  changeHeadImg(){
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],//压缩
      success: (res) => {
        wx.uploadFile({
          url: apiUrl.file,
          filePath: res.tempFilePaths[0],
          name: "singleImg",
          success: (res) => {
            let data = JSON.parse(res.data);
            this.setData({
              headImg: data.data.fullFilename
            })
          }
        })
      }
    })
  },
  // 输入内容
  inputSome(e){
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    if(type==0){
      this.setData({
        nickName: value
      })
    }else{
      this.setData({
        blessing: value
      })
    }
  },
  // 获得子组件的info
  getInfo(e){
    let info = e.detail
    this.setData({
      userInfo: info
    })
  },
  // 选择位置
  chooseLocation() {
    tool.chooseLocation().then((data) => {
      let tempPos = [data.longitude,data.latitude]
      this.setData({
        pos: tempPos,
        address: data.name
      })
    })
  },
  // 选择范围
  chooseScope() {
    wx.showActionSheet({
      itemList: ['附近3km', '附近5km', '附近10km', '同城', '不限'],
      success: (res) => {
        console.log(res)
        switch (res.tapIndex) {
          case 0: this.data.scopeName = '附近3km'
            this.data.scopeType = 3
            break;
          case 1: this.data.scopeName = '附近5km'
            this.data.scopeType = 5
            break;
          case 2: this.data.scopeName = '附近10km'
            this.data.scopeType = 10
            break;
          case 3: this.data.scopeName = '同城'
            this.data.scopeType = 0
            break;
          case 4: this.data.scopeName = '不限'
            this.data.scopeType = -1
            break;
        }
        this.setData({
          scopeName: this.data.scopeName,
          scopeType: this.data.scopeType
        })
      }
    })
  },
  // 分享
  formSubmit(e) {
    let gData = getApp().globalData
    let token = gData.nowToken
    let unionId = gData.unionId
    let param = {
      formId: e.detail.formId
    }
    tool.request(apiUrl.formId.formId, token, param, unionId).then(data => {
      console.log('123', data)
    })
  },
  // 发送红包
  submitSend(){
    // 根据红包类型,判断总金额算法
    if (this.data.getFromData.moneyCate == 1) {
      var totalAmount = this.data.getFromData.input_1 * 100
    } else {
      var totalAmount = this.data.getFromData.input_1 * this.data.getFromData.input_2 * 100
    }
    // 查询小金库金额和应支付金额对比,计算小金库余额是否可以支付
    tool.request(apiUrl.userCenter.personCenter, this.data.token,{},this.data.unionId).then(data => {
      // 如果余额大于需要支付的金额
      if (data.remainAmount >= totalAmount) {
        this.setData({
          ableUseRepository: true
        })
      }
      else {
        this.setData({
          ableUseRepository: false
        })
      }
    })
    this.setData({
      showPaySure: true,
      showSendWay: false
    })
    this.setData({
      showPaySure: true
    })
  },
  // 支付
  pay(e){
    let type = e.currentTarget.dataset.type
    let data = {
      payType: type,
      gData: getApp().globalData,
      totalCount: Number(this.data.getFromData.input_2),//总数量
      pos : this.data.pos,//经纬度
      getFromData: this.data.getFromData,//模板背景图
      scopeType: this.data.scopeType,//搜索范围
      userInfo: this.data.userInfo,//个人信息
      ableShare: false,//是否能分享
      reward:0
    }
    distribute(this,data)
  },
  // 取消支付
  cancelPay(){
    this.setData({
      showPaySure: false
    })
  },
  onLoad: function (options) {
    let data = decodeURIComponent(options.data)
    data = JSON.parse(data)
    console.log(data,'我的数据......')
    this.setData({
      getFromData: data,
      token: getApp().globalData.nowToken,
      unionId: getApp().globalData.unionId
    })
    // 是从制作相同红包过来
    if (data.templateData.greeting){
      this.setData({
        blessing: data.templateData.greeting
      })
    }
    // 获取本地经纬度
    tool.getLocation().then((data) => {
      let tempPos = [data.longitude,data.latitude]
      this.setData({
          pos: tempPos
      })
    })
  }
})