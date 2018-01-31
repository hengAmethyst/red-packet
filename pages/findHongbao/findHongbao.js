const socket = require('../../socket');
import * as Tool from '../../tool';
import ApiUrl from '../../api-url';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapVisible: false,
    snatchVisible: false,

    hbList: [],
    snatchInfo: {},

    dialogAnimation: {},
    snatchAnimation: {},

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
    wx.showLoading({ mask: true });
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
        console.log('登录好像出了些问题，不去拉数据了', err);
        return;
      }

      this.fetchHbList()
        .then(() => {
          wx.hideLoading();
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

        if (err.code === -100) {
          return;
        }

        if (err.code > 0) {
          // TODO
        }
      });
  },

  fetchHbList() {
    return Tool.getLocation()
      .then(data => {
        console.log('getLocation', data);
        let token = getApp().globalData.nowToken;
        let unionId = getApp().globalData.unionId;
        this.data.coi = {
          longitude: data.longitude,
          latitude: data.latitude,
        };
        let param = {
          longitude: data.longitude,
          latitude: data.latitude,
        };
        return Tool.request(ApiUrl.redbag.search, token, param, unionId)
          .then(data => {
            let updateData = { hbList: [] };
            if (data) {
              if (data.redbagList) {
                updateData.hbList = data.redbagList.map(it => {
                  if (it.redbagType === 1) {
                    it.redbagType = '贺卡红包';
                  }
                  if (it.redbagCategory === 1) {
                    it.redbagCategory = '个人红包';
                    it.redbagName = it.redbagCategory;
                    it.redbagLongName = it.redbagType;
                    if (it.nickName) {
                      it.redbagName = it.nickName;
                      it.redbagLongName = it.nickName + '的' + it.redbagLongName;
                    }
                  } else if (it.redbagCategory === 2) {
                    it.redbagCategory = '店铺红包';
                    it.redbagName = it.redbagCategory;
                    it.redbagLongName = it.redbagType;
                    if (it.companyName) {
                      it.redbagName = it.companyName;
                      it.redbagLongName = it.companyName + '的' + it.redbagLongName;
                    }
                  }
                  it.distanceStr = (it.distance / 1000 || 0).toFixed(2);
                  let day = Math.floor(it.expireLeftHours / 24);
                  let hour = Math.floor(it.expireLeftHours % 24);
                  if (day > 0) {
                    it.expireTime = day + '天';
                  }
                  if (hour > 0) {
                    it.expireTime += hour + '小时';
                  }
                  it.expireTime += '后到期';
                  return it;
                });
              }
            }
            return new Promise(resolve => this.setData(updateData, resolve));
          });
      });
  },

  checkLocationChange(res) {
    let changed = false;
    if (!this.data.me) {
      changed = true;
    } else if (this.data.me.longitude != res.longitude || this.data.me.latitude != res.latitude) {
      changed = true;
    }
    if (changed) {
      let msg = {
        pos: [res.longitude + '', res.latitude + '']
      };
      socket.send(msg, false);
      this.data.me = {
        longitude: res.longitude,
        latitude: res.latitude
      };
    }
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
        iconPath: '/img/icon_bh_small.png',
        width: 18,
        height: 22,
        latitude: it.pos[1],
        longitude: it.pos[0],
        radius: (it.scope > 0 ? it.scope : 0) * 1000,
      };
    });
  },

  handleTogglehMap() {
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
    let hb = this.data.hbList.find(it => it.redbagId === redbagId);
    if (!hb) {
      return;
    }

    let snatch = () => {
      Tool.wx.showLoading();
      let token = getApp().globalData.nowToken;
      let unionId = getApp().globalData.unionId;

      let param = {
        redbagId,
        unionId,
        distance: hb.distance,
        pos: [this.data.coi.longitude, this.data.coi.latitude]
      };
      Tool.request(ApiUrl.redbag.snatch, token, param, unionId)
        .then(data => {
          Tool.wx.hideLoading();

          let snatchInfo = {
            status: data.status,
            redbagId,
            redbagDetailId: data.detail.redbagDetailId,
            amount: (data.detail.receiveAmount / 100).toFixed(2),
            remaining: data.detail.unOpenCount,
            title: hb.redbagLongName
          };
          if (data.status === 1) {
            snatchInfo.message = '您已经领过了，不要贪心喔!';
          } else if (data.status === 2) {
            snatchInfo.message = '活动红包\n已经派发完啦!';
          } else if (data.status === 3) {
            snatchInfo.message = '不能领取自己的红包!';
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

            if (this.data.mapVisible) {
              // 在地图界面时刷新下页面
              setTimeout(() => { this.setData({ snatchVisible: true }) }, 200);
            }
          });

          if (data.status === 0) {
            let userInfo = getApp().globalData.userInfo;
            let param = {
              redbagId,
              photo: userInfo.avatarUrl,
              name: userInfo.nickName,
              // leaveWord: '',
              amount: data.detail.receiveAmount
            };
            Tool.request(ApiUrl.redbag.leaveWordAfterReceiveRedbag, token, param, unionId);
          }
        }, err => {
          Tool.wx.hideLoading();

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

    if (this.data.popoverVisible) {
      this.setData({ popoverVisible: false }, snatch);
    } else {
      snatch();
    }
  },
  handleSnatchShare(e) {
    let redbagId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/personHongbaoDetail/personHongbaoDetail?type=receive&id=' + redbagId
    })
  },
  handleSnatchClose() {
    let animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    });
    animation.scale(0.2, 0.2).step();
    this.setData({ snatchAnimation: animation.export() }, () => {
      setTimeout(() => this.setData({ snatchVisible: false }));
    });
  }

})