const ioHook = require('iohook');
const robot = require('robotjs');
const ncp = require('copy-paste');

const EVENT_TYPE = require('../config/eventType');
const config = require('../config/config');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');

const OFFSET = eventHelper.OFFSET;
const LEAVE_DIRECTION = eventHelper.LEAVE_DIRECTION;
const send = connectHelper.send;
const ips = new Set();
const { screenWidth, screenHeight } = connectHelper.getLocalScreenSize();
const clientPort = config.report ? config.report : config.port;
const localAddress = connectHelper.getLocalAddress();

function l() {
    console.log(...arguments);
}

function serverSend() {
    send(...arguments, ips, clientPort);
}

const serverClient = {
    init() {
        // 屏蔽：目前ihook有BUG，在mac下无法监听
        // ioHook.on("keydown", event => {
        //     let keycode = event.keycode;
        //     // 复制
        //     l(keycode);
        //     if ((event.ctrlKey || event.metaKey) && keycode === 46) {
        //         ncp.paste(function(nothing, copyText) {
        //             send({
        //                 c: EVENT_TYPE.COPY,
        //                 s: copyText
        //             });
        //         })
        //     } 
        // });
        // ioHook.start();
    },
    _ips: new Set(),
    _enterDirection: null, // 客户端鼠标计入方向
    _isActive: false, // 服务端是否被控制中
    addIp(ip) {
        ips.add(ip);
        send({
            c: EVENT_TYPE.RECIEVE_IP,
        }, ip, clientPort);
    },
    active(direction) {
        serverClient._enterDirection = direction;
        serverClient._isActive = true;
        serverSend({
            c: EVENT_TYPE.AFTER_ENTER
        });
    },
    sendActive() {
        serverSend({
            c: EVENT_TYPE.RECIEVE_ACTIVE,
            addr: localAddress,
        });
    },
    isActive() {
        return serverClient._isActive;
    },
    isOutOfScreen(x, y) {
        switch (serverClient._enterDirection) {
            case LEAVE_DIRECTION.TOP: {
                return y < OFFSET.LEAVE;
            }
            case LEAVE_DIRECTION.RIGHT: {
                return x > screenWidth - OFFSET.LEAVE;
            }
            case LEAVE_DIRECTION.BOTTOM: {
                return y > screenHeight - OFFSET.LEAVE;
            }
            case LEAVE_DIRECTION.LEFT: {
                return x < OFFSET.LEAVE;
            }
        }
        return false;
    },
    leave() {
        serverClient._isActive = false;
        let pos = robot.getMousePos();
        serverSend({
            c: EVENT_TYPE.LEAVE_SCREEN,
            d: serverClient._enterDirection,
            p: {
                xp: pos.x / screenWidth,
                yp: pos.y / screenHeight
            }
        });
    }
}

exports = module.exports = serverClient;
