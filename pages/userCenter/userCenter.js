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
                title: "意见建议",//标题
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
        remainAmountYuan: 0,
        logo: "",
        name: "--",
        isRegist: true,//是否注册过云平台
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

    onShow: function () {
        this.getUserSettingHttpRequest();
        getApp().onReady(err => {
            if (err) {
                wx.hideLoading();
                console.log('登录好像出了些问题，不去拉数据了', err);
                return;
            }
            if (getApp().globalData.disabled) {
                tool.disabledCallBack();
            }
        })
    },


    getUserSettingHttpRequest: function () {

        let param = {}
        tool.request(apiUrl.userCenter.personCenter, getApp().globalData.nowToken, param, getApp().globalData.unionId).then(data => {
            console.log('小金库余额（单位为分）:', data.remainAmount)//小金库   后台返回的金额单位为分


            let remainAmountYuan = data.remainAmount / 100;
            remainAmountYuan = remainAmountYuan.toFixed(2)

            let dataArr = this.data.dataArr
            let remainAmount = data.remainAmount
            dataArr[0].description = "¥" + remainAmountYuan



            this.setData({
                remainAmount: data.remainAmount,
                dataArr: dataArr,
                remainAmountYuan: remainAmountYuan
            })
        })
    },

    //设置选项响应事件
    userCenterCellClick: function (e) {
        let app = getApp();

        let title = e.detail.title;

        if (title == "我的小金库") {
            wx.navigateTo({
                url: '/pages/repository/repository?remainAmount=' + this.data.remainAmount,
                success: () => {
                }
            })
        } else if (title == "天天领红包") {
            wx.navigateTo({
                url: 'bountyMission/bountyMission',
                success: () => {
                }
            })
        } else if (title == "帮助") {
            wx.navigateTo({
                url: 'webView/webView',
                success: () => {
                }
            })

        } else if (title == "更多新乐汇小程序") {
            wx.navigateTo({
                url: 'moreSmallApplet/moreSmallApplet',
                success: () => {
                }
            })
        } else if (title == "意见建议") {
            wx.navigateTo({
                url: 'suggestions/suggestions',
                success: () => {
                }
            })
        }
    },

    //绑定新乐汇账号
    bindBtnClick: function (e) {
        console.log(e)
        wx.navigateTo({
            url: '/pages/register/register'
        })
    },

    //提现申请提交后 账户余额
    remainAmountChangeUserCenter: function (remainAmount) {

        let remainAmountYuan = remainAmount / 100;
        remainAmountYuan = remainAmountYuan.toFixed(2)

        let dataArr = this.data.dataArr
        dataArr[0].description = "¥" + remainAmountYuan

        this.setData({
            remainAmount: remainAmount,
            dataArr: dataArr,
            remainAmountYuan: remainAmountYuan
        })

    },

    //拨打电话
    footerClick: function (e) {
        wx.makePhoneCall({
            phoneNumber: '4006858188' //仅为示例，并非真实的电话号码
        })
    },
})

