import { h } from './element';

const gSelectorHeightBorderWidth = 2 * 2 - 1;

export default class Selector{
    constructor() {
        this.cornerEl = h('div', 'excel-selector-corner');
        this.areaEl = h('div', 'excel-selector-area').child(this.cornerEl);
        this.el = h('div', 'excel-selector').child(this.areaEl).hide()
          .on('click.stop', () => {});
        this.offset = null;
        this.indexes = null;
        this.sIndexes = null;// startIndexes 框线的起始索引
        this.eIndexes = null;// endIndexes
    }
    // 单元格逻辑索引 位置 设置seletor位置将其附着在单元格上
    // [ri, ci] {left:xx,top:xx}
    set(indexes, offset){
        this.indexes = indexes;
        this.sIndexes = indexes;
        this.eIndexes = indexes;
        this.offset = offset;
        this.setAreaOffset();
        this.el.show();
    }
    setAreaOffset() {
        const {
            left, top, width, height,
        } = this.offset;
        this.areaEl.offset({
            width: width - gSelectorHeightBorderWidth,
            height: height - gSelectorHeightBorderWidth,
            left,
            top,
        });
    }
    // 根据startIndexes,endIndexes设置框选的selector的大小和位置
    // getOffset是cb函数,getOffset(startIndexes,endIndexes)可以得到框的offset值
    setEnd(newIndexes,getOffset){
        const [ori, oci] = this.indexes;//origin index
        const [nri, nci] = newIndexes;// new index
        this.sIndexes = [ori, oci];
        this.eIndexes = [nri, nci];
        if (ori >= nri) {
            this.eIndexes[0] = ori;
            this.sIndexes[0] = nri;
        }
        if (oci >= nci) {
            this.eIndexes[1] = oci;
            this.sIndexes[1] = nci;
        }
        // 设置当前框选的selector的大小、位置
        this.offset = getOffset(this.sIndexes, this.eIndexes);
        this.setAreaOffset();
    }
    addLeft(left) {// 左右移 比如横向滚动的时候
        const { offset, areaEl, indexes } = this;
        if (indexes) {
            offset.left += left;
            areaEl.offset({ left: offset.left });
        }
        return this;
    }
    
    addTop(top) {
        const { offset, areaEl, indexes } = this;
        if (indexes) {
            offset.top += top;
            areaEl.offset({ top: offset.top });
        }
        return this;
    }
    // colIndex,distance
    addLeftOrWidth(colIndex, v) {// colResizer 的时候 
        const {
            offset, indexes,sIndexes,eIndexes
        } = this;
        if (indexes) {
            const [, sci] = sIndexes;
            const [, eci] = eIndexes;
            // resizer的列号 < 当前选中的单元格的列号
            // 改变位置
            if (colIndex < sci) {
                offset.left += v;
            } 
            // resizer所在的列号即框选单元格列号范围内 原意就是改变选中单元格所在列的宽度
            // 横向的单元格 列号:[选中]若resizer选中的右边]才是width++
            // 其余都是改变位置
            else if (sci <= colIndex && colIndex <= eci) {
                offset.width += v;
            }
            this.setAreaOffset();
        }
        return this;
    }

    addTopOrHeight(rowIndex, v) {
        const {
          offset, indexes, sIndexes, eIndexes,
        } = this;
        if (indexes) {
            const [sri] = sIndexes;
            const [eri] = eIndexes;
            // resizer所选的行号 < selector所在行号 改变selector位置
            // 竖向的 工 当拉 上边的时候 都是改变位置
            // 下面的拉紧邻的改变 高度
            if (rowIndex < sri) {
                offset.top += v;
            } 
            else if (sri <= rowIndex && rowIndex <= eri) {
                offset.height += v;
            }
            this.setAreaOffset();
        }
        return this;
    }
}