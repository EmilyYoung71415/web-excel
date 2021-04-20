/**
 * @file 工具函数
 */

export function isObj(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function deepClone(obj, map = new WeakMap()) {
    if (!obj instanceof Object) {
        return obj;
    }

    if (map.get(obj)) {
        return map.get(obj);
    }

    // 特殊类型处理： 函数、(时间、正则等)、数组

    if (typeof obj === 'function') {
        return obj.bind(this);
    }

    if (obj instanceof Date) {
        return new Date(obj);
    }

    const newobj = Array.isArray(obj) ? [] : {};
    map.set(obj, newobj);

    Object.keys(obj).forEach(key => {
        const curObj = obj[key];
        newobj[key] = curObj instanceof Object ? deepClone(curObj, map) : curObj;
    });

    return newobj;
};

// mousemove：debounce防抖
export function debounce(fn, wait = 500) {
    let timer = null;
    return function (...args) {
        const ctx = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.call(ctx, args);
        }, wait);
    };
}

// 滚动：throttle 节流, 刚执行了一次 则隔一段时间再fn进回调
/**
 * 节流函数
 * @param {Function} fn     - 实际要执行的函数，对其进行节流处理
 * @param {Number}   wait   - 规定的执行时间间隔
 * @param {Object}   option - 用于设置节流的函数的触发时机，
 *                            - 默认是{leading: true, trailing: true}，表示第一次触发监听事件马上执行，停止后最后也执行一次
 *                            - leading为false时，表示第一次触发不马上执行
 *                            - trailing为false时，表示最后停止触发后不执行
 *                            leading：false 和 trailing: false 不能同时设置 所以throttle只有三种设置
 * @return {Function} 返回经过节流处理后的函数
 */
export function throttle(fn, wait = 80, option = {leading: true, trailing: true}) {
    let timeid = null;
    let lasttime = 0; // 上次触发fn的时间戳
    return function (...args) {
        let self = this;
        let now = +Date.now();
        !lasttime && option.leading === false && (lasttime = now);
        let remaining = wait - (now - lasttime); // 需要等待的时间 - 已等待的时间
        // 立即执行
        if (remaining <= 0 || remaining > wait) {
            fn.apply(self, args);
            lasttime = now;
            if (timeid) {
                clearTimeout(timeid);
                timeid = null;
            }
        }
        // 未达到规定时间 且 停止后仍需延迟执行
        else if (!timeid && option.trailing === true) {
            timeid = setTimeout(function () {
                timeid = null;
                fn.apply(self, args);
                lasttime = option.leading === false ? 0 : +new Date();
            }, remaining);
        }
    };
}