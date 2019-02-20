/**
 * 取代lodash.throttle的方法，
 * @param func 需要防抖处理的方法
 * @param wait 允许调用的最短时间间隔
 * @returns {Function} 防抖处理后的方法
 */
const throttle = function (func, wait, config) {
    wait = Number(wait) || 0;
    let prevTimeStamp = new Date().getTime(), context;
    let lastTimeoutKey;
    let firCallResult = null; // lodash执行时需要返回第一次执行结果
    let trailing = (config && config.trailing === false) ? false : true; // trailing === false，不执行最后一次

    return function (...args) {
        let nowTimeStamp = new Date().getTime();
        context = this;
        let passTime = nowTimeStamp - prevTimeStamp;
        //  第一次执行时，将立即执行
        if (typeof lastTimeoutKey === 'undefined') {
            prevTimeStamp = nowTimeStamp;
            lastTimeoutKey = -1;
            firCallResult = func.apply(this, args);
            return firCallResult;
        } else {
            // 第N次执行：等待时间不满足间隔，将该时间延后到满足时间间隔再次调用
            if (passTime < wait) {
                clearTimeout(lastTimeoutKey);
                lastTimeoutKey = setTimeout(function() {
                    func.apply(context, args);
                    return firCallResult;
                }, wait - passTime);
                return firCallResult;
            }
            prevTimeStamp = nowTimeStamp;
            func.apply(this, args);
            return firCallResult;
        }
    }
};

exports = module.exports = {
    throttle,
};
