// pages/userCenter/moreSmallApplet/moreSmallApplet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArr:[
      {
        title:"新乐汇汇客通",
        info: "快速打造智慧门店、社交+商业的\n一站式移动电商解决方案",
        appid:"wx39b8415acbd5616b",
        icon:"/img/icon_huiketong.jpg",
      },
      {
        title: "新乐汇微名片",
        info: "轻松创建、快捷分享、无限派发\n量身打造专属你的电子名片",
        appid:"wx3342c8ab21314a02",
        icon: "/img/icon_mingpian.jpg",
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  // 打开其他小程序
  cellClick:function(e){
    
    let appId = e.currentTarget.dataset.appid
    console.log(appId)

    wx.navigateToMiniProgram({
      appId: appId,
    })
  },

  //拨打电话
  footerClick:function(e){
    wx.makePhoneCall({
      phoneNumber: '4006858188' //仅为示例，并非真实的电话号码
    })
  },
})