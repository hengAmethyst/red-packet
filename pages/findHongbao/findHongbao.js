const socket = require('../../socket');
import * as Tool from '../../tool';
import ApiUrl from '../../api-url';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mapVisible: false,
        rankingListVisible: false,

        advise: {
            receivedCount: '-',
            distributedCount: '-',
            myFortuneRank: '-'
        },
        hbList: [],
        topThree: {
            first: {},
            second: {},
            third: {}
        },
        rankType: 1,
        rankDate: '',
        rankingList: [],

        dialogAnimation: {},

        // 中心坐标
        coi: {},
        circles: [],
        markers: [],
        includePoints: [],
        me: null,

        popoverVisible: false,
        popover: {},
        popoverTs: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.showLoading({ mask: true, title: '加载中...' });
        socket.on('message', msg => {
            if (msg.msgType > 0) {
                if (this.data.mapVisible) {
                    this.fetchHbList()
                        .then(() => {
                            this.setData({
                                markers: this.converToMarker(this.data.hbList)
                            });
                        });
                }
            }
        });
        getApp().onLocationChange(res => {
            this.checkLocationChange(res);
        });
        getApp().onReady(err => {
            if (err) {
                wx.hideLoading();
                console.log('登录好像出了些问题，不去拉数据了', err);
                return;
            }
            if (getApp().globalData.disabled) {
                wx.hideLoading();
                Tool.disabledCallBack();
                return;
            }

            this.fetchHbList()
                .then(() => {
                    wx.hideLoading();
                }, err => {
                    wx.hideLoading();
                    this.setData({
                        advise: {
                            receivedCount: '-',
                            distributedCount: '-',
                            myFortuneRank: '-'
                        },
                        hbList: []
                    });

                    if (err.code === -100) {
                        // 取消了获取位置的授权
                        return;
                    }

                    if (err.code > 0) {
                        wx.showToast({ title: err.message, icon: 'none' });
                    }
                })
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        if (this.data.mapVisible) {
            wx.stopPullDownRefresh();
            return;
        }
        this.fetchHbList()
            .then(() => {
                wx.stopPullDownRefresh();
            }, err => {
                wx.stopPullDownRefresh();
                this.setData({
                    advise: {
                        receivedCount: '-',
                        distributedCount: '-',
                        myFortuneRank: '-'
                    },
                    hbList: []
                });

                if (err.code === -100) {
                    // 取消了获取位置的授权
                    return;
                }

                if (err.code > 0) {
                    wx.showToast({ title: err.message, icon: 'none' });
                }
            });
    },

    fetchHbList() {
        let token = getApp().globalData.nowToken;
        let unionId = getApp().globalData.unionId;

        let fetchHbListPromise = Tool.getLocation()
            .then(data => {
                console.log('getLocation', data);
                this.data.coi = {
                    longitude: data.longitude,
                    latitude: data.latitude,
                };
                let param = {
                    longitude: data.longitude,
                    latitude: data.latitude,
                };
                return Tool.request(ApiUrl.redbag.search, token, param, unionId)
            });
        let fetchAdvertisePromise = Tool.request(ApiUrl.redbag.advertise, token, {}, unionId);

        return Promise.all([fetchHbListPromise, fetchAdvertisePromise])
            .then(data => {
                let hbListData = data[0];

                let updateData = {
                    advise: data[1],
                    hbList: []
                };


                if (hbListData) {
                    if (hbListData.redbagList) {
                        let admCodePrefix = (hbListData.admCode || '').substring(0, 4);
                        updateData.hbList = hbListData.redbagList.map(it => {
                            if (it.redbagType === 1) {
                                it.redbagType = '贺卡红包';
                            } else {
                                it.redbagType = '红包';
                            }

                            it.redbagName = it.cardRedBagStyle.name;

                            if (it.redbagCategory === 1) {
                                it.redbagCategory = '个人红包';
                                it.redbagLongName = it.cardRedBagStyle.name + '的' + it.redbagType;
                            } else if (it.redbagCategory === 2) {
                                it.redbagCategory = '店铺红包';
                                it.redbagLongName = it.companyName + '的' + it.redbagLongName;
                            }

                            it.distanceStr = Tool.formatDistance(it.distance, -1);

                            let day = Math.floor(it.expireLeftHours / 24);
                            let hour = Math.floor(it.expireLeftHours % 24);
                            if (day > 0) {
                                it.expireTime = day + '天';
                            }
                            if (hour > 0) {
                                it.expireTime += hour + '小时';
                            }
                            it.expireTime += '后到期';

                            it.inScope = true;
                            if (it.scope === 0) {
                                it.inScope = it.admCode && it.admCode.indexOf(admCodePrefix) === 0;
                            } else if (it.scope > 0) {
                                it.inScope = it.scope * 1000 > it.distance;
                            }
                            return it;
                        });
                    }
                }


                if (this.data.mapVisible && (this.data.circles.length || this.data.popoverVisible)) {
                    let hb = updateData.hbList.find(it => it.redbagId == this.data.popover.redbagId);
                    if (!hb) {
                        updateData.circles = [];
                        updateData.popoverVisible = false;
                    }
                }

                return new Promise(resolve => this.setData(updateData, resolve));
            });
    },

    checkLocationChange(res) {
        let msg = {
            pos: [res.longitude + '', res.latitude + ''],
            unionId: getApp().globalData.unionId,
            appId: 7
        };
        socket.send(msg, false);
        this.data.me = {
            longitude: res.longitude,
            latitude: res.latitude
        };
    },

    setLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                this.checkLocationChange(res);

                this.setData({
                    coi: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    }
                });
            },
            fail: (err) => {
                console.log('getLocation', err);
            }
        })
    },

    converToMarker(list) {
        return list.map(it => {
            return {
                id: it.redbagId,
                iconPath: it.receivedByMe == 1 ? '/img/empty_hb.png' : '/img/icon_bh_small.png',
                width: 27,
                height: 33,
                latitude: it.pos[1],
                longitude: it.pos[0],
                radius: (it.scope > 0 ? it.scope : 0) * 1000,
            };
        });
    },

    handleToggleMap() {
        console.log('switch map', this.data.mapVisible);
        let mapVisible = !this.data.mapVisible;
        let updateData = {
            mapVisible,
        };

        if (mapVisible) {
            updateData.popoverVisible = false;
            updateData.markers = this.converToMarker(this.data.hbList);
            updateData.includePoints = [
                ...updateData.markers
            ];
            updateData.circles = [];
            if (this.data.me) {
                updateData.includePoints.push({
                    latitude: this.data.me.latitude,
                    longitude: this.data.me.longitude
                })
            }
            this.setLocation();
            socket.wakeup();
        }

        this.setData(updateData);
    },

    handleMapTap(e) {
        console.log('handleMapTap', e);
        if (this.data.popoverVisible) {
            this.setData({ popoverVisible: false });
        }
    },
    handleMapRegionChange(e) {
        console.log('handleMapRegionChange', e);
        if (e.type == 'begin') {
            if (this.data.popoverVisible) {
                if (e.timeStamp - this.data.popoverTs > 500) {
                    this.setData({ popoverVisible: false });
                }
            }
        }
    },
    handleMapMarkerTap(e) {
        console.log('handleMarkerTap', e);
        this.data.popoverTs = e.timeStamp;
        let hb = this.data.hbList.find(it => it.redbagId === e.markerId);
        if (!hb) {
            return;
        }

        hb.isSentByMe = hb.unionId == getApp().globalData.unionId;

        let updateData = {
            popover: hb,
            coi: {
                latitude: hb.pos[1],
                longitude: hb.pos[0]
            },
            circles: []
        };

        if (hb.scope > 0) {
            updateData.circles.push({
                latitude: hb.pos[1],
                longitude: hb.pos[0],
                color: '#ff000066',
                fillColor: '#ff000011',
                radius: hb.scope * 1000
            });
        }

        this.setData(updateData);
        setTimeout(() => {
            this.setData({ popoverVisible: true });
        }, 100);
    },

    handleHbTap(e) {
        let redbagId = e.currentTarget.dataset.id;

        console.log('抢红包 id:', redbagId);

        let hb = this.data.hbList.find(it => it.redbagId === redbagId);
        if (!hb) {
            return;
        }

        let app = getApp();

        wx.navigateTo({
            url: '/pages/personHongbaoDetail/personHongbaoDetail?type=receive&shareSign=0&distance=' + hb.distance + '&id=' + redbagId,
            success: () => {
            }
        });
    },

    handleShowRankingList(e) {
        let rankType = 1;
        let date = new Date();
        let rankDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

        if (e.currentTarget.dataset.type == 'new_money') {
            rankType = 1;
        } else {
            rankType = 2;
        }

        wx.showLoading({ mask: true });
        let token = getApp().globalData.nowToken;
        let unionId = getApp().globalData.unionId;

        let param = {
            rankType,
            date: rankDate
        };

        Tool.request(ApiUrl.redbag.rank, token, param, unionId)
            .then(data => {
                wx.hideLoading();

                let animation = wx.createAnimation({
                    duration: 400,
                    timingFunction: 'ease',
                });
                animation.top(1000).step();

                let updateData = {
                    rankingListVisible: true,
                    dialogAnimation: animation.export(),
                    rankType,
                    rankDate,
                    topThree: {
                        first: {
                            nickName: '--',
                            value: '--'
                        },
                        second: {
                            nickName: '--',
                            value: '--'
                        },
                        third: {
                            nickName: '--',
                            value: '--'
                        }
                    },
                    rankingList: []
                };

                if (data) {
                    if (data.rankDate) {
                        updateData.rankDate = data.rankDate;
                    }
                    let list = rankType === 1 ? data.distributedRank : data.receivedRank;
                    if (list && list.length) {
                        for (let i = 0, l = list.length; i < l; i++) {
                            let item = list[i];

                            if (rankType === 1) {
                                item.value = '￥' + Tool.formatMoeny(item.value, -1);
                            }

                            if (i > 2) {
                                updateData.rankingList.push(item);
                            } else if (i == 0) {
                                updateData.topThree.first = item;
                            } else if (i == 1) {
                                updateData.topThree.second = item;
                            } else if (i == 2) {
                                updateData.topThree.third = item;
                            }
                        }
                    }
                }


                this.setData(updateData, () => {
                    animation.top(50).step();
                    this.setData({
                        dialogAnimation: animation.export()
                    })
                });
            }, err => {
                wx.hideLoading();
                wx.showToast({ title: err.message, icon: 'none' });
            })
    },
    handleCloseDialog() {
        let animation = wx.createAnimation({
            duration: 400,
            timingFunction: 'ease',
        });
        animation.top(1000).step();
        this.setData({
            dialogAnimation: animation.export()
        }, () => {
            setTimeout(() => {
                this.setData({ rankingListVisible: false });
            }, 300);
        })
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