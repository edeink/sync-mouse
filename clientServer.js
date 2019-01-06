/**
 * Created by edeity on 2018/5/2.
 */
const dgram = require('dgram');
const config = require('./config');
const EVENT_TYPE = require('./eventType');
const ncp = require('copy-paste');
const helper = require('./helper');
const robot = require('robotjs');
const interfaces = require('os').networkInterfaces(); // 在开发环境中获取局域网中的本机iP地址

const server = dgram.createSocket('udp4');

function l() {
    console.log(...arguments)
}

const dc = {
    isDebug : 1,
    copy: 1,
}

const screenSize = robot.getScreenSize();
const screenWidth = screenSize.width;
const screenHeight = screenSize.height; 

// 获取本机IP地址
let localAddress = '';
for(var devName in interfaces){  
    var iface = interfaces[devName];  
    for(var i=0;i<iface.length;i++){  
        var alias = iface[i];  
        if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
            localAddress = alias.address;  
        }  
    }  
} 

function send(obj) {
    // 创建udp报文
    const message = Buffer.from(JSON.stringify(obj));   
    const client = dgram.createSocket('udp4');
    client.send(message, config.port, config.serverIp, (err) => {
        client.close();
    });
}

const clientServer = {
    init: function() {
        // 处理器
        const cmdHandler = {
            handleCopy: function(cmd) {
                if (dc.isDebug && !dc.copy) {
                    return;
                }
                l(cmd);
                ncp.copy(cmd.s);
            },
            handleEnter: function() {
                clientServer._afterEnter && clientServer._afterEnter();
            },
            handleLeave: function(cmd) {
                clientServer._afterLeave && clientServer._afterLeave(cmd);
            }
        };
        server.on('error', (err) => {
            l(`server error:\n${err.stack}`);
            server.close();
        }); 

        server.on('message', (msg, rinfo) => {
            let cmd = JSON.parse(msg.toString());
            if (cmd) {
                switch(cmd.c) {
                    case EVENT_TYPE.RECIEVE_IP:
                        clientServer.finishSendIp();
                        break;
                    case EVENT_TYPE.COPY: 
                        cmdHandler.handleCopy(cmd);
                        break;
                    case EVENT_TYPE.AFTER_ENTER: 
                        cmdHandler.handleEnter();
                        break;
                    case EVENT_TYPE.LEAVE_SCREEN:
                        cmdHandler.handleLeave(cmd);
                        break;
                    default:
                        l('未能识别的命令：', cmd);
                }
            }
        });

        server.bind(config.port);
        clientServer.sendIp();
    },
    // 跳转到别的ip地址
    _afterEnter: null,
    _afterLeave: null,
    _waitforEnter: false,
    _isActive: false,
    isActive() {
        return clientServer._isActive;
    },
    isWaitingForEnter: function () {
        return clientServer._waitforEnter;
    },
    enter: function(callback) {
        let direction = helper.ENTER_DIRECTION.LEFT;
        let pos = robot.getMousePos();
        clientServer._waitforEnter = true;
        clientServer._afterLeave = null;
        clientServer._afterEnter = function() {
            clientServer._waitforEnter = false;
            clientServer._isActive = true;
            callback && callback();
        }
        send({
            c: EVENT_TYPE.ENTER_SCREEN,
            d: direction,
            p: {
                xp: pos.x / screenWidth,
                yp: pos.y / screenHeight,
            }
        });
    },
    leave: function(callback) {
        clientServer._afterLeave = function(cmd) {
            clientServer._afterEnter = null;
            clientServer._isActive = false;
            let pos = cmd.p;
            let y = pos.yp * screenHeight;
            robot.moveMouse(pos.x, y);
            callback && callback(cmd);
        }
    },
    _isFinishSend: false,
    _sendingIpIntervalKey: false,
    sendIp() {
        send({
            c: EVENT_TYPE.SEND_IP,
            addr: localAddress,
        });
        clientServer._sendingIpIntervalKey = setInterval(function() {
            if(clientServer._isFinishSend) {
                clearInterval(clientServer._sendingIpIntervalKey);
            } else {
                send({
                    c: EVENT_TYPE.SEND_IP,
                    addr: localAddress,
                })
            }
        }, 3000);
    },
    finishSendIp() {
        l('finish send ip');
        clientServer._isFinishSend = true;
        clearInterval(clientServer._sendingIpIntervalKey);
    }
}

exports = module.exports = clientServer;