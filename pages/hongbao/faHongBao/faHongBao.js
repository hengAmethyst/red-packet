import apiUrl from '../../../api-url.js'
import * as tool from '../../../tool.js'

let app = getApp();

Page({
    data: {
        nowType:1,//1附近红包，2分享红包
        showPaySure: false,//展示支付确认框
        showSendWay: false,//展示发红包的方式
        btn_status: false,//按钮激活
        input_1: '',//该页面的第一个输入框的值
        input_2: '',//该页面的第二个输入框的值
        disType: null,//距离类型
        latitude: null,//纬度
        longitude: null,//经度
        nowCate: '拼手气红包',//手气红包
        otherCate: '普通红包',//普通红包
        moneyCate: 1,//0为普通红包，1为手气红包
        fromTemplateData: null,//从模板页面传来的数据
        ableUseRepository: false,
        shareWay: false,//选择分享到朋友圈
        showShareBtn: false,//显示分享按钮
        hongbaoId: null,//红包的Id
        rules:2//1为均分,2为拼手气
    },
    // 选择模板
    chooseType(e){
      let type = e.currentTarget.dataset.type
      let tempType = null
      if(type==1){
        tempType = 1
      }
      else{
        tempType = 2
      }
      this.setData({
        nowType: tempType
      })
    },
    // 下一步跳转的位置
    nextStep(){
      let data = {
        type:this.data.nowType,//1附近红包，2分享红包
        moneyCate: this.data.moneyCate,//0普通红包，1拼手气红包
        input_1: this.data.input_1,
        input_2: this.data.input_2,
        templateData:this.data.fromTemplateData
      }
      let type = this.data.nowType
      let url = null
      data = JSON.stringify(data)
      data = encodeURIComponent(data)
      if(type==1){
        url = `/pages/hongbao/faHongBao/nearby/nearby?data=${data}`
      }
      else{
        url = `/pages/hongbao/faHongBao/share/share?data=${data}`
      }
      wx.navigateTo({
        url: url,
      })
    },
    // 修改红包方式
    changeCate() {
      if (this.data.moneyCate == 0) {
        this.setData({
            nowCate: '拼手气红包',
            otherCate: '普通红包',
            moneyCate: 1,
            input_1: '',
            input_2: '',
            rules: 2//拼手气
        })
        name = '拼手气红包'
      }
      else {
        this.setData({
            nowCate: '普通红包',
            otherCate: '拼手气红包',
            moneyCate: 0,
            input_1: '',
            input_2: '',
            rules: 1//均分
        })
      }
    },
    // input输入框
    inputSome(e) {
      /**
       * @type=0; 操作第一个输入框
       * @type=1; 操作第二个输入框
       */
      let minMoney = 0.1//单个红包最小值
      let type = e.currentTarget.dataset.type
      let value = e.detail.value
      switch (type) {
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
      if (this.data.input_1.length > 0 & this.data.input_2.length > 0) {
          // 普通红包.输入的金额大于0.01
        if (this.data.moneyCate == 0 & this.data.input_1 >= minMoney) {
            tem_btn_status = true
        }
          //拼手气红包.输入金额大于0.01
        if (this.data.moneyCate == 1 & this.data.input_1 / this.data.input_2 >= minMoney) {
            tem_btn_status = true
        }
        // 金额格式判断
        if (this.data.input_1.split('.').length > 1) {
          let tempData = this.data.input_1.split('.')[1]
          if (tempData.length > 2) {
            wx.showToast({
                image: '/img/warning.png',
                title: '金额格式有误',
            })
            tem_btn_status = false
          }
        }
        // 如果个数为0个红包提示
        if (this.data.input_2.length > 0 & this.data.input_2 == 0) {
          wx.showToast({
              image: '/img/warning.png',
              title: '个数不能为0',
          })
          tem_btn_status = false
        }
        if(this.data.moneyCate ==1){
          if (this.data.input_1 < 0.1) {
            wx.showToast({
              title: '总金额不能小于0.1元',
              icon: 'none'
            })
            tem_btn_status = false
          }
        }
      }
      this.setData({
        btn_status: tem_btn_status
      })
    },
    //核对红包金额,不能让单个红包的金额小于0.1元
    checkMoney(e) {
      let minMoney = 0.1//单个红包最小值
        // 两个输入框输入完成之后
        if (this.data.input_1.length > 0 & this.data.input_2.length > 0) {
            // 普通红包
            if (this.data.moneyCate == 0) {
                // 普通红包的金额小于0.1
              if (this.data.input_1 < minMoney) {
                  wx.showToast({
                      title: `单个红包金额不能小于${minMoney}元`,
                      icon: 'none'
                  })
                  this.setData({
                      btn_status: false
                  })
                }
            } else {
              // 拼手气金额小于0.1
              if (this.data.input_1 / this.data.input_2 < minMoney) {
                  wx.showToast({
                    title: `单个红包金额不能小于${minMoney}元`,
                    icon: 'none'
                  })
                  this.setData({
                      btn_status: false
                  })
              }
          }
      }
    },
    onLoad: function (options) {
      let data = decodeURIComponent(options.info)
      data = JSON.parse(data)
      this.setData({
        fromTemplateData: data
      })
    }
})
