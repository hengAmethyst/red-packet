import * as tool from '../../../../tool.js'
Page({
    data: {
        scopeName: '附近3km',
        scopeType: 3,
        address: '默认当前位置',//地理位置
        generalizeStatus: false
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
    // 上传数据到全局变量中
    uploadData() {
        getApp().globalData.hongbaoSet.advancedSet.scopeType = this.data.scopeType
        getApp().globalData.hongbaoSet.advancedSet.scopeName = this.data.scopeName
    },
    // 选择位置
    chooseLocation() {
        tool.chooseLocation().then((data) => {
            getApp().globalData.hongbaoSet.advancedSet.name = data.name
            this.setData({
                address: data.name
            })
            getApp().globalData.hongbaoSet.advancedSet.latitude = data.latitude
            getApp().globalData.hongbaoSet.advancedSet.longitude = data.longitude
            console.log(data.latitude, data.longitude)
        })
    },
    // 点击switch按钮
    clickSwitch(e){
      wx.showModal({
        title: '金额限制',
        content: '您的红包总金额不少于500元,才能打开推广红包',
        showCancel: false,
        confirmText:'知道了',
        confirmColor: '#ee4126',
        success: (res)=>{
          this.setData({
            generalizeStatus:false
          })
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      getApp().globalData.hongbaoSet.advancedSet.ableGeneralize = e.detail.value
    },
    //返回上页
    goback() {
        wx.navigateBack()
    },
    onShow: function () {
        // 如果已经选择过地址了,就使用上一次的地址
        if (getApp().globalData.hongbaoSet.advancedSet.name) {
            this.setData({
                address: getApp().globalData.hongbaoSet.advancedSet.name
            })
        }
        if (getApp().globalData.hongbaoSet.advancedSet.scopeName) {
          console.log(getApp().globalData.hongbaoSet.advancedSet.scopeName)
            this.setData({
                scopeName: getApp().globalData.hongbaoSet.advancedSet.scopeName
            })
        }
    }
    ,
    onLoad: function (options) {

    },
    onUnload: function () {
        this.uploadData()
    },
    onHide: function () {
        this.uploadData()
    }
})