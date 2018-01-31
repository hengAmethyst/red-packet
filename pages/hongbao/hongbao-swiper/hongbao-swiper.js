// pages/hongbao/hongbao-swiper/hongbao-swiper.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        img_width_three: 60,
        img_width_one: 60,
        clubs: [
            'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
            'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg',
            'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1515151263767&di=7de048755c4fb6136d7937f7d6acc102&imgtype=0&src=http%3A%2F%2Fpic119.nipic.com%2Ffile%2F20161230%2F2168026_223133374033_2.jpg',
            'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1515151265766&di=428999ef602db706af795035e93f9ec9&imgtype=0&src=http%3A%2F%2Fpic126.nipic.com%2Ffile%2F20170402%2F4402479_111933865038_2.jpg'
        ]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //触摸开始事件

        touchstart: function (e) {

            console.log(e.touches[0].pageX);

            this.data.touchDot = e.touches[0].pageX;

            var that = this;

            this.data.interval = setInterval(function () {

                that.data.time += 1;

            }, 100);

        },

        //触摸移动事件

        touchmove: function (e) {

            let touchMove = e.touches[0].pageX;

            let touchDot = this.data.touchDot;

            let time = this.data.time;

            console.log("touchMove: " + touchMove + ", touchDot: " + touchDot + ",diff: " + (touchMove - touchDot));


            //向左滑动

            if (touchMove - touchDot <= -40 && !this.data.done) {


                console.log("向左滑动");

                this.data.done = true;

                this.scrollLeft();


            }

            //向右滑动

            if (touchMove - touchDot >= 40 && !this.data.done) {

                console.log("向右滑动");

                this.data.done = true;

                this.scrollRight();

            }

        },

        //触摸结束事件

        touchend: function (e) {

            clearInterval(this.data.interval);

            this.data.time = 0;

            this.data.done = false;

        },

        //向左滑动事件

        scrollLeft() {

            var animation1 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation2 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation3 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            this.setData({

                img_width_three: 200

            })


            this.animation1 = animation1;

            this.animation2 = animation2;

            this.animation3 = animation3;


            this.animation1.translateX(-60).opacity(0.5).step();

            this.animation2.translateX(-60).opacity(1).scale(0.8, 0.8).step();

            this.animation3.translateX(-60).opacity(0.5).scale(1.2, 1.2).step();



            this.setData({

                animation1: animation1.export(),

                animation2: animation2.export(),

                animation3: animation3.export(),


            })


            var that = this;

            setTimeout(function () {

                that.animation1.translateX(0).opacity(0.5).step({
                    duration: 0,
                    timingFunction: 'linear'
                });

                that.animation2.translateX(0).opacity(1).scale(1, 1).step({
                    duration: 0, timingFunction: 'linear'
                });

                that.animation3.translateX(0).opacity(0.5).scale(1, 1).step({
                    duration: 0, timingFunction: 'linear'
                });


                that.setData({

                    animation1: animation1.export(),

                    animation2: animation2.export(),

                    animation3: animation3.export(),

                    img_width_three: 60

                })

            }.bind(this), 300)


            let array = this.data.clubs;

            let shift = array.shift();

            array.push(shift);


            setTimeout(function () {

                this.setData({

                    clubs: array

                })

            }.bind(this), 195)

        },


        //向右滑动事件

        scrollRight() {

            var animation1 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation2 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation3 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation4 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            var animation5 = wx.createAnimation({

                duration: 300,

                timingFunction: "linear",

                delay: 0

            })

            this.setData({

                img_width_one: 200

            })

            this.animation1 = animation1;

            this.animation2 = animation2;

            this.animation3 = animation3;


            this.animation1.translateX(60).opacity(0.5).scale(1.2, 1.2).step();

            this.animation2.translateX(60).opacity(1).step();

            this.animation3.translateX(60).opacity(0.5).step();



            this.setData({

                animation1: animation1.export(),

                animation2: animation2.export(),

                animation3: animation3.export(),


            })


            var that = this;

            setTimeout(function () {

                that.animation1.translateX(0).opacity(0.5).scale(1, 1).step({
                    duration: 0, timingFunction: 'linear'
                });

                that.animation2.translateX(0).opacity(1).scale(1, 1).step({
                    duration: 0, timingFunction: 'linear'
                });

                that.animation3.translateX(0).opacity(0.5).step({
                    duration: 0,
                    timingFunction: 'linear'
                });

                that.setData({

                    animation1: animation1.export(),

                    animation2: animation2.export(),

                    animation3: animation3.export(),

                    img_width_one: 60

                })

            }.bind(this), 300)


            let array = this.data.clubs;

            let pop = array.pop();

            array.unshift(pop);


            setTimeout(function () {

                this.setData({

                    clubs: array

                })

            }.bind(this), 195)

        }
    }
})
