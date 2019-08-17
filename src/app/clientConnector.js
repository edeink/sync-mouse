/**
 * Created by edeity on 2018/5/2.
 */
const dgram = require('dgram');
const ncp = require('copy-paste');
const robot = require('robotjs');

const config = require('../../config/config');
const SYMBOL = require('../symbol/symbol');

const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');
const loggerHelper = require('../helper/logger');

const server = dgram.createSocket('udp4');
const send = connectHelper.send;
const broadcast = connectHelper.broadcast;
const localAddress = connectHelper.getLocalAddress();
const { screenWidth, screenHeight } = eventHelper.getLocalScreenSize();
const { l, lw, le } = loggerHelper;

const dc = {
    isDebug : 1,
    copy: 1,
};

// 获取本机IP地址

const clientServer = {
    _afterConnect: null, // 和服务器连接完毕
    _afterEnter: null, // 进入服务器
    _afterLeave: null, // 离开服务器
    _afterDisconnect: null, // 和服务器端口连接
    _waitForEnter: false,
    _delayToEnter: false, // 防止多次尝试连接服务器
    _isActive: false, // 检测是否控制服务器
    _isConnect: false, // 检测是否仍和服务器保持链接
    _isNotConnectTime: 0, // 和服务器断开连接次数
    _checkActiveKey: null, // 不断轮询服务器是否激活
    _isFinishSend: false, // 是否收到服务端反馈
    _sendingIpIntervalKey: false, // 等待服务端反馈key
    init() {
        // 处理器
        const cmdHandler = {
            handleCopy(cmd) {
                if (dc.isDebug && !dc.copy) {
                    return;
                }
                ncp.copy(cmd.s);
            },
            handleEnter() {
                clientServer._afterEnter && clientServer._afterEnter();
            },
            handleLeave(cmd) {
                clientServer._afterLeave && clientServer._afterLeave(cmd);
            }
        };
        server.on('error', (err) => {
            le(`server error:\n${err.stack}`);
            server.close();
        }); 

        server.on('message', (msg) => {
            let cmd = JSON.parse(msg.toString());
            if (cmd) {
                switch(cmd.c) {
                    case SYMBOL.RECEIVE_IP:
                        clientServer.receiveServerIp(cmd);
                        break;
                    case SYMBOL.COPY: 
                        cmdHandler.handleCopy(cmd);
                        break;
                    case SYMBOL.AFTER_ENTER: 
                        cmdHandler.handleEnter();
                        break;
                    case SYMBOL.LEAVE_SCREEN:
                        cmdHandler.handleLeave(cmd);
                        break;
                    case SYMBOL.RECEIVE_ACTIVE:
                        clientServer.receiveServerActive();
                        break;
                    case SYMBOL.BROADCAST_IP:
                        // 收到自身的广播，可忽略该命令
                        break;
                    default:
                        lw('未能识别的命令：', cmd);
                }
            }
        });

        server.on('listening', () => {
            const address = server.address();
            l(`客户端启动完成，正在监听数据：${address.address}, 本地地址：${localAddress}:${address.port}`);
            if (config.serverIp) {
                clientServer.sendIp();
            } else if (config.group) {
                clientServer.broadcastIp();
            } else {
                le('参数错误，`config/config.js`必须设置服务器Ip(serverIp)，或所属群组(group)')
            }
        });

        server.bind(config.port, localAddress);
    },
    // 等待服务端反馈
    isWaitingForEnter () {
        return clientServer._waitForEnter;
    },
    /**
     * 请求进入服务端
     * @param cmd
     * @param afterEnterCb
     */
    enter(cmd, afterEnterCb) {
        let { x, y, direction } = cmd;
        if(clientServer._delayToEnter === true) {
            return;
        }
        let pos = robot.getMousePos();
        clientServer._waitForEnter = true;
        clientServer._afterLeave = null;
        // 超过时间，代表服务端无反馈
        let timeoutKey = setTimeout(function() {
            clientServer._waitForEnter = false;
            lw('暂时无法连接服务器, 请稍后再试');
        }, config.timeout);
        robot.moveMouse(x, y);
        robot.mouseClick('left');
        // 收到服务器允许进入后的回调事件
        clientServer._afterEnter = function() {
            clearTimeout(timeoutKey);
            clientServer._waitForEnter = false;
            clientServer._isActive = true;
            clientServer._delayToEnter = true;
            setTimeout(function() {
                clientServer._delayToEnter = false;
            }, config.timeout);
            // l('正在控制服务端');
            afterEnterCb && afterEnterCb();
        };
        let enterFunc = function() {
            send({
                c: SYMBOL.ENTER_SCREEN,
                d: direction,
                p: {
                    xp: pos.x / screenWidth,
                    yp: pos.y / screenHeight,
                },
                s: {
                    sw: screenWidth,
                    sh: screenHeight,
                },
                env: eventHelper.getSystem()
            });
        };
        // 申请进入服务器
        if (clientServer._isConnect === false) {
            clientServer._afterConnect = enterFunc;
            clientServer.sendIp();
        } else {
            enterFunc();
        }
    },
    disconnect(disconnectCb) {
        clientServer._afterDisconnect = disconnectCb;
    },
    // 收到来自服务端的退出请求
    leave(callback) {
        clientServer._afterLeave = function(cmd) {
            clientServer._afterEnter = null;
            clientServer._isActive = false;
            // let xPercent = cmd.p.xp;
            // let yPercent = cmd.p.yp;
            // let x, y;
            // switch (cmd.d) {
            //     case ENTER_SCREEN.TOP: {
            //         // 从上部返回
            //         x = screenWidth * xPercent;
            //         y = OFFSET.ENTER;
            //         break;
            //     }
            //     case ENTER_SCREEN.RIGHT: {
            //         // 从右侧返回
            //         x = screenWidth - OFFSET.ENTER;
            //         y = screenHeight * yPercent;
            //         break;
            //     }
            //     case ENTER_SCREEN.BOTTOM: {
            //         // 从下部返回
            //         x = screenWidth * xPercent;
            //         y = screenHeight - OFFSET.ENTER;
            //         break;
            //     }
            //     case ENTER_SCREEN.LEFT: {
            //         // 从左侧返回
            //         x = OFFSET.ENTER;
            //         y = screenHeight * yPercent;
            //         break;
            //     }
            // }
            // robot.moveMouse(x, y);
            // l('退出控制服务端');
            callback && callback(cmd);
        }
    },
    // 初始化时向服务端提交客户端地址，以方便双向连接
    sendIp() {
        let serverIp = config.serverIp;
        if (!serverIp) {
            lw('无法获取服务端的Ip');
            return;
        }
        send({
            c: SYMBOL.SEND_IP,
            addr: localAddress,
        });
        l('连接服务端：（指定Ip）', config.serverIp);
        if (clientServer._isFinishSend) {
            clearTimeout(clientServer._sendingIpIntervalKey);
        } else {
            // 多次请求连接
            clientServer._sendingIpIntervalKey = setTimeout(function() {        
                clientServer._isNotConnectTime ++;
                if (clientServer._isNotConnectTime === 5) {
                    clientServer._isNotConnectTime = 0;
                    clearTimeout(clientServer._sendingIpIntervalKey);
                    le('已累计5次无法连接服务器，请确保服务器正在运行，或已断开网络连接，稍后再试');
                }  else {
                    clientServer.sendIp();
                }
            }, config.timeout);
        }
    },
    // 通过广播的方式发送Ip地址
    broadcastIp() {
        broadcast({
            c: SYMBOL.BROADCAST_IP,
            group: config.group,
            addr: localAddress,
        });
        l('连接服务端：局域网广播', localAddress);
        if (clientServer._isFinishSend) {
            clearTimeout(clientServer._sendingIpIntervalKey);
        } else {
            // 多次请求连接
            clientServer._sendingIpIntervalKey = setTimeout(function() {        
                clientServer._isNotConnectTime ++;
                if (clientServer._isNotConnectTime === 5) {
                    clientServer._isNotConnectTime = 0;
                    clearTimeout(clientServer._sendingIpIntervalKey);
                    le('已累计5次无法连接服务器，请稍后确保服务器正在运行，或是否属于同一网段（UDP可接受不代表同属同一网段），稍后再试');
                } else {
                    clientServer.broadcastIp();
                }
            }, config.timeout);
        }
    },
    // 收到服务端接受反馈
    receiveServerIp(cmd) {
        clientServer._isFinishSend = true;
        clearInterval(clientServer._sendingIpIntervalKey);
        clientServer._isNotConnectTime = 0;
        if (cmd.addr) {
            connectHelper.setServerIp(cmd.addr);
            l('连接成功', cmd.addr);
        } else {
            l('连接成功');
        }
        clientServer._afterConnect && clientServer._afterConnect();
        clientServer.checkServerActive();
    },
    // 检查服务端是否断开链接
    checkServerActive() {
        send({
            c: SYMBOL.QUERY_ACTIVE
        });
        clientServer._checkActiveKey = setTimeout(function() {        
            // 和服务端失去连接时触发内容
            clientServer._isConnect = false;
            clientServer._isNotConnectTime++;
            // 累计上次将导致无法连接
            if(clientServer._isNotConnectTime === 2) {
                lw('无法连接服务器，将退出连接');
                clientServer._isNotConnectTime = 0;
                clientServer._afterDisconnect && clientServer._afterDisconnect();
                return false;
            } else if(clientServer._isNotConnectTime === 1){
                lw('网络拥堵，请求服务端无响应');
            } 
            clientServer._checkActiveKey = setTimeout(function() {
                clientServer.checkServerActive();
            }, config.timeout);
        }, config.timeout);
    },
    // 收到服务端答复，证明没有断开链接
    receiveServerActive() {
        clientServer._isConnect = true;
        clientServer._isNotConnectTime = 0;
        clearTimeout(clientServer._checkActiveKey);
        // 轮序重复检查
        clientServer._checkActiveKey = setTimeout(function() {
            clientServer.checkServerActive();
        }, config.timeout);
    }
};

exports = module.exports = clientServer;