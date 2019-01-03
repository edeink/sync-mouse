const dgram = require('dgram');
const ioHook = require('iohook');
const ncp = require('copy-paste');
const EVENT_TYPE = require('./eventType');
const config = require('./config');


function send(obj) {
    // 创建udp报文
    const message = Buffer.from(JSON.stringify(obj));   
    const client = dgram.createSocket('udp4');
    client.send(message, config.port, config.ip, (err) => {
        client.close();
    });
}

ioHook.on("mouseclick", event => {
    send({
        c: EVENT_TYPE.MOUSE_CLICK,
        b: event.button,
    })
})

ioHook.on("mousewheel", event => {
    send({
        c: EVENT_TYPE.MOUSE_WHEEL,
        a: event.amount,
        d: event.direction === 3 ? 1 : 0
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
    let msg = {
        c: EVENT_TYPE.KEY_DOWN,
        k: {
            k: event.keycode,
        }
    };
    if (event.altKey) msg.k.a = 1;
    if (event.shiftKey) msg.k.s = 1;
    if (event.ctrlKey) msg.k.c = 1;
    if (event.metaKey)msg.k.m = 1;
    if (event.ctrlKey && event.keycode === 47) {
        console.log(event);
    } else {
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