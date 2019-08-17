const dgram = require('dgram');
const robot = require('robotjs');
const ncp = require('copy-paste');

const config = require('../../config/config');
const SYMBOL = require('../symbol/symbol');
const serverClient = require('./serverConnector');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');
const loggerHelper = require('../helper/logger');

const { l } = loggerHelper;

const serverSocket = dgram.createSocket('udp4');

const OFFSET = eventHelper.OFFSET;
const { screenWidth, screenHeight } = eventHelper.getLocalScreenSize();
const localAddress = connectHelper.getLocalAddress();

let clickPos = robot.getMousePos();
let screenRatio = 1; // 屏幕比率（用来计算鼠标灵敏度）
let remoteSystem = null;
let preDownTime = new Date().getTime();
let preModify = null;
let isCapsLock = false;

const func = {
    isDebug: 1,
    mouseMove: 1,
    mouseClick: 1,
    mouseWheel: 1,
    mouseDrag: 1,
    keyDown: 1,
    copy: 1,
};

const log = {
    mouseMove: 0,
    mouseClick: 0,
    mouseWheel: 0,
    mouseDrag: 0,
    keyDown: 0,
    copy: 0,
};

function getNextPos(offsetPos) {
    let currPos = robot.getMousePos();
    return {
        x: currPos.x + offsetPos.x / screenRatio,
        y: currPos.y + offsetPos.y / screenRatio
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

const server = {
    init() {
        serverClient.init();
        // 接收器
        serverSocket.on('error', (err) => {
            l(`server error:\n${err.stack}`);
            serverSocket.close();
        }); 

        serverSocket.on('message', (msg) => {
            let cmd = JSON.parse(msg.toString());
            if (cmd) {
                switch(cmd.c) {
                    case SYMBOL.SEND_IP:
                        cmdHandler.handleReceiveIp(cmd);
                        break;
                    case SYMBOL.MOUSE_MOVE:
                        cmdHandler.handleMouseMove(cmd);
                        break;
                    case SYMBOL.MOUSE_CLICK:
                        cmdHandler.handleMouseClick(cmd);
                        break;
                    case SYMBOL.MOUSE_WHEEL:
                        cmdHandler.handleMouseWheel(cmd);
                        break;
                    case SYMBOL.MOUSE_DRAG:
                        cmdHandler.handleMouseDrag(cmd);
                        break;
                    case SYMBOL.MOUSE_DOWN: 
                        cmdHandler.handleMouseDown(cmd);
                        break;
                    case SYMBOL.MOUSE_UP:
                        cmdHandler.handleMouseUp(cmd);
                        break;
                    case SYMBOL.KEY_DOWN:
                        cmdHandler.handleKeyDown(cmd);
                        break;
                    case SYMBOL.COPY: 
                        cmdHandler.handleCopy(cmd);
                        break;
                    case SYMBOL.ENTER_SCREEN:
                        cmdHandler.handleEnter(cmd);
                        break;
                    case SYMBOL.QUERY_ACTIVE:
                        cmdHandler.handlerQueryActive(cmd);
                        break;
                    case SYMBOL.BROADCAST_IP:
                        cmdHandler.handleBroadcastIp(cmd);
                        break;
                    case SYMBOL.KEY_UP:
                        cmdHandler.handleKeyUp(cmd);
                        break;
                    default:
                        l('未能识别的命令：', cmd);
                }
            }
        });

        serverSocket.on('listening', () => {
            const address = serverSocket.address();
            l(`服务端启动完成，正在监听数据：${address.address}, 本地地址：${localAddress}:${address.port}`);
        });

        serverSocket.bind(config.port);
    }
};

// 处理器
const cmdHandler = {
    handleMouseMove(cmd) {
        if (func.isDebug && !func.mouseMove) {
            return;
        }
        if (log.mouseMove) {
            l('move', cmd);
        }
        if (serverClient.isActive()) {
            let { x, y } = getNextPos(cmd.p);
            x = x > screenWidth ? screenWidth : x;
            y = y > screenHeight ? screenHeight : y;
            if (eventHelper.isReadyToGoOut(x, y)) {
                if (x < 0) {x = 0;}
                if (y < 0) {y = 0;}
                robot.moveMouseSmooth(x, y);
            } else {
                robot.moveMouse(x, y);
            }
            // 出界时，通知客户端
            if (serverClient.isOutOfScreen(x, y)) {
                serverClient.leave();   
            }
        }
    },
    handleKeyDown(cmd) {
        if (func.isDebug && !func.keyDown) {
            return;
        }
        if (log.keyDown) {
            l('keydown', cmd);
        }
        let keyCode = cmd.k;
        let isModify = eventHelper.isKeyModify(cmd.k);
        if (!isModify) {
            let refCode =  eventHelper.getKeyValue(keyCode);
            let modify = eventHelper.getKeyModify(cmd.m, remoteSystem);
            if(refCode) {
                if (modify) {
                    robot.keyTap(refCode, modify);
                    robot.keyToggle(modify, 'up');
                    if (eventHelper.isCopy(refCode, modify)) {
                        serverClient.sendCopyText();
                    }
                } else {
                    if (isCapsLock === true && eventHelper.isWord(keyCode)) {
                        // 大写输入
                        robot.keyTap(refCode, 'shift')
                    } else {
                        robot.keyTap(refCode);
                    }
                   
                }
            } else {
                if(keyCode === eventHelper.CAPS_LOCK) {
                    isCapsLock = !isCapsLock;
                } else {
                    l('未支持键盘类型：', keyCode); // 比如 capLocks
                }
            }
        } else {
            let modify = eventHelper.getKeyModify(cmd.k, remoteSystem);
            // 处理Control & Command修饰键盘
            if (preModify !== modify) {
                robot.keyTap(modify, modify);
                preModify = modify;
            }
        }
    },
    handleKeyUp(cmd) {
        if (log.keyDown) {
            l('keyup', cmd);
        }
        // 处理修饰键
        let isModify = eventHelper.isKeyModify(cmd.k);
        let modify = eventHelper.getKeyModify(cmd.k, remoteSystem);
        if (isModify) {
            robot.keyToggle(modify, 'up');
            preModify = null;
        }
    },
    handleMouseWheel(cmd) {
        if (func.isDebug && !func.mouseWheel) {
            return;
        }
        if (log.mouseWheel) {
            l('wheel', cmd);
        }
        let amount = cmd.a;
        let rotation = cmd.r;
        let wheelY = 0;
        let offset = amount * 10 * config.sensitivity;
        if(rotation === 1) {
            wheelY = wheelY - offset;
        } else if (rotation === -1) {
            wheelY = wheelY + offset;
        }
        robot.scrollMouse(0, wheelY);
    },
    handleMouseClick(cmd) {
        if (func.isDebug && !func.mouseClick) {
            return;
        }
        if (log.mouseClick) {
            l('click', cmd);
        }
        let button = eventHelper.getMouseClick(cmd.b);
        robot.mouseClick(button);
    },
    handleMouseDrag(cmd) {
        if (func.isDebug && !func.mouseDrag) {
            return;
        }
        if (log.mouseDrag) {
            l('drag', cmd);
        }
        let { x, y } = getDragPos(cmd.p);
        robot.dragMouse(x, y);
    },
    handleMouseDown(cmd) {
        if(func.isDebug && !func.mouseDrag) {
            return;
        }
        if (log.mouseDrag) {
            l('down', cmd);
        }
        clickPos = robot.getMousePos();
        robot.mouseToggle("down");
    },
    handleMouseUp(cmd) {
        if(func.isDebug && !func.mouseDrag) {
            return;
        }
        if (log.mouseDrag) {
            l('up', cmd);
        }
        let currTime = new Date().getTime();
        if (currTime - preDownTime < config.dblclick) {
            robot.mouseToggle("up");
             setTimeout(function() {
                robot.mouseClick('left', true);
             })
        } else {
            robot.mouseToggle("up");
            preDownTime = new Date().getTime();
        }
        
    },
    handleCopy(cmd) {
        if (func.isDebug && !func.copy) {
            return;
        }
        if (log.copy) {
            l('copy', cmd);
        }
        ncp.copy(cmd.s);
    },
    handleEnter(cmd) {
        if (func.isDebug && !func.mouseMove) {
            return;
        }
        if (log.mouseMove) {
            l('enter', cmd);
        }
        let position = cmd.p;
        let screenSize = cmd.s;
        screenRatio = (screenSize.sw / screenWidth).toFixed(2) / config.sensitivity;
        let direction = cmd.d;
        let x, y;
        remoteSystem = cmd.env;
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
    handleReceiveIp(cmd) {
        serverClient.addIp(cmd.addr);
    },
    handlerQueryActive() {
        serverClient.sendActive();
    },
    handleBroadcastIp(cmd) {
        if (cmd.group === config.group) {
            serverClient.addIp(cmd.addr);
        }
    },
};

exports = module.exports = server;