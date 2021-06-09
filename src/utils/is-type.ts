/**
 * @file 判断变量数据类型
 */

const isType = (value: any, type: string): boolean => {
    return {}.toString.call(value) === '[object ' + type + ']';
};

export const isString = (str: any): boolean => {
    return isType(str, 'String');
};

export const isFunction = (val: any): boolean => {
    return isType(val, 'Function');
};

export const isObj = (val: any): boolean => {
    /**
     * isObject({}) => true
     * isObject([1, 2, 3]) => true
     * isObject(Function) => false
     * isObject(null) => false
     */
    const type = typeof val;
    return val !== null && type === 'object';
};

export const isNull = function (value): value is null {
    return value === null;
};

// 是null 或者 undefined
export const isNil = function (value: any): value is null | undefined {
    /**
     * isNil(null) => true
     * isNil() => true
     */
    return value === null || value === undefined;
};

export const isArray = function (value: any): value is Array<any> {
    return Array.isArray ?
        Array.isArray(value) :
        isType(value, 'Array');
}