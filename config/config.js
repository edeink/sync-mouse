const eventHelper = require('../src/helper/eventHelper');

const ENTER_DIRECTION = eventHelper.ENTER_DIRECTION; 

const config = {
    // group: 'edeity', // 基于广播，发现可连接地址，可能受阻于不同网段
    serverIp: '10.13.242.44', // mac ip
    // serverIp:  '10.13.145.52', // pc ip
    port: 41234,
    timeout: 1000, // 网络连接默认的超时时间
    direction: ENTER_DIRECTION.LEFT, // 被控制电脑在主电脑的何处
    // 以下为适配不同电脑，允许进行的操作调整
    accerelate: 2, // 鼠标灵敏度
    doubleclick: 300, // x毫秒内的两次点击会被认为是双击
}

exports = module.exports = config;