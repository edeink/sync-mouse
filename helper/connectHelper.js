const dgram = require('dgram');
const robot = require('robotjs');
const interfaces = require('os').networkInterfaces();

const config = require('../config/config');


let ip = null;
let screenSize = null;


const SCREEN_DIRECTION = {
    TOP: 'TOP',
    RIGTH: 'RIGHT',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT',
}

// 获取本机局域网Ip
function getLocalIp() {
    let networkKeys = Object.keys(interfaces);
    networkKeys.some(function(eachKey) {
        let iface = interfaces[eachKey];
        return iface.some(function(alias) {
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                ip = alias.address;  
                return true;
            }  
            return false;
        })
    });
    return ip;
}

function _send(obj, ip, port) {
    const message = Buffer.from(JSON.stringify(obj));   
    const client = dgram.createSocket('udp4');
    client.send(message, port, ip, (err) => {
        client.close();
    });
}

// 发送udp报文
function send(obj, ips, port) {
    let realPort = port ? port : config.port;
    if(ips && ips.forEach) {
        ips.forEach(function(eachIp) {
            _send(obj, eachIp, realPort);
        })
    } else {
        let ip = ips ? ips : config.serverIp;
        _send(obj, ip, realPort);
    }
}

function getLocalAddress() {
    return ip ? ip : getLocalIp();
}

function getLocalScreenSize() {
    if (screenSize) {
        return screenSize;
    } else {
        let screenSize = robot.getScreenSize();
        return {
            screenWidth: screenSize.width,
            screenHeight: screenSize.height,
        }
    }
}

exports = module.exports = {
    SCREEN_DIRECTION,
    getLocalAddress,
    getLocalScreenSize,
    send,
}