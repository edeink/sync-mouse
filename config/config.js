const eventHelper = require('../helper/eventHelper');

const ENTER_DIRECTION = eventHelper.ENTER_DIRECTION; 

const config = {
    // group: 'edeity', // 基于广播，发现可连接地址，可能受阻于不同网段
    serverIp: '10.13.242.44', // mac ip
    // serverIp:  '10.13.145.52', // pc ip
    port: 41234,
    report: 41233,
    timeout: 1000,
    direction: ENTER_DIRECTION.LEFT,
}

exports = module.exports = config;