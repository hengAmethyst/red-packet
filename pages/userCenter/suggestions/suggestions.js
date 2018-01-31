// pages/userCenter/suggestions/suggestions.js
import apiUrl from '../../../api-url.js'
import * as tool from '../../../tool.js' 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    festivalList: ["投诉", "建议"],//节日列表
    animationData: {},// 列表展示隐藏动画设置数据
    festivalListHeight: null,//节气列表高度
    nowFestival: '投诉',//显示当前选择的类型
    showFestivalList: false,//展示节日列表
    showArrow: false,//节日options控制的显示
    showMark: false,//展示蒙版
    personalDescLength: 0,//个人描述当前长度
    picList: [], //图片列表
    id:"",//红包id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new getApp().WeToast()
    console.log(options)

    this.data.id = options.id;
  },

  showFestivalList() {
    // 计算公司列表的高度
    this.countListHeight(this.data.festivalList)
    // 判断当前节日列表是展开的还是关闭的,默认为false
    let sign = !this.data.showFestivalList
    // 如果关闭时,需要打开
    if (sign) {
      this.setData({
        showFestivalList: sign,
        arrowSrc: '/images/icon_huixia.png'
      })
      //因为有蒙版的原因,所以让箭头在蒙版出现之后再出现
      let timer = setTimeout(() => {
        this.setData({
          showArrow: true
        })
        clearTimeout(timer)
      }, 50)
      this.listAnimation(this.data.festivalListHeight)
    }
    //如果打开时,需要关闭
    else {
      this.setData({
        showFestivalList: sign,
        arrowSrc: '/images/icon_lanshang.png'
      })
      this.listAnimation(0)
      // 延时200ms之后再让箭头消失
      let timer = setTimeout(() => {
        this.setData({
          showArrow: false
        })
        clearTimeout(timer)
      }, 200)
    }
    this.setData({
      showMark: !this.data.showMark
    })
  },

  // 计算节日名称滚动的高度
  countListHeight(itemList) {
    let temp = null
    // 当列表长度小于4时,就给它当前列表高度
    if (itemList.length <= 4) {
      temp = itemList.length * 82 + 'rpx'
    }
    // 如果列表长度大于4,就给固定高度,然后滚动
    else {
      temp = 6 * 80 + 'rpx'
    }
    this.setData({
      festivalListHeight: temp
    })
  },
  // 列表动画
  listAnimation(height) {
    // 列表展示隐藏动画
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.height(height).step()
    this.setData({
      animationData: animation.export()
    })
  },
  // 选择投诉和建议
  chooseFestival(e) {
    let index = e.currentTarget.dataset.index
    let nowFestival = e.currentTarget.dataset.nowfestival

    this.showFestivalList();
    console.log(e)
    this.setData({
      nowFestival: nowFestival,
    })

  },


  /***
   * 请描述您的问题输入方法
   */
  personalDescInputClick: function (e) {
    this.data.personalDesc = e.detail.value;

    this.setData({
      personalDescLength: e.detail.value.length
    })
  },



  // 添加图片
  addPic(e) {
    let idx = e.target.dataset.selectIdx;
    let that = this
    wx.chooseImage({
      count: that.data.picList.length < 3 ? 3 - that.data.picList.length : 0, // 默认9
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        let tempData = { nowNum: 0, allNum: tempFilePaths.length }
        that.upload(tempData, that.data.picList, tempFilePaths)
      }
    });
  },

  // 多张图片上传函数
  upload(picData, picList, filePathList) {
    let that = this
    wx.uploadFile({
      url: apiUrl.file,
      filePath: filePathList[picData.nowNum],
      name: "file",
      formData: {
        user: "test"
      },
      success: function (res) {
        let data = JSON.parse(res.data);
        let temp = {};
        temp.isTurnView = 0;
        temp.url = data.data.fullFilename;
        picList.push(temp);
        that.setData({
          picList: picList
        })
        if (picData.nowNum < picData.allNum - 1) {
          picData.nowNum++
          that.upload(picData, picList, filePathList)
        }
        else {
          console.log('执行完毕')
          return false
        }
      }
    })
  },


  // 显示大图
  showBigPic(e) {
    var imageArr = [];
    for (let i = 0; i < this.data.picList.length; i++) {
      imageArr.push(this.data.picList[i].url)
    }
    wx.previewImage({
      current: e.currentTarget.dataset.img.url,
      urls: imageArr
    })
  },

  //删除图片
  delPhotoClick(e){
    let inedx = e.currentTarget.dataset.index;

    var imageArr = [];
    for (let i = 0; i < this.data.picList.length; i++) {
      imageArr.push(this.data.picList[i].url)
    }

    this.data.picList.splice(inedx, 1)
    this.setData({
      picList: this.data.picList,
    })
  },


  //表单提交
  formSubmit(e){
    console.log(e)

    if (e.detail.value.content.length == 0 ){
      this.wetoast.toast({
        img: '',
        title: "请输入您的投诉和建议",
      })

      return;
    }

    var imageArr = [];
    for (let i = 0; i < this.data.picList.length; i++) {
      imageArr.push(this.data.picList[i].url)
    }

    let param = e.detail.value;
    param["redbagId"] = this.data.id;
    param["type"] = 0;
    param["picList"] = imageArr;

    this.submitSuggestionHttpRequest(param)
  },


  //提交投诉
  submitSuggestionHttpRequest: function (param){
    wx.showLoading({
      title: '数据提交中',
    })

    tool.request(apiUrl.redbag.complainAfterReceiveRedbag, getApp().globalData.nowToken, param, getApp().globalData.unionId).then(data => {
      wx.hideLoading();
      wx.showModal({
        title: '投诉成功',
        content: '感谢您的投诉，我们将会尽快解决您的问题',
        success: function (res) {
          wx.navigateBack({

          })
        }
      })
    }, err => {
      wx.hideLoading();

      this.wetoast.toast({
        img: '',
        title: err.message,
      })
    })
  }

})