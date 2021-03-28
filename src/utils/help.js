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

/****
 * 传入taget坐标值 返回坐标值对应的单元格子
 * @param min页面最小格子数 max页面当前的格子数 
 *        top:可视窗口的top值  rowH：行高
 *        target目标坐标值 getv根据格子索引得到当前格子的行高   
 * 比如传入y坐标 返回y坐标所在的行号及位置
 * @return [ri,top,height]
 */
const rangeReduceIf = (min,max,top,rowH,target,getv)=>{
    let i = min,
        s = top,
        v = rowH;
    for(;i<max;i++){
        if(s>target) break;
        v = getv(i);
        s += v;
    }
    return [i,s-v,v];
}

// 传入table的其实索引 min max,获取每列宽度的函数
// 返回当前范围 [index_colmin,index_max] 的列宽
function rangeSum(min, max, getv) {
    let s = 0;
    for (let i = min; i < max; i += 1) {
      s += getv(i);
    }
    return s;
}
  
export default {
    sum,
    rangeReduceIf,
    rangeSum
}