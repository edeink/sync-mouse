const eventHelper = require('../helper/eventHelper');

const ENTER_DIRECTION = eventHelper.ENTER_DIRECTION; 

const config = {
    serverIp: '10.13.242.44', // mac ip
    // serverIp:  '10.13.145.52', // pc ip
    port: 41234,
    report: 41233,
    timeout: 1000,
    direction: ENTER_DIRECTION.LEFT,
}

exports = module.exports = config;