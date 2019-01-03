/**
 * Created by edeity on 2018/5/2.
 */
const dgram = require('dgram');
const robot = require('robotjs');
const config = require('./config');
const helper = require('./helper');
const EVENT_TYPE = require('./eventType');
const ncp = require('copy-paste');

const server = dgram.createSocket('udp4');
const keyMap = helper.KEY_MAP;

function l() {
    console.log(...arguments)
}

const dc = {
    isDebug : 1,
    mouseMove: 1,
    mouseClick: 0,
    mouseWheel: 1,
    mouseDrag: 1,
    keyDown: 0,
    copy: 1,
}

// 处理器
const cmdHandler = {
    handleMouseMove: function(cmd) {
        if (dc.isDebug && !dc.mouseMove) {
            return;
        }
        let position = cmd.p;
        robot.moveMouse(position.x, position.y);
    },
    handleKeyDown: function(cmd) {
        if (dc.isDebug && !dc.keyDown) {
            return;
        }
        let keyMsg = cmd.k;
        let isModify = helper.isKeyModify(cmd.k);
        if (!isModify) {
            let refCode = keyMap[keyMsg];
            if(refCode) {
                let modify = helper.getKeyModify(cmd.m);
                if (modify) {
                    
                } else {
                    robot.keyTap(refCode);
                }
            } else {
                l('未支持键盘类型：', keyMsg);
            }
        }
    },
    handleMouseWheel: function(cmd) {
        if (dc.isDebug && !dc.mouseWheel) {
            return;
        }
        let amount = cmd.a;
        let rotation = cmd.r;
        let wheelY = 0;
        // let position = robot.getMousePos();
        if(rotation === 1) {
            wheelY = wheelY - amount * 10;
        } else if (rotation === -1) {
            wheelY = wheelY + amount * 10;
        }
        robot.scrollMouse(0, wheelY);
    },
    handleMouseClick: function(cmd) {
        if(dc.isDebug && !dc.mouseClick) {
            return;
        }
        let button = helper.getMouseClick(cmd.b);
        robot.mouseClick(button);
    },
    handleMouseDrag: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        let position = cmd.p;
        robot.dragMouse(position.x, position.y);
    },
    handleMouseDown: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        robot.mouseToggle("down");
    },
    handleMouseUp: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        robot.mouseToggle("up");
    },
    handleCopy: function(cmd) {
        if (dc.isDebug && !dc.copy) {
            return;
        }
        ncp.copy(cmd.s);
    }
}


server.on('error', (err) => {
    l(`server error:\n${err.stack}`);
    server.close();
}); 

server.on('message', (msg, rinfo) => {
    let cmd = JSON.parse(msg.toString());
    if (cmd) {
        switch(cmd.c) {
            case EVENT_TYPE.MOUSE_MOVE:
                cmdHandler.handleMouseMove(cmd);
                break;
            case EVENT_TYPE.MOUSE_CLICK:
                cmdHandler.handleMouseClick(cmd);
                break;
            case EVENT_TYPE.MOUSE_WHEEL:
                cmdHandler.handleMouseWheel(cmd);
                break;
            case EVENT_TYPE.KEY_DOWN:
                cmdHandler.handleKeyDown(cmd);
                break;
            case EVENT_TYPE.COPY: 
                cmdHandler.handleCopy(cmd);
                break;
            case EVENT_TYPE.MOSUE_DRAG:
                cmdHandler.handleMouseDrag(cmd);
                break;
            case EVENT_TYPE.MOUSE_DOWN: 
                cmdHandler.handleMouseDown(cmd);
                break;
            case EVENT_TYPE.MOUSE_UP:
                cmdHandler.handleMouseUp(cmd);
                break;
            default:
                l('未能识别的命令：', cmd);
        }
    }
});

server.on('listening', () => {
    const address = server.address();
    // l(`server listening ${address.address}:${address.port}`);
});

server.bind(config.port);