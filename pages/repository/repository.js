// pages/repository/repository.js
import apiUrl from '../../api-url.js'
import * as tool from '../../tool.js' 
import * as utils from '../../util.js';

Page({
  data: {
    date:null,
    dataArr: [

    ],
    nowChoosedDate:null,
    remainAmount:0,
    todayDate:null,

    page: 1, //当前页数
    totalResult: 20,//数据总数
    isLoading: false,
    loadMoreTip: "上拉加载更多数据",
  },


  onLoad: function (options) {
    new getApp().WeToast();
    
    let remainAmount = options.remainAmount

    this.dateFormat()
    let temp = new Date().Format("yyyy-MM-dd")

    console.log("今天是：",temp);
    let tempDay = new Date()
    this.setData({
      nowChoosedDate: temp,
      date: tempDay,
      remainAmount: remainAmount,
      todayDate: temp
    })

    this.getTradeListHttpRequest();
  },

  onShow: function () {

  },

  


  // 日期选择
  bindDateChange(e){
    let selected = e.detail.value
    var val = Date.parse(selected);
    var newDate = new Date(val);

    this.setData({
      nowChoosedDate: selected,
      page: 1,
      dataArr: [],
      date: newDate
    })

    this.getTradeListHttpRequest();
  },

  // 上一天
  preDate(){
    this.setData({
      page:1,
      dataArr:[]
    })

    this.data.date.setDate(this.data.date.getDate() - 1)
    this.data.date.getDate()
    this.data.nowChoosedDate = this.data.date.Format("yyyy-MM-dd")
    this.setData({
      nowChoosedDate: this.data.nowChoosedDate,
      date: this.data.date
    })

    this.getTradeListHttpRequest();
  },

  // 下一天
  nextDate(){
    if (this.data.nowChoosedDate == null) {
      let temp = new Date()
      let tempDay = new Date()
      this.setData({
        nowChoosedDate: temp,
        date: tempDay
      })
    }

    let nowDate = new Date(new Date().setHours(0, 0, 0, 0));
    let chooseDate = new Date(this.data.date.setHours(0, 0, 0, 0));

    let intNowDate = Date.parse(nowDate)//当天0点时间戳
    let intChooseDate = Date.parse(chooseDate)//当前选择的时间戳

    if (intNowDate == intChooseDate){
       return;
    }

    this.setData({
      page: 1,
      dataArr: []
    })

    this.data.date.setDate(this.data.date.getDate() + 1)
    this.data.date.getDate()
    this.data.nowChoosedDate = this.data.date.Format("yyyy-MM-dd")
    this.setData({
      nowChoosedDate: this.data.nowChoosedDate,
      date: this.data.date
    })

    this.getTradeListHttpRequest();
  },

  // 格式化日期
  dateFormat(){
    Date.prototype.Format = function (fmt) { //author: meizz 
      var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    }
  },

  // 跳转充值页
  goCharge(){
    wx.navigateTo({
      url: '/pages/repository/charge/charge',
    })
  },

  // 跳转充值页
  goCash() {
    wx.navigateTo({
      url: '/pages/repository/getCash/getCash?remainAmount=' + this.data.remainAmount,
    })
  },



  //上拉加载
  scrolltolower: function (e) {
    //如果已经有数据请求  则不发起新的请求
    if (this.data.isLoading == true) {
      return
    }

    if (this.data.totalResult > this.data.dataArr.length) {
      this.data.page = this.data.page + 1;

      //上拉加载
      this.getTradeListHttpRequest();
    } else {
      this.setData({
        loadMoreTip: "暂无更多数据",
      })
    }
  },


  //获取明细列表
  getTradeListHttpRequest: function () {
    let chooseDate = new Date(this.data.date.setHours(0, 0, 0, 0));
    let intChooseDate = Date.parse(chooseDate)//当前选择的时间戳
    let nowDateStr = utils.formatTime(intChooseDate / 1000, 'Y-M-D')

    console.log("时间戳", intChooseDate)
    console.log("日期", nowDateStr)

    let param = {
      page:{
        pageSize: 20,
        currentPage: this.data.page,
      },
      createTime: nowDateStr
    }

    wx.showLoading({
      title: '数据加载中',
    })

    this.setData({
      loadMoreTip: "数据加载中",
      isLoading: true,
    })


    



    tool.request(apiUrl.userCenter.tradeList, getApp().globalData.nowToken, param , getApp().globalData.unionId).then(data => {

      wx.hideLoading();

      let list = data.list
      for (let i = 0; i < list.length; i++) {
        list[i].createTime = utils.formatTime(list[i].createTime / 1000, 'h:m')
      }
      var dataArr = this.data.dataArr;
      dataArr = dataArr.concat(list);

      this.setData({
        dataArr: dataArr,
        totalResult: data.totalResult,
        loadMoreTip: data.totalResult > dataArr.length ? "上拉加载更多数据" : "暂无更多数据",
        isLoading: false,
      })

    }, err => {
      wx.hideLoading()

      this.data.page = this.data.page - 1 >= 1 ? this.data.page - 1:1;

      this.wetoast.toast({
        img: '',
        title: err.message,
        imgMode: 'scaleToFill'
      })

      wx.hideLoading();

      this.setData({
        loadMoreTip: "上拉加载更多数据",
        isLoading: false,
      })
    })
  },


  //提现申请提交后 账户余额
  remainAmountChange: function (remainAmount){
      this.dateFormat()
      let temp = new Date().Format("yyyy-MM-dd")

      console.log("今天是：", temp);
      let tempDay = new Date()
      this.setData({
        nowChoosedDate: temp,
        date: tempDay,
        remainAmount: remainAmount,
        todayDate: temp
      })

      this.getTradeListHttpRequest();
  }
})