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