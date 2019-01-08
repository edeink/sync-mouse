/**
 * Created by edeity on 2018/5/2.
 */
const dgram = require('dgram');
const robot = require('robotjs');
const config = require('../config/config');
const EVENT_TYPE = require('../config/eventType');
const ncp = require('copy-paste');
const serverClient = require('./serverClient');
serverClient.init();

const eventHelper = require('../helper/eventHelper');

const server = dgram.createSocket('udp4');
const keyMap = eventHelper.KEY_MAP;
const enterOffset = 50;


const screenSize = robot.getScreenSize();
const screenWidth = screenSize.width;
const screenHeight = screenSize.height; 
const offset = 20;

let clickPos = robot.getMousePos();

const dc = {
    isDebug: 1,
    mouseMove: 1,
    mouseClick: 1,
    mouseWheel: 1,
    mouseDrag: 1,
    keyDown: 1,
    copy: 1,
}

function l() {
    console.log(...arguments)
}

function getNextPos(offsetPos) {
    let currPos = robot.getMousePos();
    return {
        x: currPos.x + offsetPos.x,
        y: currPos.y + offsetPos.y
    }
}

function getDragPos(offsetPos) {
    clickPos.x += offsetPos.x;
    clickPos.y += offsetPos.y;
    return {
        x: clickPos.x,
        y: clickPos.y
    }
}

// 处理器
const cmdHandler = {
    handleMouseMove: function(cmd) {
        if (dc.isDebug && !dc.mouseMove) {
            return;
        }
        // l('move', cmd);
        if (serverClient.isActive()) {
            let { x, y } = getNextPos(cmd.p);
            x = x > screenWidth ? screenWidth : x;
            y = y > screenHeight ? screenHeight : y;
            robot.moveMouse(x, y);
            // 判断是否出界
            if (x > screenWidth - offset) {
                serverClient.leave();
            }
        }
    },
    handleKeyDown: function(cmd) {
        if (dc.isDebug && !dc.keyDown) {
            return;
        }
        l('keydown', cmd);
        let keyMsg = cmd.k;
        let isModify = eventHelper.isKeyModify(cmd.k);
        if (!isModify) {
            let refCode = keyMap[keyMsg];
            if(refCode) {
                let modify = eventHelper.getKeyModify(cmd.m);
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
        l('wheel', cmd);
        let amount = cmd.a;
        let rotation = cmd.r;
        let wheelY = 0;
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
        l('click', cmd);
        let button = eventHelper.getMouseClick(cmd.b);
        robot.mouseClick(button);
    },
    handleMouseDrag: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('drag', cmd);
        let { x, y } = getDragPos(cmd.p);
        robot.dragMouse(x, y);
    },
    handleMouseDown: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('down', cmd);
        clickPos = robot.getMousePos();
        robot.mouseToggle("down");
    },
    handleMouseUp: function(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('up', cmd);
        robot.mouseToggle("up");
    },
    handleCopy: function(cmd) {
        if (dc.isDebug && !dc.copy) {
            return;
        }
        l('copy', cmd);
        ncp.copy(cmd.s);
    },
    handleEnter: function(cmd) {
        if (dc.isDebug && !dc.mouseMove) {
            return;
        }
        // l('enter', cmd);
        let position = cmd.p;
        let direction = cmd.d;
        if (direction === eventHelper.ENTER_DIRECTION.LEFT) {
            let x = screenWidth - enterOffset;
            let y = screenHeight * position.yp;
            robot.moveMouse(x, y);
            serverClient.active();
        }
    },
    handleRecieveIp: function(cmd) {
        serverClient.addIp(cmd.addr);
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
            case EVENT_TYPE.SEND_IP:
                cmdHandler.handleRecieveIp(cmd);
                break;
            case EVENT_TYPE.MOUSE_MOVE:
                cmdHandler.handleMouseMove(cmd);
                break;
            case EVENT_TYPE.MOUSE_CLICK:
                cmdHandler.handleMouseClick(cmd);
                break;
            case EVENT_TYPE.MOUSE_WHEEL:
                cmdHandler.handleMouseWheel(cmd);
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
            case EVENT_TYPE.KEY_DOWN:
                cmdHandler.handleKeyDown(cmd);
                break;
            case EVENT_TYPE.COPY: 
                cmdHandler.handleCopy(cmd);
                break;
            case EVENT_TYPE.ENTER_SCREEN:
                cmdHandler.handleEnter(cmd);
                break;
            default:
                l('未能识别的命令：', cmd);
        }
    }
});

server.on('listening', () => {
   
});

server.bind(config.port);