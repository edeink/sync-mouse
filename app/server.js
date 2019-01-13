const dgram = require('dgram');
const robot = require('robotjs');
const ncp = require('copy-paste');

const config = require('../config/config');
const EVENT_TYPE = require('../config/eventType');
const serverClient = require('./serverSender');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');

const server = dgram.createSocket('udp4');

const keyMap = eventHelper.KEY_MAP;
const OFFSET = eventHelper.OFFSET;
const { screenWidth, screenHeight } = connectHelper.getLocalScreenSize();
const localAddress = connectHelper.getLocalAddress();

let clickPos = robot.getMousePos();

serverClient.init();

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

// 接收器
server.on('error', (err) => {
    l(`server error:\n${err.stack}`);
    server.close();
}); 

server.on('message', (msg, rinfo) => {
    let cmd = JSON.parse(msg.toString());
    l(cmd);
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
            case EVENT_TYPE.QUERY_ACTIVE:
                cmdHandler.handlerQueryActive(cmd);
                break;
            case EVENT_TYPE.BROADCAST_IP:
                l('接受到广播信息', cmd);
                cmdHandler.handleBroadcastIp(cmd);
                // break;
            default:
                l('未能识别的命令：', cmd);
        }
    }
});

server.on('listening', () => {
    const address = server.address();
    l(`服务端启动完成，正在监听数据：${address.address}, 本地地址：${localAddress}:${address.port}`);
});

server.bind(config.port);

// 处理器
const cmdHandler = {
    handleMouseMove(cmd) {
        if (dc.isDebug && !dc.mouseMove) {
            return;
        }
        // l('move', cmd);
        if (serverClient.isActive()) {
            let { x, y } = getNextPos(cmd.p);
            x = x > screenWidth ? screenWidth : x;
            y = y > screenHeight ? screenHeight : y;
            robot.moveMouse(x, y);
            // 出界时，通知客户端
            if (serverClient.isOutOfScreen(x, y)) {
                serverClient.leave();   
            }
        }
    },
    handleKeyDown(cmd) {
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
    handleMouseWheel(cmd) {
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
    handleMouseClick(cmd) {
        if(dc.isDebug && !dc.mouseClick) {
            return;
        }
        l('click', cmd);
        let button = eventHelper.getMouseClick(cmd.b);
        robot.mouseClick(button);
    },
    handleMouseDrag(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('drag', cmd);
        let { x, y } = getDragPos(cmd.p);
        robot.dragMouse(x, y);
    },
    handleMouseDown(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('down', cmd);
        clickPos = robot.getMousePos();
        robot.mouseToggle("down");
    },
    handleMouseUp(cmd) {
        if(dc.isDebug && !dc.mouseDrag) {
            return;
        }
        l('up', cmd);
        robot.mouseToggle("up");
    },
    handleCopy(cmd) {
        if (dc.isDebug && !dc.copy) {
            return;
        }
        l('copy', cmd);
        ncp.copy(cmd.s);
    },
    handleEnter(cmd) {
        if (dc.isDebug && !dc.mouseMove) {
            return;
        }
        l('enter', cmd);
        let position = cmd.p;
        let direction = cmd.d;
        let x, y;
        switch (direction) {
            case eventHelper.ENTER_DIRECTION.TOP: {
                // 上边界，即从下部进入
                x = screenWidth * position.xp;
                y = screenHeight - OFFSET.ENTER;
                break;
            }
            case eventHelper.ENTER_DIRECTION.RIGHT: {
                // 右边界，即从左侧进入
                x = OFFSET.ENTER;
                y = screenHeight * position.yp;
                break;
            }
            case eventHelper.ENTER_DIRECTION.BOTTOM: {
                // 下边界，即从上部进入
                x = screenWidth * position.xp;
                y = OFFSET.ENTER;
                break;
            }
            case eventHelper.ENTER_DIRECTION.LEFT: {
                // 左边界，即从右侧进入
                x = screenWidth - OFFSET.ENTER;
                y = screenHeight * position.yp;
                break;
            }
        }
        robot.moveMouse(x, y);
        serverClient.active(direction);
    },
    handleRecieveIp(cmd) {
        serverClient.addIp(cmd.addr);
    },
    handlerQueryActive(cmd) {
        serverClient.sendActive();
    },
    handleBroadcastIp(cmd) {
        if (cmd.group === config.group) {
            serverClient.sendActive();
        }
    }
}