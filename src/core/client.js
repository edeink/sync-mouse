const robot = require('robotjs');
const Communication = require('./communication');
const Hook = require('./hook');
const Mock = require('./mock');
const COM_TYPE = require('./type/comType');
const OPT_TYPE = require('./type/optType');
const LOG_TYPE = require('./type/logType');
const {KEY_TO_NUM} = require('./type/keyType');

class Client {
    start() {
        // 主要的组件
        this.com = new Communication();
        // 被控制者的ip
        this.controlAddr = null;
        // 是否正在控制电脑
        this.isControlling = false;
        // 初始化监听
        this.com.onInit().then(() => {
            // 监听是否控制
            this.onEnter().then((address) => {
                this.toEnter(address);
            });
            this.com.onReceiveMsg((data) => {
                switch(data.c) {
                    case COM_TYPE.TO_ENTER: {
                        this.canEnter(data.v);
                        break;
                    }
                    case COM_TYPE.CAN_ENTER: {
                        this.doneEnter(data.v);
                        break;
                    }
                    case COM_TYPE.TO_LEAVE: {
                        this.onLeave();
                    }
                    case COM_TYPE.SYNC_OPERATE: {
                        this.onControl(data.v);
                    }
                }
            });
            this.com.broadcastMsg(this.com.getMsg(COM_TYPE.BROADCAST_ADDRESS, {addr: this.com.address}));
        });
        // this.onControl().then((data) => {
        //     this.mock.mockEvent(data);
        // });
        // this.onOutOfControl().then(() => {
        //     this.unlock();
        // });
    }

    exit() {

    }

    isActive() {

    }

    onEnter() {
        return new Promise((resolve) => {
            let {width, height} = robot.getScreenSize();
            Hook.onEvent((event) => {
                if (event.type === OPT_TYPE.MOUSE_MOVE) {
                    const {x, y} = event;
                    if (x > width - 100) {
                        resolve(this.com.address); // 测试，用本地替代
                    }
                }
            });
        })
    }

    /**
     * 请求控制电脑
     * @param address 被控制电脑地址
     */
    toEnter(address) {
        console.log(LOG_TYPE.LOG_CORE, 'Client.toEnter', '请求控制电脑', address);
        if (!address) {
            console.log(LOG_TYPE.ERROR, 'Client.toEnter', '控制电脑时，需要提供被控制者的IP地址');
        } else {
            this.com.sendMsg(this.com.getMsg(COM_TYPE.TO_ENTER, {addr: address}), address).then();
        }
    }

    /**
     * 允许控制电脑
     * @param remoteValue
     */
    canEnter(remoteValue) {
        console.log(LOG_TYPE.LOG_CORE, 'Client.canEnter', '允许控制电脑', remoteValue);
        if (!remoteValue.addr) {
            console.log(LOG_TYPE.ERROR, 'Client.canEnter', '错误：请求控制需要携带控制者的IP地址');
        } else {
            this.com.sendMsg(this.com.getMsg(COM_TYPE.CAN_ENTER, {addr: this.com.address}), remoteValue.addr).then();
        }
    }

    /**
     * 进入电脑
     */
    doneEnter(remoteValue) {
        console.log(LOG_TYPE.LOG_CORE, 'Client.doneEnter', '控制电脑', remoteValue);
        if (!remoteValue.addr) {
            console.log(LOG_TYPE.ERROR, 'Client.doneEnter', '接受控制的电脑需要提供IP地址');
        } else {
            this.controlAddr = remoteValue.addr;
            this.lock();
            Hook.stopListen();
            Hook.onEvent((event) => {
                if (event.type === OPT_TYPE.KEY_UP && event.keycode === KEY_TO_NUM.ESC) {
                    this.unlock();
                } else {
                    this.com.sendMsg(this.com.getMsg(COM_TYPE.SYNC_OPERATE, event), this.controlAddr).then();
                }
            });
        }
    }

    lock() {
        console.log(LOG_TYPE.LOG_CORE, 'Client.lock', '进入锁定模式');
        let {x, y} = robot.getMousePos();
        this.lockTimeKey = setInterval(function () {
            robot.moveMouse(x, y);
        }, 16);
    }

    unlock() {
        console.log(LOG_TYPE.LOG_CORE, 'Client.unlock', '退出锁定模式');
        clearInterval(this.lockTimeKey);
    }

    onOutOfControl() {

    }

    onLeave() {

    }

    leave() {

    }

    onControl(remoteValue) {
        if (!remoteValue.type) {
            console.log(LOG_TYPE.ERROR, 'Client.onControl', '同步命令必须包含操作类型', remoteValue);
        } else {
            Mock.mockEvent(remoteValue);
        }
    }
}

exports = module.exports = Client;