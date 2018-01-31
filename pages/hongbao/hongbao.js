// pages/hongbao/hongbao.js
import apiUrl from '../../api-url.js' 
import * as tool from '../../tool.js' 
Page({
  data: {
    festivalList: ["春节","情人节","元宵节"],//节日列表
    animationData: {},// 列表展示隐藏动画设置数据
    festivalListHeight:null,//节气列表高度
    nowFesIndex:null,//当前的选中节日的index
    nowFestival:'全部节日',//显示当前选择的节日名字
    showFestivalList:false,//展示节日列表
    showArrow:false,//节日options控制的显示
    bgImg:'/img/bg_defined.png',//自定义模板的背景
    showDefinedWord:true,//显示自定义模板字
    allTypeList:null,//所有红包类型
    typeList:null,//红包类型list
    swiperIndex:1,//swiper 当前的index
    showMark: false,//展示蒙版
    userInfo:null
  },
//-------------------------------------------------节日列表显示相关--------------------------------------------------//
  // 展示公司列表
  showFestivalList() {
    // 计算公司列表的高度
    this.countListHeight(this.data.festivalList)
    // 判断当前节日列表是展开的还是关闭的,默认为false
    let sign = !this.data.showFestivalList
      // 如果关闭时,需要打开
    if (sign){
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
    else{
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
  // 选择节气
  chooseFestival(e){
    let index = e.currentTarget.dataset.index
    let nowFestival = e.currentTarget.dataset.nowfestival.festivalName
    this.setData({
      nowFesIndex:index,
      festivalListHeight:0,
      typeList: this.data.allTypeList[index],
      nowFestival: nowFestival
    })
    this.showFestivalList()
  },
//-------------------------------------------------选择和操作模板相关--------------------------------------------------//
  // 上传自定义图片
  uploadBg(){
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
              bgImg: data.data.fullFilename,
              showDefinedWord:false
            })
          }
        })
      }
    })
  },
  // swiper滑动时触发,获取当前的swiper的index
  nowSwiper(e){
    this.setData({
      swiperIndex: e.detail.current
    })
  },
  // 跳转到其它页面
  gotoOtherPage(){
    /**
     * 0;代表使用的是自定义模板;
     * else;代表使用的是其它模板;
     */
    if (this.data.swiperIndex==0){
      // 如果没有上传背景图就点击使用按钮时,提示
      if (this.data.showDefinedWord){
        wx.showToast({
          image: '/img/warning.png',
          title: '请上传背景图',
        })
      }else{
        var data = {
          templateUrl: this.data.bgImg
        }
        data = JSON.stringify(data)
        data = encodeURIComponent(data)
        wx.navigateTo({
          url: '/pages/hongbao/faHongBao/faHongBao?info=' + data,
        })
      }
    }
    else{
      // swiperIndex -1 是因为swiper的第一页被自定义模板占据了,而后台数据是返回的一个新的数组,从0开始
      let index = this.data.swiperIndex - 1
      let item = this.data.typeList[index]
      var data = {
        templateUrl: item.url
      }
      data = JSON.stringify(data)
      // 传递json数据时,先用此方法编码一下,再在接收的地方解码
      data = encodeURIComponent(data)
      wx.navigateTo({
        url: '/pages/hongbao/faHongBao/faHongBao?info=' + data,
      })
    }
    
  },
  onLoad: function (options) {
    let token = getApp().globalData.nowToken
    let unionId = getApp().globalData.unionId
    let userInfo = getApp().globalData.userInfo
    let param = {type:null}
    // 请求模板的数据
    tool.request(apiUrl.redbag.template, token, param, unionId).then((data)=>{
      console.log(data)
      let nowData = null
      let festivalList = []
      data.forEach((item,index) => {
        if (item[0].latest){
          nowData = data[index]
        }
      })
      data.forEach((item, index) => {
        festivalList.push(
          {
          fesivalId:item[0].festivalId,
          festivalName: item[0].festivalName
          })
      })
      this.setData({
        allTypeList: data,
        typeList: nowData,
        festivalList: festivalList,
        nowFestival: nowData[0].festivalName,
        userInfo: userInfo
      })
    })
  }
})