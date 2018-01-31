import ApiUrl from './api-url';
import { MyError } from './tool';

const PING_DATA = '{"msgType":1,"merchantId":117,userType:20,reqId:1}';

class SimpleSocket {
    task = null;
    multiTask = true;
    options = {};
    events = {};
    opened = false;
    msgQueue = [];
    pingTimeout = 1000 * 10;
    pingTimeoutId = null;
    lastPingTimeoutTime = null;
    pingTimeoutCount = 0;

    constructor(options) {
        this.options = options || {};
    }

    send(data, cache = true) {
        if (this.opened) {
            let msg = data;
            if (typeof msg !== 'string') {
                msg = JSON.stringify(msg)
            }
            sendMessage(this, msg);
        } else {
            if (cache) {
                this.msgQueue.push(data);
            }
        }
    }

    close() {
        closeSocket(this);
    }

    on(type, listener) {
        if (typeof listener !== 'function') {
            throw new Error('listener is not function');
        }
        let events = this.events;
        let existing = events[type];
        if (existing === undefined) {
            events[type] = listener;
        } else {
            if (typeof existing === 'function') {
                events[type] = [existing, listener];
            } else {
                existing.push(listener);
            }
        }
        return this;
    }

    once(type, listener) {
        function onceWrapper(data) {
            if (!this.fired) {
                this.target.removeListener(this.type, this.wrapFn);
                this.fired = true;
                listener(data);
            }
        }

        this.on(type, function (data) {
            let state = { fired: false, wrapFn: undefined, target: ss, type, listener };
            let wrapped = onceWrapper.bind(state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
        });
        return this;
    }

    removeListener(type, listener) {
        let events = this.events;
        let list = events[type];
        if (list === undefined) {
            return this;
        }

        if (list === listener) {
            delete events[type];
        } else if (typeof list !== 'function') {
            let index = list.indexOf(listener);
            if (index < 0) {
                return this;
            }

            if (index === 0) {
                list.shift();
            } else {
                list.splice(index, 1);
            }

            if (list.lentgh === 1) {
                events[type] = list[0];
            }
        }

        return this;
    }

    emit(type, data) {
        let events = this.events;
        let listener = events[type];

        if (listener === undefined) {
            return;
        }

        if (typeof listener === 'function') {
            listener(data);
        } else {
            for (let i = 0, l = listener.length; i < l; i++) {
                listener[i](data);
            }
        }
    }

    connect(callback) {
        if (this.task) {
            callback();
            return;
        }

        // wx.request({
        //     url: ApiUrl.index,
        //     success: res => {
        //         let m = (res.header['Set-Cookie'] || '').match(/(?:^|;)(JSESSIONID=.*?)(?:;|$)/)
        //         if (m) {
                    let options = {
                        ...this.options,
                        // header: {
                        //     Cookie: m[1]
                        // }
                    };
                    let task = wx.connectSocket(options);
                    if (task) {
                        this.task = task;
                        this.multiTask = true;
                        bindTaskEvent(this, this.task);
                    } else {
                        this.task = true;
                        this.multiTask = false;
                        bindGlobalEvent(this);
                    }

                    callback();
        //         } else {
        //             callback(new MyError('服务器错误', -1));
        //         }
        //     },
        //     fail: err => {
        //         callback(new MyError(err.errMsg, -2));
        //     }
        // })
    }

    wakeup() {
        this.connect(() => {
            // if (this.opened) {
            //     this.ping();
            // }
        });
    }

    // ping() {
    //     if (this.pingTimeoutId) {
    //         return;
    //     }
    //     console.log('pinging...');


    //     this.send(PING_DATA);
    //     this.pingTimeoutId = setTimeout(() => {
    //         if (this.opened) {
    //             closeSocket(this);
    //         } else {
    //             tryWakeup(this);
    //         }
    //     }, this.pingTimeout);
    // }

    handleMessage(data) {
        console.log('s.handleMessage', data);
        // if (data === PING_DATA) {
        //     this.handlePong();
        //     return;
        // }
        try {
            let msg = JSON.parse(data);
            this.emit('message', msg);
        } catch (e) {
            console.log('不正确的消息格式', data);
        }
    }

    // handlePong() {
    //     console.log('s.handlePong');
    //     if (this.pingTimeoutId) {
    //         clearTimeout(this.pingTimeoutId);
    //         this.pingTimeoutId = null;
    //     }

    //     this.lastPingTimeoutTime = null;
    //     this.pingTimeoutCount = 0;
    // }

    handleOpen() {
        console.log('s.handleOpen', arguments);
        this.opened = true;
        this.emit('open');
        for (let msg of this.msgQueue) {
            this.send(msg);
        }
        this.msgQueue = [];
    }

    handleClose() {
        console.log('s.handleClose', arguments);
        this.opened = false;
        this.task = null;
        this.emit('close');
        // tryWakeup(this);
    }

    handleError() {
        console.log('s.handleError', arguments);
        this.emit('error');
        if (this.opened) {
            try {
                closeSocket(this);
                this.opened = false;
                this.task = null;
            } catch (e) { }
        }
    }
}

function sendMessage(ss, data) {
    if (ss.multiTask) {
        ss.task.send({ data });
    } else {
        wx.sendSocketMessage({ data });
    }
}

function closeSocket(ss) {
    if (ss.multiTask) {
        ss.task.close();
    } else {
        wx.closeSocket();
    }
}

function bindTaskEvent(ss, task) {
    task.onMessage(res => ss.handleMessage(res.data));
    task.onOpen((r) => ss.handleOpen(r));
    task.onClose((res) => ss.handleClose(res));
    task.onError((res) => ss.handleError(res));

}

function bindGlobalEvent(ss) {
    wx.onSocketMessage(res => ss.handleMessage(res.data));
    wx.onSocketOpen(() => ss.handleOpen());
    wx.onSocketClose((res) => ss.handleClose(res));
    wx.onSocketError((res) => ss.handleError(res));
}

function tryWakeup(ss) {
    console.log('try wake up', ss.lastPingTimeoutTime, ss.pingTimeoutCount);
    let now = Date.now();
    if (ss.lastPingTimeoutTime && (now - ss.lastPingTimeoutTime < 5000 * 1000)) {
        ss.lastPingTimeoutTime = now;
        ss.pingTimeoutCount++;
    } else {
        ss.lastPingTimeoutTime = now;
        ss.pingTimeoutCount = 1;
    }
    if (ss.pingTimeoutCount < 10) {
        let delay = 5000 * ss.pingTimeoutCount;
        setTimeout(() => ss.wakeup(), delay);
    }
}

module.exports = new SimpleSocket({
    url: ApiUrl.socket
});