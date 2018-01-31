// pages/repository/getCash/getCash.js

import apiUrl from '../../../api-url.js'
import * as tool from '../../../tool.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ableGet: false,
    maxMoney: 0,
    isLoading:false,
  },
  // 输入的金额
  nowInput(e) {
    if (e.detail.value <= this.data.maxMoney && e.detail.value >= 10) {
      this.setData({
        ableGet: true
      })
    }
    else {
      this.setData({
        ableGet: false
      })
    }
  },

  onLoad: function (options) {
    new getApp().WeToast()
    let remainAmount = options.remainAmount != "undefined" ? options.remainAmount:0
    this.setData({
      maxMoney: remainAmount / 100
    })
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    this.getUserSettingHttpRequest(e.detail.value.totalAmount);
  },


  //提现
  getUserSettingHttpRequest: function (totalAmount) {

    if (this.data.isLoading){
      return;
    }

    this.data.isLoading = true;

    totalAmount = totalAmount * 100
    let param = {
      totalAmount: totalAmount
    }

    wx.showLoading({
      title: '提现中',
    })

    
    
    tool.request(apiUrl.userCenter.withdraw, getApp().globalData.nowToken, param, getApp().globalData.unionId).then(data => {
      this.data.isLoading = false;

      this.wetoast.toast({
        img: '',
        title: "提现成功",
        imgMode: 'scaleToFill'
      })
      
      //提现成功后需要修改小金库显示的余额
      this.setData({
        maxMoney: this.data.maxMoney - totalAmount / 100//提现后的账户余额
      })


      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];  //上一个页面
      var userCenter = pages[pages.length - 3];  //上上一个页面
      prevPage.remainAmountChange(this.data.maxMoney * 100);//提现后的账户余额
      userCenter.remainAmountChangeUserCenter(this.data.maxMoney * 100);//提现后的账户余额
      wx.navigateBack({

      })
    }, err => {
      this.data.isLoading = false;

      this.wetoast.toast({
        img: '',
        title: err.message,
        imgMode: 'scaleToFill'
      })

      wx.hideLoading()
    })
  },

})