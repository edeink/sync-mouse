const net = require("net");
const config = require('../../config/config');
const loggerHelper = require('./logger');

const client = null;

function send(obj) {
    const message = Buffer.from(JSON.stringify(obj));
    client.write(message);
}

function initClient() {
    const client = net.Socket();
    client.connect(config.tcpPort, config.serverIp, function () {});
    client.on("data", function (data) {});
    client.on("end", function () {});   
}

exports = module.exports = {
    initClient,
    send,
}