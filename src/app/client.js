const ioHook = require('iohook');
const ncp = require('copy-paste');
const robot = require('robotjs');
const cpf = require('clipboard-file');

const COMMIST = require('../_comminst/COMMIST');
const config = require('../../config/config');
const clientServer = require('./clientConnector');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');
const loggerHelper = require('../helper/logger');
const utils = require('../helper/util');

const send = connectHelper.send;
const ENTER_DIRECTION = eventHelper.ENTER_DIRECTION;
const OFFSET = eventHelper.OFFSET;
const { screenWidth, screenHeight } = eventHelper.getLocalScreenSize();
const { l, lw, le } = loggerHelper;
const { throttle } = utils;

const dc = {
    isDebug: 1,
    mouseMove: 0,
    mouseClick: 0,
    mouseWheel: 0,
    mouseDrag: 0,
    keydown: 0,
    copy: 0,
}

let prePos = null;
let isLock = false;
let isLockAvailable = true; // 强制取消
let isFixRightClick = false;
let isFixDrag = false;

function getOffsetPos() {
    let currPos = robot.getMousePos();
    return {
        x: currPos.x - prePos.x,
        y: currPos.y - prePos.y
    }
}

// 客户端事件处理
const clientHandler = {
    handleMove: function(x, y) {
        if(Math.abs(x) <= 1 && Math.abs(y) <= 1) { return; }
        if (dc.isDebug && dc.mouseMove) {    
            l('move', x, y);
        }
        robot.moveMouse(prePos.x, prePos.y);
        send({
            c: COMMIST.MOUSE_MOVE, 
            p: {
                x: x,
                y: y
            }
        });
    },
    handleWheel: function(event) {
        let msg = {
            c: COMMIST.MOUSE_WHEEL,
            a: event.amount,
            r: event.rotation
        }
        send(msg);
    },
    handleDrag: function() {
        if (!isFixDrag) {
            isFixDrag = true;
        }
        let { x, y } = getOffsetPos();
        if(x === 0 && y === 0) { return; }
        robot.moveMouse(prePos.x, prePos.y);
        send({
            c: COMMIST.MOSUE_DRAG,
            p: {
                x: x,
                y: y
            }
        })
    },
    handKeyDown: function(event) {
        let keycode = event.keycode;
        // 复制
        if (!isLock && event.ctrlKey && keycode === 46) {
            // 仅在非控制状态下，才传输控制粘贴板文本
            ncp.paste(function(nothing, copyText) {
                if (copyText) {
                    send({
                        c: COMMIST.COPY,
                        s: copyText
                    });
                }
            })
        } else if (event.ctrlKey && event.altKey && eventHelper.isCtrlGlobalKey(keycode)) {    
            // 自定义热键
            switch(keycode) {
                case 26: { clientHandler.forceEnter(); break; }
                case 27: { clientHandler.forceLeave(); break; }
            }
        } else {
            // 普通键盘
            if (!isLock) { return; }
            let msg = {
                c: COMMIST.KEY_DOWN,
                k: event.keycode,
                m: {},
            };
            if (event.altKey) msg.m.a = 1;
            if (event.shiftKey) msg.m.s = 1;
            if (event.ctrlKey) msg.m.c = 1;
            if (event.metaKey) msg.m.m = 1;
            send(msg);
        }
    },
    handleEnter: function(x, y) {
        let isEnter = false;
        let direction = null;
        let lockX, lockY;
        if (!clientServer.isWaitingForEnter()) {
            let currPos = robot.getMousePos();
            switch (config.direction) {
                case ENTER_DIRECTION.LEFT: {
                    direction = ENTER_DIRECTION.LEFT;
                    isEnter = x < OFFSET.LEAVE;
                    lockX = OFFSET.LEAVE;
                    lockY = currPos.y;
                    break;
                }
                case ENTER_DIRECTION.TOP: {
                    direction = ENTER_DIRECTION.TOP;
                    isEnter = y < OFFSET.LEAVE;
                    lockX = currPos.x;
                    lockY = OFFSET.LEAVE;
                    break;
                }
                case ENTER_DIRECTION.RIGHT: {
                    direction = ENTER_DIRECTION.RIGHT;
                    isEnter = x > screenWidth - OFFSET.LEAVE;
                    lockX = screenWidth - OFFSET.LEAVE;
                    lockY = currPos.y;
                    break;
                }
                case ENTER_DIRECTION.BOTTOM: {
                    direction = ENTER_DIRECTION.BOTTOM;
                    ENTER_DIRECTION.BOTTOM;
                    isEnter = y > screenHeight - OFFSET.LEAVE;
                    lockX = currPos.x;
                    lockY = screenHeight - OFFSET.LEAVE;
                    break;
                }
            }
        }
        if (isEnter) {
            clientServer.enter({direction, x: lockX, y: lockY}, function() {
                // 激活服务端的举动
                prePos = { x: lockX, y: lockY};
                isLock = true;
            })
            clientServer.leave(function() {
                // 离开服务端的举动
                isLock = false;
                isLockAvailable = false;
                setTimeout(function() {
                    isLockAvailable = true;
                }, 500);
            });
        }
    },
    // 强制进入连接服务器状态
    forceEnter() {
        isLock = true;
        isLockAvailable = true;
        prePos = robot.getMousePos();
        l('进入锁定模式');
    },
    // 强制退出连接服务器状态
    forceLeave() {
        isLockAvailable = false;
        setTimeout(function() {
            isLock = false;
            isLockAvailable = true;
        }, config.timeout);
        if (isLock === true) {
            robot.moveMouse(screenWidth / 2, screenHeight / 2);
            l('退出锁定模式');
        }
    }
}

// 客户端事件监听
const clientEventListener = {
    init() {

        let throttleMove = throttle(clientHandler.handleMove, 20);
        let throttleWheel = throttle(clientHandler.handleWheel, 20);
        let throttleDrag = throttle(clientHandler.handleDrag, 20);
        let throttleKeyDown = throttle(clientHandler.handKeyDown, 20);

        ioHook.on("mousemove", event => {
            if (isLockAvailable && isLock) {
                let { x, y } = getOffsetPos();
                throttleMove(x, y);
            } else {
                let {x, y} = event;
                clientHandler.handleEnter(x, y);
            }
        });
        
        ioHook.on("mousedown", event => {
            if (isLockAvailable && isLock) {
                if (isFixRightClick) { return; }
                if (dc.isDebug && dc.mouseDrag) {
                    l('down', JSON.stringify(event));
                }
                send({
                    c: COMMIST.MOUSE_DOWN
                })
            }
        })
        
        ioHook.on("mouseup", event => {
            if (isLockAvailable && isLock) {
                if (isFixRightClick) { isFixRightClick = false; return; }
                if (dc.isDebug && dc.mouseDrag) {
                    l('up', JSON.stringify(event));
                }
                send({
                    c: COMMIST.MOUSE_UP
                })
            }
        })
        
        ioHook.on("mouseclick", event => {
            if (isLockAvailable && isLock) { 
                if (isFixRightClick) { isFixRightClick = false; return; }
                if (isFixDrag) { isFixDrag = false; return; }
                if (dc.isDebug && dc.mouseClick) {    
                    l('click', JSON.stringify(event));
                }
                // 仅右键才发送, 左键将被up & down 取代
                if (event.button === eventHelper.MOUSE_MAP.RIGHT) {
                    isFixRightClick = true;
                    if (event.button === eventHelper.MOUSE_MAP.RIGHT) {
                        robot.mouseClick();
                    }
                    send({
                        c: COMMIST.MOUSE_CLICK,
                        b: event.button,
                    })
                }
            }
        })
        
        ioHook.on("mousedrag", event => {
            if (isLockAvailable && isLock) { 
                if (dc.isDebug && dc.mouseDrag) {
                    l('drag', JSON.stringify(event));
                }
                throttleDrag();
            }
        })
        
        ioHook.on("mousewheel", event => {
            if (isLockAvailable && isLock) { 
                if (dc.isDebug && dc.mouseWheel) {    
                    l('wheel', JSON.stringify(event));
                }
                throttleWheel(event);
            }
        })
        
        // 鼠标输入事件
        ioHook.on("keydown", event => {
            if(dc.isDebug && dc.keydown) {    
                l('keydown', JSON.stringify(event));
            }
            throttleKeyDown(event);
        })

        ioHook.on('keyup', event => {
            if(dc.isDebug && dc.keydown) {    
                l('keyup', JSON.stringify(event));
            }
            if (isLock) {
                let msg = {
                    c: COMMIST.KEY_UP,
                    k: event.keycode,
                }
                send(msg);
            }
        })
        
        ioHook.start();        
    }
}

const client = {
    init() {
        // 开启服务端事件监听
        clientEventListener.init();
        // 开启服务器接收器
        clientServer.init();
        clientServer.disconnect(function() {
            clientHandler.forceLeave();
            lw('已和服务器失去连接');
        });
    }
}

exports = module.exports = client;