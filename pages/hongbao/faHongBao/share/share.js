import apiUrl from '../../../../api-url.js'
import * as tool from '../../../../tool.js'
import distribute from '../distribute.js'
Page({
    data: {
        scopeName: '附近3km',
        scopeType: 3,
        address: '默认当前位置',
        userInfo: null,//个人信息组件数据
        getFromData:null,
        token:null,
        unionId:null,
        hongbaoId:null,//发送成功的红包Id
        showPaySure:false,//展示支付方式
        showShareBtn:false,
        reward: null,//赏金金额
        rewardAll:0,//赏金总金额
    },
    // 获得子组件的info
    getInfo(e) {
      let info = e.detail
      this.setData({
        userInfo: info
      })
    },
    // 发送红包
    submitSend() {
      // 根据红包类型,判断总金额算法
      if (this.data.getFromData.moneyCate == 1) {
        var totalAmount = this.data.getFromData.input_1 * 100
      } else {
        var totalAmount = this.data.getFromData.input_1 * this.data.getFromData.input_2 * 100
      }
      this.setData({
        totalAmount: totalAmount
      })
      // 查询小金库金额和应支付金额对比,计算小金库余额是否可以支付
      tool.request(apiUrl.userCenter.personCenter, this.data.token, {}, this.data.unionId).then(data => {
        // 如果余额大于需要支付的金额
        if (data.remainAmount >= totalAmount + this.data.rewardAll*100) {
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
        showPaySure: true
      })
    },
    // 支付
    pay(e) {
      let type = e.currentTarget.dataset.type
      let data = {
        payType: type,//支付方式
        gData: getApp().globalData,
        totalCount: Number(this.data.getFromData.input_2),//总数量
        pos: this.data.pos,//经纬度
        getFromData: this.data.getFromData,//模板背景图
        scopeType: this.data.scopeType,//搜索范围
        userInfo: this.data.userInfo,//个人信息
        ableShare: true,//是否能分享
        reward: this.data.reward*100//单个赏金
      }
      distribute(this, data)
    },
    // 取消支付
    cancelPay() {
      this.setData({
        showPaySure: false
      })
    },
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
    // 输入赏金金额
    rewardMoney(e){
      let money = e.detail.value
      if(money>100){
        wx.showToast({
          title: '赏金金额最大为100元',
          icon: 'none'
        })
        this.setData({
          reward:null,
          rewardAll:0
        })
      }
      else{
        let tempData = (this.data.getFromData.input_2 * money).toFixed(2)
        this.setData({
          rewardAll: tempData,
          reward: money
        })
      }
    },
    onLoad: function (options) {
      console.log(options)
      let data = decodeURIComponent(options.data)
      data = JSON.parse(data)
      console.log(data, '我的数据......')
      this.setData({
        getFromData: data,
        token: getApp().globalData.nowToken,
        unionId: getApp().globalData.unionId
      })
    },
    onShareAppMessage() {
      return {
        title: '快来拆红包吧',
        path: `/pages/personHongbaoDetail/personHongbaoDetail?type=receive&id=${this.data.hongbaoId}&pUId=${this.data.unionId}`,
        imageUrl: '/img/share_image.jpg',
        success: () => {
          wx.showToast({
            title: '发送成功'
          })
          // 让按钮消失
          this.setData({
            showShareBtn: false
          })
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/hongbao/hongbao'
            })
          }, 700)
        },
        fail: function () {
          // 转发失败
          console.log('转发失败')
        }
      }
    }
})