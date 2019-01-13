const dgram = require('dgram');
const robot = require('robotjs');
const interfaces = require('os').networkInterfaces();

const config = require('../config/config');

let ip = null;
let netmask = null;
let screenSize = null;
let serverIp = config.serverIp;
let broadcastIp = null; // '10.13.159.255'

// 获取本机局域网Ip
function initNetworkMsg() {
    let networkKeys = Object.keys(interfaces);
    networkKeys.some(function(eachKey) {
        let iface = interfaces[eachKey];
        return iface.some(function(eachNetworkMsg) {
            if(eachNetworkMsg.family === 'IPv4' && eachNetworkMsg.address !== '127.0.0.1' && !eachNetworkMsg.internal){  
                ip = eachNetworkMsg.address;  
                netmask = eachNetworkMsg.netmask;
                return true;
            }  
            return false;
        })
    });
    return ip;
}

function setServerIp(serverIp) {
    serverIp = serverIp;
}

function _send(obj, ip, port) {
    const message = Buffer.from(JSON.stringify(obj));   
    const client = dgram.createSocket('udp4');
    client.send(message, port, ip, (err) => {
        client.close();
    });
}

// 广播
function broadcast(obj, port) {
    var socket = dgram.createSocket("udp4");
    socket.bind(function () {
        socket.setBroadcast(true);
        const message = Buffer.from(JSON.stringify(obj));
        const realPort = port ? port : config.port;
        const broadcastIp = _getBroadcastAddress(ip, netmask);
        socket.send(message, 0, message.length, realPort, broadcastIp, function(err, bytes) {
            socket.close();
        });
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
        let ip = ips ? ips : serverIp;
        _send(obj, ip, realPort);
    }
}

// let a = _getBroadcastAddress('197.8.43.211', '255.255.255.240');
// let b = _getBroadcastAddress('192.168.0.1', '255.255.0.0');
// let c = _getBroadcastAddress('10.123.6.11', '255.255.252.0');
// console.log(a, b, c);

function _getBroadcastAddress(ip, netmask) {
    if(broadcastIp) {
        return broadcastIp;
    } else {
        initNetworkMsg();
        let ipArray = ip.split('.');
        let netMaskArray = netmask.split('.');
        let broadcastArray = [];
        for (let i=0; i<4; i++) {
            let ipInt10 = parseInt(ipArray[i], 10);
            let maskInt10 = parseInt(netMaskArray[i], 10);
            let and = ipInt10&maskInt10;
            let non = 255^maskInt10;
            let or = and|non;
            broadcastArray.push(or);
        }
        return broadcastArray.join('.');
    }
}

function getLocalAddress() {
    return ip ? ip : initNetworkMsg();
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
    getLocalAddress,
    getLocalScreenSize,
    send,
    broadcast,
    setServerIp,
}