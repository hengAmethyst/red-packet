import * as tool from '../../../../tool.js' 
Page({
  data: {
    scopeName:'附近3km',
    scopeType:3,
    ableSearched:true,//可以被搜索到
    ableShared:false,//可以发送给微信好友或群
    address:'默认当前位置',//地理位置
  },
  // 选择范围
  chooseScope(){
    wx.showActionSheet({
      itemList: ['附近3km', '附近5km', '附近10km','同城','不限'],
      success:(res)=>{
        console.log(res)
        switch(res.tapIndex){
          case 0: this.data.scopeName = '附近3km'
                  this.data.scopeType = 3
            break;
          case 1: this.data.scopeName = '附近5km'
                  this.data.scopeType = 5
            break;
          case 2: this.data.scopeName = '附近10km'
                  this.data.scopeType = 10
            break;
          case 3: this.data.scopeName = '同城'
                  this.data.scopeType = 20
            break;
          case 4: this.data.scopeName = '不限'
                  this.data.scopeType = 0
            break;
        }
        this.setData({
          scopeName: this.data.scopeName,
          scopeType: this.data.scopeType
        })
      }
    })
  },
  // 切换switch
  clickSwitch(e){
    let type = e.currentTarget.dataset.type
    let value = e.detail.value
    if(type==0){
      this.setData({
        ableSearched: value
      })
    }else{
      this.setData({
        ableShared: value
      })
      if(value){
        this.setData({
          scopeType: 0,
          scopeName: '不限'
        })
      }else{
        this.setData({
          scopeType: 3,
          scopeName: '附近3km'
        })
      }
    }
  }
  ,
  // 上传数据到全局变量中
  uploadData(){
    getApp().globalData.hongbaoSet.advancedSet.ableSearched = this.data.ableSearched
    getApp().globalData.hongbaoSet.advancedSet.scopeType = this.data.scopeType
    getApp().globalData.hongbaoSet.advancedSet.ableShared = this.data.ableShared
  },
  // 选择位置
  chooseLocation(){
    tool.chooseLocation().then((data)=>{
      getApp().globalData.hongbaoSet.advancedSet.name = data.name
      this.setData({
        address:data.name
      })
      getApp().globalData.hongbaoSet.advancedSet.latitude = data.latitude
      getApp().globalData.hongbaoSet.advancedSet.longitude = data.longitude
    })
  }
  ,
  //返回上页
  goback(){
    wx.navigateBack()
  }
  ,
  onShow: function(){
    // 如果已经选择过地址了,就使用上一次的地址
    if (getApp().globalData.hongbaoSet.advancedSet.name){
      this.setData({
        address: getApp().globalData.hongbaoSet.advancedSet.name
      })
    }
  }
  ,
  onLoad: function (options) {
  
  },
  onUnload:function(){
    this.uploadData()
  },
  onHide: function(){
    this.uploadData()
  }
})