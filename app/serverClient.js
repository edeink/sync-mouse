const ioHook = require('iohook');
const robot = require('robotjs');
const ncp = require('copy-paste');

const EVENT_TYPE = require('../config/eventType');
const config = require('../config/config');
const connectHelper = require('../helper/connectHelper');

const send = connectHelper.send;
const ips = new Set();
const { screenWidth, screenHeight } = connectHelper.getLocalScreenSize();
const enterOffset = 50;
const serverPort = config.report ? config.port : config.report;

function l() {
    console.log(...arguments);
}

function serverSend() {
    send(...arguments, ips, serverPort);
}

const serverClient = {
    init: function() {
        ioHook.on("keydown", event => {
            let keycode = event.keycode;
            // 复制
            l(keycode);
            if ((event.ctrlKey || event.metaKey) && keycode === 46) {
                ncp.paste(function(nothing, copyText) {
                    send({
                        c: EVENT_TYPE.COPY,
                        s: copyText
                    });
                })
            } 
        });
        ioHook.start();
    },
    _ips: new Set(),
    addIp: function(ip) {
        ips.add(ip);
        send({
            c: EVENT_TYPE.RECIEVE_IP,
        }, ip);
    },
    _isActive: false,
    active: function() {
        serverClient._isActive = true;
        serverSend({
            c: EVENT_TYPE.AFTER_ENTER
        });
    },
    isActive: function() {
        return serverClient._isActive;
    },
    leave: function() {
        serverClient._isActive = false;
        let pos = robot.getMousePos();
        serverSend({
            c: EVENT_TYPE.LEAVE_SCREEN,
            p: {
                x: enterOffset,
                yp: pos.y / screenHeight
            }
        });
    }
}

exports = module.exports = serverClient;
