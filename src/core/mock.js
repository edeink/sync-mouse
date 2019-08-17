const OPT_TYPE = require('./type/optType');
const LOG_TYPE = require('./type/logType');

class Mock {
    static mockEvent(event) {
        switch (event.type) {
            case OPT_TYPE.MOUSE_UP: {
                Mock.mockMouseUp(event);
                break;
            }
            case OPT_TYPE.MOUSE_DOWN: {
                Mock.mockMouseDown(event);
                break;
            }
            case OPT_TYPE.MOUSE_MOVE: {
                Mock.mockMouseMove(event);
                break;
            }
            case OPT_TYPE.MOUSE_CLICK: {
                Mock.mockMouseClick(event);
                break;
            }
            case OPT_TYPE.MOUSE_DRAG: {
                Mock.mockMouseDrag(event);
                break;
            }
            case OPT_TYPE.KEY_DOWN: {
                Mock.mockKeyDown(event);
                break;
            }
            case OPT_TYPE.KEY_UP: {
                Mock.mockKeyUp(event);
                break;
            }
        }
    }
    static mockMouseUp(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockMouseUp', '正在同步', JSON.stringify(event));
    }
    static mockMouseDown(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockMouseDown', '正在同步', JSON.stringify(event));
    }
    static mockMouseMove(event) {
        console.log(LOG_TYPE.LOG_MORE, 'Mock.mockMouseMove', '正在同步', JSON.stringify(event));
    }
    static mockMouseClick(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockMouseClick', '正在同步', JSON.stringify(event));
    }
    static mockMouseDrag(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockMouseDrag', '正在同步', JSON.stringify(event));
    }
    static mockKeyUp(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockKeyUp', '正在同步', JSON.stringify(event));
    }
    static mockKeyDown(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockKeyDown', '正在同步', JSON.stringify(event));
    }
    static mockCopy(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockCopy', '正在同步', JSON.stringify(event));
    }
    static mockPaste(event) {
        console.log(LOG_TYPE.LOG_SIM, 'Mock.mockPaste', '正在同步', JSON.stringify(event));
    }
}

exports = module.exports = Mock;