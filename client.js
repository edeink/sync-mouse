const dgram = require('dgram');
const ioHook = require('iohook');
const ncp = require('copy-paste');
const EVENT_TYPE = require('./eventType');
const config = require('./config');
const robot = require('robotjs');
const helper = require('./helper');

const dc = {
    isDebug: 1,
    mouseMove: 0,
    mouseClick: 1,
    mouseWheel: 1,
    mouseDrag: 1,
    keydown: 0,
    copy: 0,
}

function l() {
    console.log(...arguments);
}

let screenSize = robot.getScreenSize();
let prePos = null;
let isLock = false;
let isFixRightClick = false;
let isFixDrag = false;

function getOffsetPos() {
    let currPos = robot.getMousePos();
    return {
        x: currPos.x - prePos.x,
        y: currPos.y - prePos.y
    }
}

function send(obj) {
    // 创建udp报文
    const message = Buffer.from(JSON.stringify(obj));   
    const client = dgram.createSocket('udp4');
    client.send(message, config.port, config.serverIp, (err) => {
        client.close();
    });
}

ioHook.on("mousedown", event => {
    if (!isLock) { return; }
    if (isFixRightClick) { return; }
    if (dc.isDebug && dc.mouseDrag) {
        l('down', JSON.stringify(event));
    }
    send({
        c: EVENT_TYPE.MOUSE_DOWN
    })
})

ioHook.on("mouseup", event => {
    if (!isLock) { return; }
    if (isFixRightClick) { isFixRightClick = false; return; }
    if (dc.isDebug && dc.mouseDrag) {
        l('up', JSON.stringify(event));
    }
    send({
        c: EVENT_TYPE.MOUSE_UP
    })
})

ioHook.on("mouseclick", event => {
    if (!isLock) { return; }
    if (isFixRightClick) { isFixRightClick = false; return; }
    if (isFixDrag) { isFixDrag = false; return; }
    if (dc.isDebug && dc.mouseClick) {    
        l('click', JSON.stringify(event));
    }
    // 消除右键菜单影响
    if (event.button === helper.MOUSE_MAP.RIGHT) {
        isFixRightClick = true;
        robot.mouseClick();
    }
    send({
        c: EVENT_TYPE.MOUSE_CLICK,
        b: event.button,
    })
})

ioHook.on("mousedrag", event => {
    if (!isLock) { return; }
    if (dc.isDebug && dc.mouseDrag) {
        l('drag', JSON.stringify(event));
    }
    if (!isFixDrag) {
        isFixDrag = true;
    }
    let { x, y } = getOffsetPos();
    robot.moveMouse(prePos.x, prePos.y);
    send({
        c: EVENT_TYPE.MOSUE_DRAG,
        p: {
            x: x,
            y: y
        }
    })
})

ioHook.on("mousewheel", event => {
    if (!isLock) { return; }
    if (dc.isDebug && dc.mouseWheel) {    
        l('wheel', JSON.stringify(event));
    }
    send({
        c: EVENT_TYPE.MOUSE_WHEEL,
        a: event.amount,
        r: event.rotation
    })
})

ioHook.on("mousemove", event => {
    if (!isLock) { return; }
    if (dc.isDebug && dc.mouseMove) {    
        l('move', JSON.stringify(event));
    }
    let { x, y } = getOffsetPos();
    robot.moveMouse(prePos.x, prePos.y);
    send({
        c: EVENT_TYPE.MOUSE_MOVE, 
        p: {
            x: x,
            y: y
        }
    });
});

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
    } 
    // 自定义热键
    else if (event.ctrlKey && event.altKey && helper.isCtrlGlobalKey(keycode)) {
        switch(keycode) {
            case 26: {
                isLock = true;
                prePos = robot.getMousePos();
                break;
            }
            case 27: {
                isLock = false;
                break;
            }

        }
    }
    // 普通键盘
    else {
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

// ncp.paste(function(nothing, txt) {
//     console.log(txt);
// });

// 监听键盘输入
// var stdin = process.stdin;
// stdin.setRawMode( true );
// stdin.resume();
// stdin.setEncoding( 'utf8' );
// stdin.on('data', function( key ){
//     if (key === '\u0003') {
//         process.exit();
//     }
//     send({
//         c: EVENT_TYPE.KEYBOAR,
//         k: key
//     })
// });