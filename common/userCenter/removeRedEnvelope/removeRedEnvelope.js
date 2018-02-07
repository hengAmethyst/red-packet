// common/userCenter/removeRedEnvelope/removeRedEnvelope.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  
    type: {
      type: Number,
      value: 0,// 0 已经领取过该红包   1活动红包已发完   2领取活动红包成功  3红包未拆开状态  4个人红包领取成功
    },
    /**

     */
    info: {
      type: Object,
      value: {

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
    //关闭页面
    clooseBtnClick:function(e){
      console.log(e)
      var myEventOption = { bubbles: true, composed: true }
      this.triggerEvent('clooseClick', null, myEventOption);
    },


    // 分享
    shareBtnClick:function(e){
      console.log(e)
    },
  }
})
