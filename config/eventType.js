/**
 * 通讯事件
 */
const EVENT_TYPE =  {
    MOUSE_MOVE: 0,
    KEY_DOWN: 1,
    MOUSE_CLICK: 2,
    MOUSE_WHEEL: 3,
    MOSUE_DRAG: 6,
    COPY: 4,
    PASTE: 5,
    MOUSE_DOWN: 7,
    MOUSE_UP: 8,
    ENTER_SCREEN: 9,
    AFTER_ENTER: 10,
    SEND_IP: 11,
    RECIEVE_IP: 12,
    LEAVE_SCREEN: 13,
    AFTER_LEAVE: 14,
    QUERY_ACTIVE: 15,
    RECIEVE_ACTIVE: 16,
}

exports = module.exports = EVENT_TYPE;