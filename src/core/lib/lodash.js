/**
 * 取代lodash.throttle的方法
 * @param {Function} func 需要防抖处理的方法
 * @param {number} wait 允许调用的最短时间间隔
 * @param {Object} [options={}]
 * @param {boolean} [options.trailing = true] 配置参数，目前仅支持trailing
 * @returns {Function} 防抖处理后的方法
 */
const throttle = function (func, wait, options) {
    const trailing = !(options && options.trailing === false);
    let prevTimeStamp = Date.now(), context;
    let lastTimeoutKey;
    let lastCallResult = null; // lodash执行时需要返回最后一次执行结果

    if (!Number(wait)) {
        wait = 16;
    }

    return function (...args) {
        context = this;
        let nowTimeStamp = Date.now();
        let passTime = nowTimeStamp - prevTimeStamp;
        //  第一次执行
        if (typeof lastTimeoutKey === 'undefined') {
            prevTimeStamp = nowTimeStamp;
            lastTimeoutKey = -1;
            lastCallResult = func.apply(this, args);
            return lastCallResult;
        } else {
            // 第N次执行
            if (passTime < wait) {
                if (lastTimeoutKey === -1) {
                    // 没有设置定时器
                    lastTimeoutKey = setTimeout(function() {
                        if (trailing !== false) {
                            lastCallResult = func.apply(context, args);
                        }
                        lastTimeoutKey = -1;
                    }, wait - passTime);
                }
                return lastCallResult;
            }
            prevTimeStamp = nowTimeStamp;
            lastCallResult = func.apply(this, args);
            return lastCallResult;
        }
    }
};

exports = module.exports = {
    throttle
};
