import * as Tool from './tool';
let { WeToast } = require("/common/template/wetoast/wetoast.js");

App({
  WeToast,
  globalData: {
    isLogining: false,
    isReady: false,
    loginErr: null,
    readyCallbackList: [],
    locationChangeCallbackList: [],
    isListeningLocationChange: false,
    lastLocation: null,

    userInfo: null,
    nowToken: null,
    unionId: null,
    shortUnionId: null,
    hongbaoSet:null
  },
  onReady(callback) {
    if (this.globalData.isReady) {
      callback(this.globalData.loginErr);
      return;
    }

    this.globalData.readyCallbackList.push(callback);
  },
  login() {
    if (this.globalData.isLogining) {
      return;
    }
    this.globalData.isLogining = true;
    Tool.login()
      .then(data => {
        this.globalData.userInfo = data.userInfo;
        this.globalData.nowToken = data.loginInfo.token;
        this.globalData.unionId = data.loginInfo.unionId;
        this.globalData.shortUnionId = data.loginInfo.shortUnionId;
        console.log(this.globalData.userInfo,'$$$$$$$')
        console.log('logined, globalData:', this.globalData);
        this.globalData.isReady = true;
        this.globalData.isLogining = false;
        this.globalData.readyCallbackList.forEach(cb => cb());
        // 红包默认设置
        this.globalData.hongbaoSet = {
          advancedSet: {
            ableSearched: true,
            ableShared: false,
            scopeType: 3
          },
          info: {
            blessing: "大吉大利,万事如意",
            headImg: this.globalData.userInfo.avatarUrl,
            nickName: this.globalData.userInfo.nickName
          }
        }


      }, err => {
        this.globalData.loginErr = err;
        this.globalData.isReady = true;
        this.globalData.isLogining = false;
        console.log('login error:', err);

        if (err.code == -100) {
          wx.navigateBack();

        } else {
          this.globalData.readyCallbackList.forEach(cb => cb(err));
        }
      });
  },
  onLocationChange(callback) {
    this.globalData.locationChangeCallbackList.push(callback);
    if (!this.globalData.isListeningLocationChange) {
      this.globalData.isListeningLocationChange = true;
      setInterval(() => {
        Tool.wx.getLocation()
          .then(res => {
            let changed = false;
            if (this.globalData.lastLocation) {
              // TODO: 是不是计算下位置变化距离？太小的就丢弃了？
              let l = this.globalData.lastLocation;
              if (l.latitude != res.latitude || l.longitude != res.longitude) {
                changed = true;
              }
            } else {
              changed = true;
            }

            if (changed) {
              this.globalData.lastLocation = res;
              this.globalData.locationChangeCallbackList.forEach(cb => cb(res));
            }
          });
      }, 60 * 1000);
    }
  },
  onLaunch(options) {
    console.log('--- onLaunch ---', options);
    this.login();
  },
  onShow(options) {
    console.log('--- onShow ---', options);
    if (!this.globalData.nowToken) {
      this.login();
    }
  },

})