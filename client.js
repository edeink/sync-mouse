const dgram = require('dgram');
const ioHook = require('iohook');

ioHook.on("mousemove", event => {
    console.log(event);
    /* prints :
     {
     type: 'mousemove',
     x: 700,
     y: 400
     }
     */
});
ioHook.start();

// 监听键盘输入
var stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );
stdin.on('data', function( key ){
    if ( key === '\u0003' ) {
        process.exit();
    }

    // process.stdout.write( key );

    const message = Buffer.from(key);

    // 创建udp报文
    const client = dgram.createSocket('udp4');
    client.send(message, 41234, '172.26.149.1', (err) => {
        client.close();
    });
});

// myEmitter.emit('mouseMove')
// var robot = require("robotjs")
// robot.moveMouseSmooth(100, 100)