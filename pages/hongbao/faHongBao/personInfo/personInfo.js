import apiUrl from '../../../../api-url.js' 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImg:null,//头像
    nickName:null,//昵称
    blessing:'大吉大利,万事如意'//祝福语
  },
  // 改变头像
  changeHeadImg(){
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
      }
    })
  }
  ,
  // 输入内容
  inputSome(e){
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    if(type==0){
      this.setData({
        nickName: value
      })
    }else{
      this.setData({
        blessing: value
      })
    }
  }
  ,
  // 上传数据到全局变量中
  uploadData() {
    let data = getApp().globalData.hongbaoSet
    data.info = {
      headImg: this.data.headImg,
      nickName: this.data.nickName,
      blessing: this.data.blessing
    }
    getApp().globalData.hongbaoSet = data
  },
  //返回
  goback(){
    // 返回到红包模板页
    wx.navigateBack()
  }
  ,
  onLoad: function (options) {
    // 如果人为的修改过个人信息
    if (getApp().globalData.hongbaoSet.info){
      let info = getApp().globalData.hongbaoSet.info
      let nickName = info.nickName
      let headImg = info.headImg
      let blessing = info.blessing
      this.setData({
        headImg: headImg,
        nickName: nickName,
        blessing: blessing
      })
    }
    else{
      let info = getApp().globalData.userInfo
      this.setData({
        blessing: "大吉大利,万事如意",
        headImg: info.avatarUrl,
        nickName: info.nickName
      })
    }
    // 如果是从制作相同红包过来的
    if(options.greeting){
      this.setData({
        blessing: options.greeting
      })
    }
  },
  onShow:function(){
  }
  ,
  onUnload: function () {
    this.uploadData()
  },
  onHide: function () {
    this.uploadData()
  }
})