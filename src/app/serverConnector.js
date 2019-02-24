const robot = require('robotjs');
const ncp = require('copy-paste');

const COMMIST = require('../_comminst/COMMIST');
const config = require('../../config/config');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');

const OFFSET = eventHelper.OFFSET;
const LEAVE_DIRECTION = eventHelper.LEAVE_DIRECTION;
const send = connectHelper.send;
const ips = new Set();
const { screenWidth, screenHeight } = eventHelper.getLocalScreenSize();
const clientPort = config.port;
const localAddress = connectHelper.getLocalAddress();

function l() {
    console.log(...arguments);
}

function serverSend() {
    send(...arguments, ips, clientPort);
}

const serverClient = {
    init() {
    },
    _ips: new Set(),
    _enterDirection: null, // 客户端鼠标计入方向
    _isActive: false, // 服务端是否被控制中
    addIp(ip) {
        ips.add(ip);
        send({
            c: COMMIST.RECIEVE_IP,
            addr: localAddress,
        }, ip, clientPort);
    },
    active(direction) {
        serverClient._enterDirection = direction;
        serverClient._isActive = true;
        serverSend({
            c: COMMIST.AFTER_ENTER
        });
    },
    sendActive() {
        serverSend({
            c: COMMIST.RECIEVE_ACTIVE,
            addr: localAddress,
        });
    },
    isActive() {
        return serverClient._isActive;
    },
    isOutOfScreen(x, y) {
        let leaveOffset = OFFSET.SERVER_LEAVE;
        switch (serverClient._enterDirection) {
            case LEAVE_DIRECTION.TOP: {
                return y <= leaveOffset;
            }
            case LEAVE_DIRECTION.RIGHT: {
                return x >= screenWidth - leaveOffset;
            }
            case LEAVE_DIRECTION.BOTTOM: {
                return y >= screenHeight - leaveOffset;
            }
            case LEAVE_DIRECTION.LEFT: {
                return x <= leaveOffset;
            }
        }
        return false;
    },
    leave() {
        serverClient._isActive = false;
        let pos = robot.getMousePos();
        serverSend({
            c: COMMIST.LEAVE_SCREEN,
            d: serverClient._enterDirection,
            p: {
                xp: pos.x / screenWidth,
                yp: pos.y / screenHeight
            }
        });
    },
    sendCopyText() {
        ncp.paste(function(nothing, copyText) {
            serverSend({
                c: COMMIST.COPY,
                s: copyText,
            });
        })
    }
}

exports = module.exports = serverClient;
