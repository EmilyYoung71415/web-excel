/**
 * @file 判断变量数据类型
 */

const isType = (value: any, type: string): boolean => {
    return {}.toString.call(value) === '[object ' + type + ']';
};

const isString = (str: any): boolean => {
    return isType(str, 'String');
};

const isFunction = (val: any): boolean => {
    return isType(val, 'Function');
};

const isObj = (val: any): boolean => {
    /**
     * isObject({}) => true
     * isObject([1, 2, 3]) => true
     * isObject(Function) => false
     * isObject(null) => false
     */
    const type = typeof val;
    return val !== null && type === 'object';
};

export {
    isType,
    isString,
    isFunction,
    isObj,
};