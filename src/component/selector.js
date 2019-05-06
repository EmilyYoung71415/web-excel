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
    }
    // 单元格逻辑索引 位置 设置seletor位置将其附着在单元格上
    // [ri, ci] {left:xx,top:xx}
    set(indexes, offset){
        this.indexes = indexes;
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
            offset, indexes
        } = this;
        if (indexes) {
            const [, ci] = indexes;
            // resizer的列号 < 当前选中的单元格的列号
            // 改变位置
            if (colIndex < ci) {
                offset.left += v;
            } 
            // resizer所在的列号即单元格列号 原意就是改变选中单元格所在列的宽度
            // 横向的单元格 列号:[选中]若resizer选中的右边]才是width++
            // 其余都是改变位置
            else if ( colIndex == ci) {
                offset.width += v;
            }
            this.setAreaOffset();
        }
        return this;
    }

    addTopOrHeight(rowIndex, v) {
        const {
          offset, indexes
        } = this;
        if (indexes) {
            const [ri] = indexes;
            // resizer所选的行号 < selector所在行号 改变selector位置
            // 竖向的 工 当拉 上边的时候 都是改变位置
            // 下面的拉紧邻的改变 高度
            if (rowIndex < ri) {
                offset.top += v;
            } 
            else if (rowIndex == ri) {
                offset.height += v;
            }
            this.setAreaOffset();
        }
        return this;
    }
}