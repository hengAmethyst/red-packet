// common/hongbaoInfo/hongbaoInfo.js
import apiUrl from '../../api-url.js'
import * as tool from '../../tool.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blessing: null
  },

  /**
   * 组件的初始数据
   */
  data: {
    headImg: null,//头像
    nickName: null,//昵称
    blessing: '大吉大利,万事如意',//祝福语
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 改变头像
    changeHeadImg() {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],//压缩
        success: (res) => {
          wx.uploadFile({
            url: apiUrl.file,
            filePath: res.tempFilePaths[0],
            name: "singleImg",
            success: (res) => {
              let data = JSON.parse(res.data);
              this.setData({
                headImg: data.data.fullFilename
              })
            }
          })
          this.upload()
        }
      })
    },
    // 输入内容
    inputSome(e) {
      let type = e.currentTarget.dataset.type
      let value = e.detail.value
      if (type == 0) {
        this.setData({
          nickName: value
        })
      } else {
        this.setData({
          blessing: value
        })
      }
      this.upload()
    },
    // uploadData
    upload(){
      var myEventDetail = {
        headImg: this.data.headImg,
        nickName: this.data.nickName,
        blessing: this.data.blessing
      } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  },
  ready(){
    let tempData = this.data.blessing
    getApp().onReady(()=>{
      let info = getApp().globalData.hongbaoSet.info
      this.setData({
        headImg: info.headImg,
        nickName: info.nickName,
        blessing: info.blessing
      })
      if (tempData){
        this.setData({
          blessing: tempData
        })
      }
      this.upload()
    })
  }
})
