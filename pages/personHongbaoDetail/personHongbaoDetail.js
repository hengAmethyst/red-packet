import * as Tool from '../../tool';
import ApiUrl from '../../api-url';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        receive: false,
        sent: false,
        // 当前红包的Id
        id: '',
        itemStyle: {},
        userList: []
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('红包Id', options.id);
        let type = options.type ? options.type : '';
        if (type === 'receive') {
            // this.receive = true;
            this.setData({
                id: options.id,
                receive: true
            })
        } else {
            this.setData({
                id: options.id,
                sent: true
            })
        }
        this.fetchData();
    },
    // 获取数据
    fetchData() {
        let param = {
            redbagId: this.data.id
        };
        let token = getApp().globalData.nowToken;
        let unionId = getApp().globalData.unionId;
        return Tool.request(ApiUrl.myhb.detail, token, param, unionId).then(res => {
            res.result.forEach(it => {
                it.amount = Tool.formatMoeny(it.amount);
            })

            this.setData({
                itemStyle: res.cardRedBagStyle,
                userList: res.result
            })
        }, err => {
            console.log(err)
        })
    },
    // 点击更多按钮
    handleMore() {
        wx.showActionSheet({
            itemList: ['制作相同的红包', '投诉红包'],
            success: (res) => {
                console.log(res.tapIndex)
                if (res.tapIndex === 0) {
                    wx.navigateTo({
                        url: `/pages/hongbao/faHongBao/faHongBao?templateUrl=${this.data.itemStyle.templateUrl}&greeting=${this.data.itemStyle.greeting}`,
                    })
                } else if (res.tapIndex === 1) {
                    wx.navigateTo({
                        url: `/pages/userCenter/suggestions/suggestions?id=${this.data.id}`,
                    })
                }
            },
            fail: (res) => {
                console.log(res.errMsg)
            }
        })
    },
    // 再发一个
    handleAgain() {
        wx.navigateTo({
            url: `/pages/hongbao/faHongBao/faHongBao?templateUrl=${this.data.itemStyle.templateUrl}&greeting=${this.data.itemStyle.greeting}`,
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            // console.log(res.target)
        }
        return {
            title: '快来抢红包',
            path: `/pages/personHongbaoDetail/personHongbaoDetail?id=${this.data.id}`,
            success: function (res) {
                // 转发成功
                console.log('转发成功')
            },
            fail: function (res) {
                // 转发失败
            }
        }
    }
})