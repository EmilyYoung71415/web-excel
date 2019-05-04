/*
  objOrAry: obejct or Array
  cb: (value, index | key) => { return value }
*/

/**
 * @param {*} objOrAry obj or  Array
 * @param {*} cb  (value, index | key) => { return value }
 * @returns {*} [total,size] // 计算总值 和 计算过程的有效个数
 * exp: 计算 obj的某个属性的计算总值
 * obj = colm = {1:{width:50}}
 * cb = v => v.width || 0
 */
const sum = (objOrAry, cb = value => value) => {
    let total = 0;
    let size = 0;
    Object.keys(objOrAry).forEach((key) => {
      total += cb(objOrAry[key], key);
      size += 1;
    });
    return [total, size];
  };
  
export default{
    sum
}