/**
 
 1. wxml  中加入
 <import src="/common/template/wetoast/wetoast.wxml"/>
 <template is="wetoast" data="{{...__wetoast__}}"/>


 2. js文件 onLoad 里添加  new getApp().WeToast()

 3. 在需要使用地方直接使用
      this.wetoast.toast({
       img: '',
       title:"哈哈哈哈哈哈哈哈哈哈哈哈哈",
       imgMode: 'scaleToFill'
     })


参数 	             类型 	        必填 	                 说明
img       	      String 	       可选 	      提示的图片，网络地址或base64
imgClassName 	    String 	       否 	         自定义图片样式时使用的class
imgMode 	        String 	       否 	         参考小程序image组件mode属性
title 	          String 	       可选 	      提示的内容
titleClassName 	  String 	       否 	         自定义内容样式时使用的class
duration        	Number     	   否 	         提示的持续时间，默认1500毫秒
success 	        Function 	     否 	         提示即将隐藏时的回调函数
fail 	            Function 	     否 	         调用过程抛出错误时的回调函数
complete 	        Function 	     否 	         调用结束时的回调函数
*/

function WeToastClass() {

  //构造函数
  function WeToast() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    this.__page = curPage
    this.__timeout = null

    //附加到page上，方便访问
    curPage.wetoast = this

    return this
  }

  //切换显示/隐藏
  WeToast.prototype.toast = function (data) {
    try {
      if (!data) {
        this.hide()
      } else {
        this.show(data)
      }
    } catch (err) {
      console.error(err)

      // fail callback
      data && typeof data.fail === 'function' && data.fail(data)
    } finally {
      // complete callback
      data && typeof data.complete === 'function' && data.complete(data)
    }
  }

  //显示
  WeToast.prototype.show = function (data) {
    let page = this.__page

    clearTimeout(this.__timeout)

    //display需要先设置为block之后，才能执行动画
    page.setData({
      '__wetoast__.reveal': true
    })

    setTimeout(() => {
      let animation = wx.createAnimation()
      animation.opacity(1).step()
      data.animationData = animation.export()
      data.reveal = true
      page.setData({
        __wetoast__: data
      })
    }, 30)

    if (data.duration === 0) {
      // success callback after toast showed
      setTimeout(() => {
        typeof data.success === 'function' && data.success(data)
      }, 430)
    } else {
      this.__timeout = setTimeout(() => {
        this.toast()

        // success callback
        typeof data.success === 'function' && data.success(data)
      }, (data.duration || 1500) + 400)
    }

  }

  //隐藏
  WeToast.prototype.hide = function () {
    let page = this.__page

    clearTimeout(this.__timeout)

    if (!page.data.__wetoast__.reveal) {
      return
    }

    let animation = wx.createAnimation()
    animation.opacity(0).step()
    page.setData({
      '__wetoast__.animationData': animation.export()
    })

    setTimeout(() => {
      page.setData({
        __wetoast__: { 'reveal': false }
      })
    }, 400)
  }

  return new WeToast()
}

module.exports = {
  WeToast: WeToastClass
}