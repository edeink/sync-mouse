const dgram = require('dgram');
const ioHook = require('iohook');
const ncp = require('copy-paste');
const EVENT_TYPE = require('./eventType');
const config = require('./config');
const robot = require('robotjs');

const ips = new Set();

const screenSize = robot.getScreenSize();
const screenWidth = screenSize.width;
const screenHeight = screenSize.height; 
const enterOffset = 50;

function l() {
    console.log(...arguments);
}

function send(obj, ip) {
    if (ip) {
        const message = Buffer.from(JSON.stringify(obj));   
        const client = dgram.createSocket('udp4');
        client.send(message, config.port, ip, (err) => {
            client.close();
        });
    } else if(ips.size > 0) {
        ips.forEach(function(eachIp) {
            l('leave');
            const message = Buffer.from(JSON.stringify(obj));   
            const client = dgram.createSocket('udp4');
            client.send(message, config.port, eachIp, (err) => {
                client.close();
            });
        });
    }
}

const serverClient = {
    send: send,
    init: function() {
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
        ioHook.start();
    },
    _ips: new Set(),
    addIp: function(ip) {
        l('get Ip', ip);
        ips.add(ip);
        send({
            c: EVENT_TYPE.RECIEVE_IP,
        }, ip)
    },
    _isActive: false,
    active: function() {
        serverClient._isActive = true;
        send({
            c: EVENT_TYPE.AFTER_ENTER
        })
    },
    isActive: function() {
        return serverClient._isActive;
    },
    leave: function() {
        serverClient._isActive = false;
        let pos = robot.getMousePos();
        send({
            c: EVENT_TYPE.LEAVE_SCREEN,
            p: {
                x: enterOffset,
                yp: pos.y / screenHeight
            }
        });
    }
}

exports = module.exports = serverClient;
