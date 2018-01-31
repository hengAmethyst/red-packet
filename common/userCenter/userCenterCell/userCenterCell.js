// common/userCenter/userCenterCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      info:{
        type:null,
        value:{
          title: "通知中心",//标题
          subtitle:"",
          description:"￥1302.32",//内容
        }
      }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    userCenterCellClick:function (e){
      var myEventDetail = this.data.info; // detail对象，提供给事件监听函数
      var myEventOption = { bubbles: true, composed: true } // 触发事件的选项
      this.triggerEvent('userCenterCellClick', myEventDetail, myEventOption);
    }
  }
})
