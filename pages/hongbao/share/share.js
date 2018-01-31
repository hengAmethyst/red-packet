// pages/hongbao/share/share.js
Page({
  data: {
    scopeData:[
      "附近3km",
      "附近5km",
      "附近10km",
      "同城",
      "不限"
    ]
  },
  // 地理位置范围选择
  chooseScope(){
    wx.showActionSheet({
      itemList: this.data.scopeData,
      success: function (res) {
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  onLoad: function (options) {
  
  }
})