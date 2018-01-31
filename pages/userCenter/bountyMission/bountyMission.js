// pages/userCenter/bountyMission/bountyMission.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ableGet: false,
    maxLength: 5,
  },
  // 输入的金额
  nowInput(e) {
    console.log(e)
    if (e.detail.value.length >= this.data.maxLength) {
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

  },

  clooseClick:function (e){
    console.log(e)
  },
})