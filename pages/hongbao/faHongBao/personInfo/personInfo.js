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
    wx.navigateBack()
  }
  ,
  onLoad: function (options) {
    console.log(getApp().globalData.hongbaoSet.info,'111111111')
    let info = getApp().globalData.hongbaoSet.info
    let nickName = info.nickName
    let headImg = info.headImg
    this.setData({
      headImg: headImg,
      nickName: nickName,
      blessing: info.blessing
    })
  },
  onShow:function(){
    console.log(getApp().globalData.hongbaoSet,'123')
  }
  ,
  onUnload: function () {
    this.uploadData()
  },
  onHide: function () {
    this.uploadData()
  }
})