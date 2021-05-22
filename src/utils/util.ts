import { isObj } from './index';
import { RangeIndexes } from '../type';
// 旧值依次挂在新值上
// 与Object.assign的区别是：不会因为newObj没有x属性而直接替换oldObj后使得oldObj.x为空
export function _merge<T extends Array<T> | any>(oldObj: T, newObj: T): T {
    const resObj: T = {} as T;
    for (const key in oldObj) {
        if (oldObj[key] !== undefined) {
            resObj[key] = oldObj[key];
        }
    }

    for (const key in newObj) {
        if (newObj[key] === undefined) {
            continue;
        }
        const oldval = resObj[key];
        const newval = newObj[key];
        if (isObj(oldval) && isObj(newval)) {
            resObj[key] = _merge(oldval, newval);
        }
        else {
            resObj[key] = newval;
        }
    }
    return resObj;
}

export function getRangeKey(rowkey: string, colkey: string): string {
    // return `[[${rowkey},${colkey}],[${rowkey},${colkey}]]`;
    return JSON.stringify({ sri: +rowkey, sci: +colkey, eri: +rowkey, eci: +colkey });
}

export function parseRangeKey(rangekey: string): RangeIndexes {
    return JSON.parse(rangekey);
}