/**
 * Created by edeity on 2018/5/2.
 */
const dgram = require('dgram');
const robot = require('robotjs');
const config = require('./config');
const helper = require('./helper');

const server = dgram.createSocket('udp4');
const keyMap = helper.KEY_MAP;

// 处理器
const cmdHandler = {
    handleMouseMove: function(cmd) {
        let position = cmd.p;
        robot.moveMouse(position.x, position.y);
    },
    handleKeyDown: function(cmd) {
        let keyMsg = cmd.k;
        let refCode = keyMap[keyMsg.k];
        if (refCode) {
            let modify = helper.getKeyModify(keyMsg);
            if (modify) {
                robot.keyTap(refCode, modify);
            } else {
                robot.keyTap(refCode);
            }
        } else {
            console.log('未支持键盘类型：', keyMsg);
        }
    },
    handleMouseClick: function(cmd) {
        let amount = cmd.a;
        let direction = cmd.d;
        let position = robot.getMousePos();
        if(direction === 1) {
            position.y = position.y - amount;
        } else if(direction === 0) {
            position.y = position.y + amount;
        }
        robot.scrollMouse(position.x, position.y);
    },
    handleMouseWheel: function(cmd) {
        let button = helper.getMouseClick(cmd.b);
        robot.mouseClick(button);
    }
}


server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
}); 

server.on('message', (msg, rinfo) => {
    let cmd = JSON.parse(msg.toString());
    if (cmd) {
        switch(cmd.c) {
            case EVENT_TYPE.MOUSE_MOVE:
                cmdHandler.handleMouseMove();
                break;
            case EVENT_TYPE.KEY_DOWN:
                cmdHandler.handleKeyDown();
                break;
            case EVENT_TYPE.MOUSE_CLICK:
                cmdHandler.handleMouseClick();
                break;
            case EVENT_TYPE.MOUSE_WHEEL:
                cmdHandler.handleMouseWheel();
                break;
            default:
                console.log('未能识别的命令：', cmd);
                
        }
    }
});

server.on('listening', () => {
    const address = server.address();
    // console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(config.port);