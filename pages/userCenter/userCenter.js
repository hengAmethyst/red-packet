// pages/userCenter/userCenter.js

import apiUrl from '../../api-url.js'
import * as tool from '../../tool.js' 


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArr: [
      // {
      //   title: "天天领红包",//标题
      //   subtitle: "完成任务兑换赏金",
      //   isShowRedDot: true,//是否显示红点
      // },
      {
        title: "我的小金库",//标题
        description: "",//内容
      },
      {
        title: "帮助",//标题
      },
      // {
      //   title: "关注公众号获取红包信息",//标题
      // },
      {
        title: "更多新乐汇小程序",//标题
      },
    ],
    remainAmount: 0,//我的小金库  单位为分
    logo: "",
    name: "--",
    isRegist:true,//是否注册过云平台
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    getApp().onReady(err => {
      //登录成功回调
      let userInfo = getApp().globalData.userInfo;
      let logo = userInfo.avatarUrl;
      let name = userInfo.nickName;

      this.setData({
        logo: logo,
        name: name,
      });

      this.getUserSettingHttpRequest();
    });

    
  },

  onShow:function (){
    this.getUserSettingHttpRequest();
  },

  

  getUserSettingHttpRequest:function (){

    let param = {}
    tool.request(apiUrl.userCenter.personCenter, getApp().globalData.nowToken, param, getApp().globalData.unionId).then(data => {
      console.log('sss', data.remainAmount)//小金库   后台返回的金额单位为分

      let dataArr = this.data.dataArr
      dataArr[0].description = "¥" + data.remainAmount/100

      this.setData({
        remainAmount: data.remainAmount,
        dataArr: dataArr
      })
    })
  },

  //设置选项响应事件
  userCenterCellClick: function (e) {
    let title = e.detail.title;

    if (title == "我的小金库") {
      wx.navigateTo({
        url: '/pages/repository/repository?remainAmount=' + this.data.remainAmount
      })
    } else if (title == "天天领红包") {
      wx.navigateTo({
        url: 'bountyMission/bountyMission'
      })
    } else if (title == "帮助") {

    } else if (title == "关注公众号获取红包信息") {

    }
  },

  //绑定新乐汇账号
  bindBtnClick:function(e){
      console.log(e)
      wx.navigateTo({
        url: '/pages/register/register'
      })
  },

  //提现申请提交后 账户余额
  remainAmountChangeUserCenter: function (remainAmount) {

    let dataArr = this.data.dataArr
    dataArr[0].description = "¥" + remainAmount / 100

    this.setData({
      remainAmount: remainAmount,
      dataArr: dataArr
    })

  }
})

