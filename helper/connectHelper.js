const dgram = require('dgram');
const interfaces = require('os').networkInterfaces();
const config = require('../config/config');


let ip = null;

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
    let realPort = port ? prot : config.port;
    if(Array.isArray(ips)) {
        ips.forEach(function(eachIp) {
            _send(obj, eachIp, realPort);
        })
    } else {
        let ip = ips ? ips : config.serverIp;
        _send(obj, ip, realPort);
    }
}

function getlocalAddress() {
    return ip ? ip : getLocalIp();
}

exports = module.exports = {
    getlocalAddress,
    send,
}