const dgram = require('dgram');
const ioHook = require('iohook');
const ncp = require('copy-paste');
const EVENT_TYPE = require('./eventType');
const config = require('./config');

function l() {
    console.log(...arguments);
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
    send({
        c: EVENT_TYPE.MOUSE_DOWN
    })
})

ioHook.on("mouseup", event => {
    send({
        c: EVENT_TYPE.MOUSE_UP
    })
})

ioHook.on("mouseclick", event => {
    send({
        c: EVENT_TYPE.MOUSE_CLICK,
        b: event.button,
    })
})

ioHook.on("mousedrag", event => {
    send({
        c: EVENT_TYPE.MOSUE_DRAG,
        p: {
            x: event.x,
            y: event.y
        }
    })
})

ioHook.on("mousewheel", event => {
    l(event);
    send({
        c: EVENT_TYPE.MOUSE_WHEEL,
        a: event.amount,
        r: event.rotation
    })
})

ioHook.on("mousemove", event => {
    send({
        c: EVENT_TYPE.MOUSE_MOVE, 
        p: {
            x: event.x,
            y: event.y
        }
    });
});

ioHook.on("keydown", event => {
    if (event.ctrlKey && event.keycode === 46) {
        ncp.paste(function(nothing, copyText) {
            send({
                c: EVENT_TYPE.COPY,
                s: copyText
            });
        })
    } else {
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