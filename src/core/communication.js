const os = require('os');
const dgram = require('dgram');
const COM_TYPE = require('./type/comType');
const LOG_TYPE = require('./type/logType');

const networkInterfaces = os.networkInterfaces();
const LOCAL_HOST_ADDRESS = '127.0.0.1';

class Communication {
    constructor() {
        const {address, netmask} = Communication._getLocalNetworkMsg();
        this.port = 41234;
        this.address = address;
        this.netmask = netmask;
        this.partnerAddr = new Set();
    }

    /**
     * 获得发送数据包的数据
     * @param cmd 命令
     * @param value 数据
     *  为了保证数据的拓展性，value必须时一个obj，以下为约定的命名
     *  {
     *      addr: ip地址
     *  }
     * @returns {{c: string}}
     */
    getMsg(cmd, value = '') {
        let msg = {c: cmd};
        if (value) {
            if (typeof value !== 'object') {
                console.log(LOG_TYPE.ERROR, 'Communication.getMsg', '为保证可拓展性，数据必须是一个对象');
            } else {
                msg.v = value;
            }
        }
        return msg;
    };

    // 是否为合法的消息
    isMsg(msg) {
        return msg.c;
    }

    /**
     * 需要在socket.on('listening')后，才能执行其他方法
     * @returns {Promise<>}
     */
    onInit() {
        return new Promise((resolve) => {
            this.udpSocket = dgram.createSocket('udp4');
            this.udpSocket.on('listening', resolve);
            this.udpSocket.bind(this.port, this.address);
        });
    }
    // 接受信息
    onReceiveMsg(callback) {
        this.udpSocket.on('error', (err) => {
            this.udpSocket.close();
            console.log(LOG_TYPE.ERROR, 'Communication.onReceiveMsg', 'socket错误', err);
        });
        this.udpSocket.on('message', (msgBuffer) => {
            let msg = JSON.parse(msgBuffer.toString());
            console.log(LOG_TYPE.LOG_MORE, 'Communication.onReceiveMsg', '收到消息', msg);
            if (this.isMsg(msg)) {
                switch(msg.c) {
                    case COM_TYPE.BROADCAST_ADDRESS: {
                        this._partnerJoin(msg.v);
                        break;
                    }
                    case COM_TYPE.TO_LEAVE: {
                        this._partnerLeave(msg.v);
                        break;
                    }
                }
                callback(msg);
            } else {
                console.log(LOG_TYPE.WARN, 'Communication.onReceiveMsg', '非法数据，丢弃');
            }
        });
    }

    /**
     * 向特定ip发送信息
     * @param {object} msg 发送的信息
     * @param {string} address 发送的ip地址
     * @returns {Promise<>}
     */
    sendMsg(msg, address) {
        const msgBuffer = Buffer.from(JSON.stringify(msg));
        if (msgBuffer.length > 1480) {
            console.log(LOG_TYPE.WARN, 'Communication.sendMsg', '报文大于1480，将进行分包，请留意传输质量');
        }
        return new Promise((resolve, reject) => {
            this.udpSocket.send(msgBuffer, this.port, address, (err) => {
                if (err) {
                    reject(err);
                    this.udpSocket.close();
                    this.udpSocket.createSocket('udp4');
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 向局域网广播信息
     * @param {object} msg 光标的信息
     */
    broadcastMsg(msg) {
        this.udpSocket.setBroadcast(true);
        const msgBuffer = Buffer.from(JSON.stringify(msg));
        const broadcastIp = Communication._getBroadcastAddress(this.address, this.netmask);
        this.udpSocket.send(msgBuffer, 0, msgBuffer.length, this.port, broadcastIp, () => {
            console.log(LOG_TYPE.LOG_SIM, 'Communication.broadcastMsg', '广播消息', msg, this.port, broadcastIp);
            this.udpSocket.setBroadcast(false);
        });
    }
    _partnerJoin(remoteValue) {
        if (!remoteValue.addr) {
            console.log(LOG_TYPE.ERROR, 'Communication._partnerJoin', '广播加入同步组时，必须包含地址', remoteValue);
        } else {
            console.log(LOG_TYPE.LOG_CORE, 'Communication._partnerJoin', '有新的设备加入', remoteValue.addr);
            this.partnerAddr.add(remoteValue.addr);
        }
    }
    _partnerLeave(remoteValue) {
        if (!remoteValue.addr) {
            console.log(LOG_TYPE.ERROR, 'Communication._partnerLeave', '设备退出同步组时，必须包含地址', remoteValue);
        } else {
            console.log(LOG_TYPE.LOG_CORE, 'Communication._partnerLeave', '设备退出', remoteValue.addr);
            this.partnerAddr.delete(remoteValue.addr);
        }
    }
    /**
     * 根据本机ip和子网掩码获取广播地址
     * @param {string} address ip地址
     * @param {string} netmask 子网掩码
     * @returns {string} broadcastAddress 广播地址
     */
    static _getBroadcastAddress(address, netmask) {
        let ipArray = address.split('.');
        let netMaskArray = netmask.split('.');
        let broadcastArray = [];
        for (let i=0; i<4; i++) {
            let ipInt10 = parseInt(ipArray[i], 10);
            let maskInt10 = parseInt(netMaskArray[i], 10);
            let and = ipInt10 & maskInt10;
            let non = 255 ^ maskInt10;
            let or = and|non;
            broadcastArray.push(or);
        }
        return broadcastArray.join('.');
    }
    /**
     * 获取本机的子网掩码和ip地址
     * @returns {{netmask: string, address: string}}
     */
    static _getLocalNetworkMsg() {
        let address = '';
        let netmask = '';
        const networkKeys = Object.keys(networkInterfaces);
        networkKeys.some(function(eachKey) {
            let eachFace = networkInterfaces[eachKey];
            return eachFace.some(function(eachNetworkMsg) {
                const {family, address: _address, netmask: _netmask} = eachNetworkMsg;
                if (family === 'IPv4' && _address !== LOCAL_HOST_ADDRESS && !eachNetworkMsg.internal){
                    address = _address;
                    netmask = _netmask;
                    return true;
                }
                return false;
            });
        });
        return {
            address,
            netmask,
        };
    }
}

exports = module.exports = Communication;