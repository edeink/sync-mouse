const ioHook = require('iohook');
const OPT_TYPE = require('./type/optType');
const {throttle} = require('./lib/lodash');

class Hook {
    static onEvent(callback) {
        Hook.onMouseMove(callback);
        Hook.onMouseUp(callback);
        Hook.onMouseDown(callback);
        Hook.onMouseClick(callback);
        Hook.onMouseDrag(callback);
        Hook.onKeyDown(callback);
        Hook.onKeyUp(callback);
        ioHook.start(false);
    }
    static stopListen() {
        ioHook.stop();
    }
    static onMouseUp(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.MOUSE_UP, throttleCb);
    }
    static onMouseDown(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.MOUSE_DOWN, throttleCb);
    }
    static onMouseMove(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.MOUSE_MOVE, throttleCb);
    }
    static onMouseClick(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.MOUSE_CLICK, throttleCb);
    }
    static onMouseDrag(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.MOUSE_DRAG, throttleCb);
    }
    static onKeyDown(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.KEY_DOWN, throttleCb);
    }
    static onKeyUp(callback) {
        let throttleCb = throttle(callback, 16, {trailing: false});
        ioHook.on(OPT_TYPE.KEY_UP, throttleCb);
    }
    static onCopy() {

    }
    static onPaste() {

    }
}

exports = module.exports = Hook;