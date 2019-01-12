const ioHook = require('iohook');
const ncp = require('copy-paste');
const robot = require('robotjs');

const EVENT_TYPE = require('../config/eventType');
const config = require('../config/config');
const clientServer = require('./clientServer');
const eventHelper = require('../helper/eventHelper');
const connectHelper = require('../helper/connectHelper');

const send = connectHelper.send;
const SCREEN_DIRECTION = connectHelper.SCREEN_DIRECTION;
const { screenWidth, screenHeight } = connectHelper.getLocalScreenSize();

const dc = {
    isDebug: 1,
    mouseMove: 1,
    mouseClick: 0,
    mouseWheel: 0,
    mouseDrag: 0,
    keydown: 0,
    copy: 0,
}

function l() {
    console.log(...arguments);
}

let prePos = null;
let isLock = false;
let isLockAvailable = true; // 强制取消
let isFixRightClick = false;
let isFixDrag = false;
let offset = 20;

function getOffsetPos() {
    let currPos = robot.getMousePos();
    return {
        x: currPos.x - prePos.x,
        y: currPos.y - prePos.y
    }
}

const clientHandler = {
    handleMove: function(x, y) {
        if(Math.abs(x) <= 1 && Math.abs(y) <= 1) { return; }
        if (dc.isDebug && dc.mouseMove) {    
            l('move', JSON.stringify(event), x, y);
        }
        robot.moveMouse(prePos.x, prePos.y);
        send({
            c: EVENT_TYPE.MOUSE_MOVE, 
            p: {
                x: x,
                y: y
            }
        });
    },
    handleEnter: function(x, y) {
        let isEnter = false;
        if (!clientServer.isWaitingForEnter()) {
            switch (config.direction) {
                case SCREEN_DIRECTION.LEFT: {
                    isEnter = x < offset;
                    break;
                }
                case SCREEN_DIRECTION.TOP: {
                    isEnter = y < offset;
                    break;
                }
                case SCREEN_DIRECTION.RIGHT: {
                    isEnter = x > screenWidth - offset;
                    break;
                }
                case SCREEN_DIRECTION.BOTTOM: {
                    isEnter = Y > screenWidth - offset;
                }
            }
        }
        if (isEnter) {
            clientServer.enter(function() {
                let pos = robot.getMousePos();
                pos.x = offset;
                robot.moveMouse(offset, pos.y);
                prePos = robot.getMousePos();
                isLock = true;
                l('after enter');
            });
            clientServer.leave(function() {
                isLock = false;
                isLockAvailable = false;
                setTimeout(function() {
                    isLockAvailable = true;
                }, 500);
                l('after leave');
            });
        }
    }
}

ioHook.on("mousemove", event => {
    if (isLockAvailable && isLock) {
        let { x, y } = getOffsetPos();
        clientHandler.handleMove(x, y);
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
            c: EVENT_TYPE.MOUSE_DOWN
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
            c: EVENT_TYPE.MOUSE_UP
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
            robot.mouseClick();
            send({
                c: EVENT_TYPE.MOUSE_CLICK,
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
        if (!isFixDrag) {
            isFixDrag = true;
        }
        let { x, y } = getOffsetPos();
        if(x === 0 && y === 0) { return; }
        robot.moveMouse(prePos.x, prePos.y);
        send({
            c: EVENT_TYPE.MOSUE_DRAG,
            p: {
                x: x,
                y: y
            }
        })
    }
})

ioHook.on("mousewheel", event => {
    if (isLockAvailable && isLock) { 
        if (dc.isDebug && dc.mouseWheel) {    
            l('wheel', JSON.stringify(event));
        }
        let msg = {
            c: EVENT_TYPE.MOUSE_WHEEL,
            a: event.amount,
            r: event.rotation
        }
        send(msg);
    }
})

ioHook.on("keydown", event => {
    if(dc.isDebug && dc.keydown) {    
        l('keydown', JSON.stringify(event));
    }
    let keycode = event.keycode;
    // 复制
    if (event.ctrlKey && keycode === 46) {
        ncp.paste(function(nothing, copyText) {
            send({
                c: EVENT_TYPE.COPY,
                s: copyText
            });
        })
    } else if (event.ctrlKey && event.altKey && eventHelper.isCtrlGlobalKey(keycode)) {    
        // 自定义热键
        switch(keycode) {
            case 26: {
                isLock = true;
                isLockAvailable = true;
                prePos = robot.getMousePos();
                l('force enter lock');
                break;
            }
            case 27: {
                isLockAvailable = false;
                // 500 毫秒内不允许Lock
                setTimeout(function() {
                    isLock = false;
                    isLockAvailable = true;
                }, 500);
                robot.moveMouse(screenWidth / 2, screenHeight / 2);
                l('force exit lock');
                break;
            }

        }
    } else {
        // 普通键盘
        if (!isLock) {
            return;
        }
        let msg = {
            c: EVENT_TYPE.KEY_DOWN,
            k: event.keycode,
            m: {},
        };
        if (event.altKey) msg.m.a = 1;
        if (event.shiftKey) msg.m.s = 1;
        if (event.ctrlKey) msg.m.c = 1;
        if (event.metaKey) msg.m.m = 1;
        send(msg);
    }
})

ioHook.start();

clientServer.init();