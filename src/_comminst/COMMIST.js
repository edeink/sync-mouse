/**
 * 通讯指令
 */
const COMMIST =  {
    MOUSE_MOVE: 0, // 鼠标移动
    MOUSE_CLICK: 1, // 鼠标点击
    MOUSE_WHEEL: 2, // 鼠标滑动
    MOUSE_DOWN: 3, // 鼠标按钮下
    MOUSE_UP: 4, // 鼠标松开
    MOSUE_DRAG: 5, // 鼠标拖拽
    KEY_DOWN: 6, // 键盘按下
    KEY_UP: 7, // 键盘松开
    COPY: 8,  // 复制
    PASTE: 9, // 粘贴
    ENTER_SCREEN: 10, // 进入控制
    AFTER_ENTER: 11, // 进入后
    LEAVE_SCREEN: 12, // 离开控制
    AFTER_LEAVE: 13, // 离开后
    SEND_IP: 14, // 发送ip
    RECIEVE_IP: 15, // 接受ip
    QUERY_ACTIVE: 16, // 查询是否活跃
    RECIEVE_ACTIVE: 17, // 存活
    BROADCAST_IP: 18, // 广播地址
    READY_TO_RECIEVE_FILE: 19,
}

exports = module.exports = COMMIST;