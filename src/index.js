const Client = require('./core/client');
const LOG_TYPE = require('./core/type/logType');

// 日志
let preLog = console.log;
const enableLogType = [LOG_TYPE.ERROR, LOG_TYPE.WARN, LOG_TYPE.LOG_CORE];
console.log = function (type, func, tip, ...args) {
    if (enableLogType.indexOf(type) !== -1) {
        // 格式化
        let length = func.length;
        for (let i = 0; i <30-length; i++) {
            func += ' ';
        }
        func = `  [  ${func}  ]  `;

        let tipLen = tip.length;
        if (tip) {
            for (let i = 0; i <20-tipLen; i++) {
                tip += '-';
            }
        }
        tip = ` ------ ${tip}      `;

        switch (type) {
            case LOG_TYPE.ERROR: { console.error(func, tip, ...args); break; }
            case LOG_TYPE.WARN: { console.warn(func, tip, ...args); break; }
            case LOG_TYPE.LOG_MORE:
            case LOG_TYPE.LOG_SIM:
            case LOG_TYPE.LOG_CORE:
            default:
                preLog(func, tip, ...args);
        }
    }
};

// 启动程序
const client = new Client();
client.start();