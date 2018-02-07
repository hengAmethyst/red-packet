import * as Tool from '../../tool';
import ApiUrl from '../../api-url';

Page({
    data: {
        tabIndex: 0,

        mapVisible: false,
        mapVisibleCopy: false,

        dialogVisible: false,

        pageSize: 5,

        receivedHbList: [],
        receiveCurrentPage: 1,
        receiveLoading: false,
        receiveLoadingComplete: false,
        isReceivedList: true,   // 用于判断receivedHbList数组是不是空数组，默认true，空的数组

        sentHbList: [],
        sentCurrentPage: 1,
        sentLoading: false,
        sentLoadingComplete: false,
        isSentList: true,   // 用于判断sentHbList数组是不是空数组，默认true，空的数组

        dialogAnimation: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({ mask: true, title: '加载中...' });
        this.setData({
            receiveCurrentPage: 1,   //第一次加载，设置1  
            receivedHbList: [],  //放置返回数据的数组,设为空  
            isReceivedList: true,  //第一次加载，设置true  
            receiveLoading: true,  //把"上拉加载"的变量设为true，显示  
            receiveLoadingComplete: false, //把“没有数据”设为false，隐藏  

            sentHbList: [],
            sentCurrentPage: 1,
            sentLoading: true,
            sentLoadingComplete: false,
            isSentList: true,
        })
        Promise.all([this.fetchList(4), this.fetchList(3)]).then(() => {
            wx.hideLoading();
        });
    },
    fetchList(type) {
        return Tool.getLocation()
            .then(data => {
                console.log('getLocation', data);
                let param = {
                    page: {
                        pageSize: this.data.pageSize,
                        currentPage: type === 4 ? this.data.receiveCurrentPage : this.data.sentCurrentPage,
                    },
                    distance: data.longitude + ',' + data.latitude,
                    tradeType: type
                }
                let token = getApp().globalData.nowToken;
                let unionId = getApp().globalData.unionId;
                return Tool.request(ApiUrl.myhb.tradeList, token, param, unionId).then(res => {
                    if (res.list && res.list.length > 0) {
                        res.list.forEach(it => {
                            it.myReciveMoney = Tool.formatMoeny(it.myReciveMoney);
                            // it.expireTime = Tool.formatTime(it.expireTime, 'YYYY-MM-DD');
                            it.distance = it.distance ? Tool.formatDistance(it.distance) : null;

                            let hours = (new Date(it.expireTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                            console.log('到期时间', hours);
                            // console.log(hours);
                            let day = Math.floor(hours / 24);
                            let hour = Math.floor(hours % 24);
                            if (day > 0) {
                                it.expireTime = day + '天';
                            }
                            if (hour > 0) {
                                it.expireTime += hour + '小时';
                            }
                            if (hours < 24) {
                                it.expireTime = Math.floor(hours) + '小时';
                            }
                            it.expireTime += '后到期';
                            if (day < 0 && hour < 0) {
                                it.expireTime = '已过期'
                            }
                        })
                        let list = [];
                        if (type === 4) {
                            this.data.isReceivedList ? list = res.list : list = this.data.receivedHbList.concat(res.list);
                            this.setData({
                                receivedHbList: list,
                                receiveLoading: true   //把"上拉加载"的变量设为true，显示  
                            });
                        } else if (type === 3) {
                            this.data.isSentList ? list = res.list : list = this.data.sentHbList.concat(res.list);
                            this.setData({
                                sentHbList: list,
                                sentLoading: true   //把"上拉加载"的变量设为false，显示  
                            });
                        }
                    } else {
                        if (type === 4) {
                            this.setData({
                                receiveLoadingComplete: true, //把“没有数据”设为true，显示  
                                receiveLoading: false  //把"上拉加载"的变量设为false，隐藏  
                            });
                        } else if (type === 3) {
                            this.setData({
                                sentLoadingComplete: true,
                                sentLoading: false
                            });
                        }
                    }
                }, err => {
                    console.log(err)
                })
            })
    },
    //滚动到底部触发事件  
    onReachBottom() {
        if (this.data.tabIndex === 0) {
            if (this.data.receiveLoading && !this.data.receiveLoadingComplete) {
                this.setData({
                    receiveCurrentPage: this.data.receiveCurrentPage + 1,
                    isReceivedList: false  //触发到上拉事件，把isFromSearch设为为false  
                });
                this.fetchList(4);
            }
        } else {
            if (this.data.sentLoading && !this.data.sentLoadingComplete) {
                this.setData({
                    sentCurrentPage: this.data.sentCurrentPage + 1,
                    isSentList: false  //触发到上拉事件，把isFromSearch设为为false  
                });
                this.fetchList(3);
            }
        }

    },
    // tab切换
    handleTabTap(ev) {
        console.log('tabtap', ev);
        let tabIndex = this.data.tabIndex;
        let tappedTabIndex = Number(ev.currentTarget.dataset.index);
        if (tabIndex == tappedTabIndex) {
            return;
        }

        let data = {
            tabIndex: tappedTabIndex
        };

        if (tabIndex === 0) {
            if (this.data.mapVisible) {
                data.mapVisibleCopy = true;
                data.mapVisible = false;
            } else {
                data.mapVisibleCopy = false;
            }
        } else {
            if (this.data.mapVisibleCopy) {
                data.mapVisible = true;
                this.setLocation();
            }
        }
        this.setData(data);
    },

    handleTapDetail(e) {
        let id = e.currentTarget.dataset.redid;
        let type = e.currentTarget.dataset.type;

        let app = getApp();
        wx.navigateTo({
            url: type === "receive" ? '/pages/personHongbaoDetail/personHongbaoDetail?type=receive&id=' + id : '/pages/personHongbaoDetail/personHongbaoDetail?type=sent&id=' + id,
            success: () => {
            }
        })
    },

    handleDialogCancel() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        });

        animation.scale(0.2, 0.2).step();
        this.setData({
            dialogAnimation: animation.export()
        }, () => {
            setTimeout(() => {
                this.setData({
                    dialogVisible: false,
                });
            }, 200);
        });
    },
    handleDialogConfirm() {
        this.setData({
            dialogVisible: false
        });
    },
    // 去发个红包
    handleTapSend() {
        wx.switchTab({
            url: '/pages/hongbao/hongbao',
        })
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.setData({
            receiveCurrentPage: 1,   //第一次加载，设置1  
            receivedHbList: [],  //放置返回数据的数组,设为空  
            isReceivedList: true,  //第一次加载，设置true  
            receiveLoading: true,  //把"上拉加载"的变量设为true，显示  
            receiveLoadingComplete: false, //把“没有数据”设为false，隐藏  

            sentHbList: [],
            sentCurrentPage: 1,
            sentLoading: true,
            sentLoadingComplete: false,
            isSentList: true,
        })
        Promise.all([this.fetchList(4), this.fetchList(3)]).then(() => {
            wx.stopPullDownRefresh();
        });

    },
    onShow() {
        getApp().onReady(err => {
            if (err) {
                wx.hideLoading();
                console.log('登录好像出了些问题，不去拉数据了', err);
                return;
            }
            if (getApp().globalData.disabled) {
                Tool.disabledCallBack();
            }
        })
    }
})