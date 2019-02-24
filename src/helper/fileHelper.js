const fs = require("fs");
const path = require('path');
const net = require("net");
const COMMIST = require('../_comminst/COMMIST');
const config = require('../../config/config');
const loggerHelper = require('./logger');
const {l, lw, le} = loggerHelper;
const fileData = 'Hello World';

function send(obj, sender) {
    const message = Buffer.from(JSON.stringify(obj));
    sender.write(message);
}

function initServer() {
    const server = net.createServer(function(socket){
        socket.on('data', function(data) {
            l(data.toString());
            if(data.m === COMMIST.READY_TO_RECIEVE_FILE) {
                send(server);
            }
        })
    });
    server.listen(config.tcpPort);
    server.on("listening", function () { l('tpc server is listening') });
    server.on("close", function () {});
    server.on("error", function (err) {});
    server.on("connection", function (socket) {});
    return {
       
    }
}

function initClient() {
    const client = net.Socket();
    client.connect(config.tcpPort, config.serverIp, function () {});
    client.on("data", function (data) {});
    client.on("end", function () {});
    return {
        send(obj) {
            const message = Buffer.from(JSON.stringify(obj));
            client.write(message);
        }
    }
}

exports = module.exports = {
    initServer,
    initClient,
}