const dgram = require('dgram');
const interfaces = require('os').networkInterfaces();

const config = require('../config/config');
const debugHelper = require('../helper/debugHelper');
const client = dgram.createSocket('udp4');

let ip = null;
let netmask = null;
let serverIp = config.serverIp;
let broadcastIp = null; // '10.13.159.255'

const {l, lw, le} = debugHelper;

// 获取本机局域网Ip
function initNetworkMsg() {
    let networkKeys = Object.keys(interfaces);
    networkKeys.some(function(eachKey) {
        let iface = interfaces[eachKey];
        return iface.some(function(eachNetworkMsg) {
            if (eachNetworkMsg.family === 'IPv4' && eachNetworkMsg.address !== '127.0.0.1' && !eachNetworkMsg.internal){  
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
    if (message > 1480) {
        lw('报文大于1480，将进行分包，请留意传输质量');
    }
    client.send(message, port, ip, (err) => {
        if (err) {
            lw('udp报文发送出错：', err);
            client.close();        
            client = dgram.createSocket('udp4');
        }
    });
}

// 广播
function broadcast(obj, port) {
    var socket = dgram.createSocket("udp4");
    socket.bind(port, ip, function () {
        socket.setBroadcast(true);
        const message = Buffer.from(JSON.stringify(obj));
        const realPort = port ? port : config.port;
        // const broadcastIp = _getBroadcastAddress(ip, netmask);
        _getBroadcastAddress
        const broadcastIp = _getBroadcastAddress(ip, '255.255.254.0');
        l('广播消息', obj, realPort, broadcastIp);
        socket.send(message, 0, message.length, realPort, broadcastIp, function(err, bytes) {
            socket.close();
        });
    });
}

// 发送udp报文
function send(obj, ips, port) {
    let realPort = port ? port : config.port;
    if (ips && ips.forEach) {
        ips.forEach(function(eachIp) {
            _send(obj, eachIp, realPort);
        })
    } else {
        let ip = ips ? ips : serverIp;
        _send(obj, ip, realPort);
    }
}

function _getBroadcastAddress(ip, netmask) {
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

function getLocalAddress() {
    return ip ? ip : initNetworkMsg();
}

exports = module.exports = {
    getLocalAddress,
    send,
    broadcast,
    setServerIp,
}