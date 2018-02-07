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
    inputMoney:0,//输入的提现金额
    handicapCost:0,//手续费
    datedAmount:0,//到账金额
  },
  // 输入的金额
  nowInput(e) {
    let value = e.detail.value

    //处理输入的提现金额  保留小数点后两位
    value = value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符  
    value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  
    value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
    if (value.indexOf(".") < 0 && value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      value = parseFloat(value);
    }
    

    if (value <= this.data.maxMoney && value >= 10 && value <=200) {
      this.setData({
        ableGet: true
      })
    }
    else {
      this.setData({
        ableGet: false
      })
    }

    if (value > this.data.maxMoney){
      value = this.data.maxMoney
    }

    //手续费
    let handicapCost = value * 0.06
    handicapCost = handicapCost.toFixed(2)

    //到账金额
    let datedAmount = value - handicapCost
    datedAmount = datedAmount.toFixed(2)
    

    this.setData({
      inputMoney:value,
      handicapCost: handicapCost,
      datedAmount: datedAmount,
    })

    return value;
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

      
      //提现成功后需要修改小金库显示的余额
      this.setData({
        maxMoney: this.data.maxMoney - totalAmount / 100//提现后的账户余额
      })


      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];  //上一个页面
      var userCenter = pages[pages.length - 3];  //上上一个页面
      prevPage.remainAmountChange(this.data.maxMoney * 100);//提现后的账户余额
      userCenter.remainAmountChangeUserCenter(this.data.maxMoney * 100);//提现后的账户余额


      wx.showModal({
        title: '提现成功',
        content: '提现可能会有延迟,请稍后在您的微信零钱中查看',
        confirmText: '确定',
        confirmColor: '#ee4126',
        showCancel: false,
        success: (res) => {
          wx.navigateBack({

          })
        }
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

