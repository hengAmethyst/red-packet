import * as Tool from '../../tool';
import ApiUrl from '../../api-url';

let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        receive: false,
        sent: false,
        // 当前红包的Id
        id: null,
        spreadId: null,
        pUId: null,
        itemStyle: {},
        userList: [],
        // 该红包能否被分享
        canShare: false,
        // 是否领取过
        hasOpened: true,
        // 抢红包相关
        snatchVisible: false,
        snatchInfo: {},
        dialogAnimation: {},
        snatchAnimation: {},
        // 背景音乐
        isPlayingMusic: false,
        // 显示actionSheet
        showShare: false,
        // 是否为赏金红包
        hasReward: false,
        // 是否已分享
        hasShare: false,
        // 分享图开关
        sharePicSwitch: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 是否开启分享图

        wx.showLoading({ mask: true, title: '加载中...' });
        console.log('红包Id', options.id);
        if (options.scene) {
            let scene = decodeURIComponent(options.scene);
            this.setData({
                spreadId: scene,
                receive: true,
                sharePicSwitch: app.globalData.sharePicSwitch === 1 ? true : false
            })
        } else {
            let type = options.type ? options.type : '';
            if (type === 'receive') {
                this.setData({
                    id: options.id,
                    receive: true,
                    pUId: options.pUId ? options.pUId : app.globalData.unionId,
                    sharePicSwitch: app.globalData.sharePicSwitch === 1 ? true : false
                })
            } else {
                this.setData({
                    id: options.id,
                    sent: true,
                    //从我发送的红包进入时，更新pUId
                    pUId: app.globalData.unionId,
                    sharePicSwitch: app.globalData.sharePicSwitch === 1 ? true : false
                })
            }
        }
        getApp().onReady(err => {
            if (err) {
                console.log('登录好像出了些问题，不去拉数据了', err);
                return;
            }
            if (getApp().globalData.disabled) {
                Tool.disabledCallBack();
                return;
            }
            this.validateHB()
                .then(data => {
                    if (data === 0) {
                        if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId
                            === this.data.id) {
                            this.setData({
                                isPlayingMusic: true
                            })
                        }
                        this.setMusicMonitor();

                        this.fetchData()
                            .then(() => {
                                wx.hideLoading();
                                // 自动播放背景音乐
                                this.onMusicTap();

                                wx.setNavigationBarTitle({
                                    title: this.data.itemStyle.name + '的红包'
                                })
                                if (!this.data.canShare) {
                                    wx.hideShareMenu();
                                }
                                if (!this.data.hasOpened && this.data.receive) {
                                    let shareSign = 1;
                                    if (options.shareSign) {
                                        // 如果首页抢红包过来 shareSign = 0
                                        shareSign = Number(options.shareSign);
                                    }
                                    let distance = options.distance; // 首页抢红包会传过来
                                    this.genSpreadDetail().then(() => {
                                        this.openHb(shareSign, distance);
                                    })
                                }
                            })
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            title: '违规红包',
                            content: '该红包页面涉嫌违规/作弊/其他原因被封禁，给您带来不便敬请谅解',
                            confirmText: '回首页',
                            confirmColor: '#ee4126',
                            showCancel: false,
                            success: (res) => {
                                if (res.confirm) {
                                    wx.switchTab({
                                        url: '/pages/findHongbao/findHongbao',
                                    })
                                }
                            }
                        })
                    }
                })
        });
    },
    // 查询红包是否违规
    validateHB() {
        let token = app.globalData.nowToken;
        let unionId = app.globalData.unionId;
        let param = { redbagId: this.data.id ? this.data.id : 0, spreadId: this.data.spreadId ? this.data.spreadId : 0 }
        return Tool.request(ApiUrl.user.validate, token, param, unionId).then(res => {
            return 0;
        }, err => {
            return 1;
        })
    },
    // 记录相关层级
    genSpreadDetail() {
        let param = {
            redbagId: this.data.id,
            pUnionId: this.data.pUId
        };
        let token = app.globalData.nowToken;
        let unionId = app.globalData.unionId;
        return Tool.request(ApiUrl.redbag.genSpreadDetail, token, param, unionId).then(res => {
            console.log(res)
        }, err => {
            console.log(err)
        })
    },
    // 获取数据
    fetchData() {
        let param = {
            redbagId: this.data.id ? this.data.id : '',
            spreadId: this.data.spreadId ? this.data.spreadId : ''
        };
        let token = getApp().globalData.nowToken;
        let unionId = getApp().globalData.unionId;
        return Tool.request(ApiUrl.myhb.detail, token, param, unionId).then(res => {
            res.result.forEach(it => {
                it.amount = Tool.formatMoeny(it.amount);
                it.reward = it.reward > 0 ? Tool.formatMoeny(it.reward) : 0;
            })

            this.setData({
                pUId: !this.data.pUId ? res.puionId : this.data.pUId,
                id: !this.data.id ? res.id : this.data.id,
                itemStyle: res.cardRedBagStyle,
                userList: res.result,
                canShare: res.share,
                hasReward: res.reward,
                hasOpened: res.myOpened
            })
        }, err => {
            console.log(err)
        })
    },
    // 设置背景音乐
    setMusicMonitor() {
        //点击播放图标和总控开关都会触发这个函数
        var that = this;
        wx.onBackgroundAudioPlay(function (event) {
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            if (currentPage.data.id === that.data.id) {
                // 打开多个post-detail页面后，每个页面不会关闭，只会隐藏。通过页面栈拿到到
                // 当前页面的postid，只处理当前页面的音乐播放。
                if (app.globalData.g_currentMusicPostId == that.data.id) {
                    // 播放当前页面音乐才改变图标
                    that.setData({
                        isPlayingMusic: true
                    })
                }
                // if(app.globalData.g_currentMusicPostId == that.data.currentPostId )
                // app.globalData.g_currentMusicPostId = that.data.currentPostId;
            }
            app.globalData.g_isPlayingMusic = true;

        });
        wx.onBackgroundAudioPause(function () {
            var pages = getCurrentPages();
            var currentPage = pages[pages.length - 1];
            if (currentPage.data.id === that.data.id) {
                if (app.globalData.g_currentMusicPostId == that.data.id) {
                    that.setData({
                        isPlayingMusic: false
                    })
                }
            }
            app.globalData.g_isPlayingMusic = false;
            // app.globalData.g_currentMusicPostId = null;
        });
        wx.onBackgroundAudioStop(function () {
            that.setData({
                isPlayingMusic: false
            })
            app.globalData.g_isPlayingMusic = false;
            // app.globalData.g_currentMusicPostId = null;
        });
    },
    // 点击播放音乐
    onMusicTap(event) {
        var currentId = this.data.id;
        // var postData = postsData.postList[currentPostId];
        var isPlayingMusic = this.data.isPlayingMusic;
        if (isPlayingMusic) {
            wx.pauseBackgroundAudio();
            this.setData({
                isPlayingMusic: false
            })
            // app.globalData.g_currentMusicPostId = null;
            app.globalData.g_isPlayingMusic = false;
        }
        else {
            wx.playBackgroundAudio({
                // dataUrl: 'http://fs.w.kugou.com/201802031317/28d2bf2895731b6fa20455780c4e378b/G024/M01/1F/03/uIYBAFWdVuKAB_DWADQ4KUXFMx0315.mp3',
                dataUrl: this.data.itemStyle.bgmUrl
            })
            this.setData({
                isPlayingMusic: true
            })
            app.globalData.g_currentMusicPostId = this.data.id;
            app.globalData.g_isPlayingMusic = true;
        }
    },
    // 领红包
    openHb(shareSign, distance) {
        let redbagId = this.data.id ? this.data.id : 0;
        let spreadId = this.data.spreadId ? this.data.spreadId : 0;
        console.log('抢红包 id:', redbagId, '抢红包spreadId:', spreadId);

        // Tool.wx.showLoading();
        let snatch = (options) => {
            let token = getApp().globalData.nowToken;
            let unionId = getApp().globalData.unionId;

            let param = {
                redbagId,
                spreadId,
                unionId,
                pUnionId: this.data.pUId,
                ...options
            };
            return Tool.request(ApiUrl.redbag.snatch, token, param, unionId)
                .then(data => {
                    // Tool.wx.hideLoading();

                    let snatchInfo = {
                        status: data.status,
                        redbagId,
                        // redbagDetailId: data.detail.redbagDetailId,
                        amount: Tool.formatMoeny(data.detail.receiveAmount, -1),
                        remaining: data.detail.unOpenCount,
                        title: this.data.itemStyle.name + '的分享红包'
                    };
                    if (data.status === 1) {
                        snatchInfo.message = '您已经领过了，不要贪心喔!';
                    } else if (data.status === 2) {
                        snatchInfo.message = '活动红包\n已经派发完啦!';
                    } else if (data.status === 3) {
                        snatchInfo.message = '不能领取自己的红包!';
                    } else if (data.status === 4) {
                        snatchInfo.message = '该红包已过期!';
                    } else if (data.status === 5) {
                        snatchInfo.message = '该会员（商户）的红包每人限抢一份!';
                    } else if (data.status === 6) {
                        snatchInfo.message = '红包已经不在了!';
                    }
                    let animation = wx.createAnimation({
                        duration: 400,
                        timingFunction: 'ease'
                    });
                    animation.scale(0.2, 0.2).step();
                    let updateData = {
                        snatchVisible: true,
                        snatchAnimation: animation.export(),
                        snatchInfo
                    };
                    this.setData(updateData, () => {
                        animation.scale(1, 1).step();
                        this.setData({
                            snatchAnimation: animation.export()
                        });
                    });

                    if (data.status === 0) {
                        let userInfo = getApp().globalData.userInfo;
                        let param = {
                            redbagId,
                            pUnionId: this.data.pUId,
                            photo: userInfo.avatarUrl,
                            name: userInfo.nickName,
                            // leaveWord: '',
                            amount: data.detail.receiveAmount
                        };
                        Tool.request(ApiUrl.redbag.leaveWordAfterReceiveRedbag, token, param, unionId);
                    }
                }, err => {
                    // Tool.wx.hideLoading();

                    let message = '';
                    if (err.code > 0) {
                        message = err.message;
                    } else {
                        message = '发生错误了'
                    }
                    Tool.wx.showToast({
                        title: message,
                        icon: 'none'
                    });
                });
        };

        if (shareSign == 0) {
            Tool.wx.getLocation({ type: 'gcj02' })
                .then(res => res, err => null)
                .then(res => {
                    let pos;
                    if (res) {
                        pos = [res.longitude, res.latitude];
                    }
                    snatch({ shareSign, pos, distance });
                });
        } else {
            snatch({ shareSign });
        }
    },
    // 关闭领红包弹框
    handleSnatchClose() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        });
        animation.scale(0.2, 0.2).step();
        this.setData({ snatchAnimation: animation.export() }, () => {
            setTimeout(() => this.setData({ snatchVisible: false }));
            this.fetchData();
        });
    },
    // 点击更多按钮
    handleMore() {
        wx.showActionSheet({
            itemList: ['回到首页', '制作相同的红包', '投诉红包'],
            success: (res) => {
                console.log(res.tapIndex)
                if (res.tapIndex === 0) {
                    wx.switchTab({
                        url: '/pages/findHongbao/findHongbao',
                    })
                } else if (res.tapIndex === 1) {
                    let data = JSON.stringify({
                        templateUrl: this.data.itemStyle.templateUrl,
                        greeting: this.data.itemStyle.greeting,
                        type: 1
                    })
                    let info = encodeURIComponent(data)
                    console.log('制作相同的红包的参数', data);
                    wx.navigateTo({
                        url: `/pages/hongbao/faHongBao/faHongBao?info=${info}`,
                    })
                } else if (res.tapIndex === 2) {
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
        let data = JSON.stringify({
            templateUrl: this.data.itemStyle.templateUrl,
            greeting: this.data.itemStyle.greeting,
            type: 1
        })
        console.log(data);
        let info = encodeURIComponent(data)
        wx.navigateTo({
            url: `/pages/hongbao/faHongBao/faHongBao?info=${info}`,
        })
    },
    // 查看更多的红包
    findMoreHb() {
        wx.switchTab({
            url: '/pages/findHongbao/findHongbao',
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            // console.log(res.target)
            this.setData({
                showShare: false,
                hasShare: true
            })
        }
        return {
            title: '快来抢红包',
            path: `/pages/personHongbaoDetail/personHongbaoDetail?type=receive&id=${this.data.id}&pUId=${app.globalData.unionId}`,
            imageUrl: '/img/share_image.jpg',
            success: (res) => {
            },
            fail: (res) => {
                // 转发失败
            }
        }
    },
    /**
     * 显示actionSheet
     */
    showActionSheet() {
        this.setData({
            showShare: true
        })
    },
    /**
     * 关闭actionSheet
      */
    toCancel() {
        this.setData({
            showShare: false
        })
    },
    /**
    * 生成分享图
     */
    toQrCode() {
        // let fileUrl = `${ApiUrl.redbag.qrCode}?redbagId=${this.data.id}&pUnionId=${this.data.pUId}&unionId=${app.globalData.unionId}&num=${Math.random()}`;
        wx.previewImage({
            urls: [`${ApiUrl.redbag.qrCode}?redbagId=${this.data.id}&pUnionId=${this.data.pUId}&unionId=${app.globalData.unionId}&num=${Math.random()}`],
            success: () => {
                this.setData({
                    hasShare: true,
                    showShare: false
                })
            }
        });
    },
    /**
     * 卸载页面
     */
    onUnload() {
        // 卸载页面时关闭音乐播放
        wx.stopBackgroundAudio();
        app.globalData.g_isPlayingMusic = false;
        this.setData({
            isPlayingMusic: false
        })
    }
})