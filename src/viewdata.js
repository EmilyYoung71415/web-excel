import help from './utils/help';
import onchange from './utils/onchange';
const defaultViewData = {
    fixedColWidth: 60,
    // fixedRowHeight: 160,
    rowm: {}, // Map<int, Row>, len
    colm: {}, // Map<int, Row>, len
    cellmm: {}, // Map<int, Map<int, Cell>>
    styles: [],
    borders: [],
    scrollOffset: {x: 0, y: 0}, // 滚动物理距离
    scrollIndexes: [0, 0], // 由滚动的物理距离计算出 滚动了多少单元格个数（行个数、列个数）
    selectRectIndexes: null,
    render: () => { }, // viewData改变之后 视图重新渲染
    addHistory: () => { },
};

// TODO:
class History { }

function proxyData(data) {
    Object.keys(data).forEach(key => {
        Object.defineProperty(this, key, {
            get() {
                return data[key];
            },
            set(newValue) {
                data[key] = newValue;
            },
        });
    });
}

function changeHandler(path, value, previousValue) {
    // this 完整的viewdata对象
    // 将历史记录放入 dep 将table的render放入
    // console.log(this);
}
export default class ViewData {
    // sheet defaultoptions
    constructor(options) {
        this.data = Object.assign(defaultViewData, options);
        this.viewdata = onchange(this.data, changeHandler);
        // viewdata的访问代理
        proxyData.call(this, this.viewdata);// this.data.row 都可以通过 this.row访问
    }
    // 在constructor 和 loaddata里 都分别调用了render()
    loadData(data) {
        this.data = Object.assign(this.data, data);
    }
    colTotalWidth() {
        const {col, colm} = this;
        const [cmTotal, cmSize] = help.sum(colm, v => v.width || 0);
        return ((col.len - cmSize) * col.width) + cmTotal;
    }
    rowTotalHeight() {
        const {row, rowm} = this;
        const [rmTotal, rmSize] = help.sum(rowm, v => v.height || 0);
        return ((row.len - rmSize) * row.height) + rmTotal;
    }
    /**
     * 从表头开始遍历，到第rowlen行
     * 每经过一行，返回当前行：行index、行offsetY,当前行的行高
     * @param {*} rowLen 第rowLen行
     * @param {*} cb(index, offsetY, curRowHeight)
     */
    rowEach(rowLen, cb) {
        let y = 0;
        for (let i = 0; i <= rowLen; i += 1) {
            const rowHeight = this.getRowHeight(i);
            cb && cb(i, y, rowHeight);
            y += rowHeight;
        }
        return y;
    }
    colEach(colLen, cb) {
        let x = 0;
        for (let i = 0; i <= colLen; i += 1) {
            const colWidth = this.getColWidth(i);// 当前列的列宽
            // 列索引 当前一笔的起始点 当前列的列宽
            cb && cb(i, x, colWidth);
            x += colWidth;
        }
        return x;
    }
    getColWidth(index) {// 如果当前列未在特殊样式列 就是normal-size
        const {col, colm} = this;
        return colm[`${index}`] ? colm[`${index}`].width : col.width;
    }
    getRowHeight(index) {
        const {row, rowm} = this;
        return rowm[`${index}`] ? rowm[`${index}`].height : row.height;
    }
    // 计算选中的这一坨列的宽度
    colSumWidth(starIndex, endIndex) {
    // 传入table的索引 min max,获取每列宽度的函数
    // 返回当前范围 [index_colmin,index_max] 的列宽
        return help.rangeSum(starIndex, endIndex, i => this.getColWidth(i));
    }
    rowSumHeight(starIndex, endIndex) {
        return help.rangeSum(starIndex, endIndex, i => this.getRowHeight(i));
    }
    /**
     * 根据当前selector的 逻辑索引 [start单元格(行index，列index)， end单元格（行index，列index）]
     * 得到selector逻辑索引对应的 物理left\top
     * @returns
     */
    getSelectRect() {
        const {scrollOffset} = this;
        // FIX: 初始化未产生选中框时 selector会报undefined is not iterable
        if (!this.selectRectIndexes) {
            return;
        }
        const [[sri, sci], [eri, eci]] = this.selectRectIndexes || [];
        const {left, top} = this.cellPosition(sri - 1, sci - 1);
        let height = this.rowSumHeight(sri - 1, eri);
        let width = this.colSumWidth(sci - 1, eci);

        if (eri >= 0 && eci === 0) {
            width = this.colTotalWidth();
        }
        if (eri === 0 && eci >= 0) {
            height = this.rowTotalHeight();
        }
        return {
            left: left - scrollOffset.x,
            top: top - scrollOffset.y,
            height,
            width,
        };
    }
    /**
     * 单元格逻辑索引 ->  物理定位 left、top
     * @param {*} ri 行index
     * @param {*} ci 列index
     * @returns 当前单元格物理定位
     */
    cellPosition(ri, ci) {
        const left = this.colSumWidth(0, ci);
        const top = this.rowSumHeight(0, ri);
        return {
            left, top,
        };
    }
    /**
     * 维护变量：最新第一行索引=ri+1 scrollIndexes [ri, ci]
     * @param {*} offset 滚动的距离
     */
    scroll(offset) {
        const {x, y} = offset;// 滚动条在浏览器中 横向滚动距离 和 竖向滚动距离
        const {scrollOffset, col, row} = this;
        // y:y>0 都要产生滚动距离 按照滚动区间来 划分真正的滚动距离
        if (y || y === 0) {
            // 由实际滚动距离算出，应该滚动的距离（帮用户按照一行一行地滚）
            // 每次滚动是一格一格的滚动 不存在中间差
            // top是不加上当前rowheight的滚动距离 实际上 top+height是真正的滚动距离
            const [ri, top, curRowHeight] = help.rangeReduceIf(
                0,
                row.len,
                0,
                0,
                y, // 要达到y: scrollTop的滚动距离 需要滚动多少单元行
                i => this.getRowHeight(i)
            );
            let y1 = top;
            if (y > 0) {
                y1 += curRowHeight;
            }
            // 只要产生了滚动都至少会滚动一行
            this.scrollIndexes[0] = y > 0 ? ri : 0;// ri+1是最新第一行索引
            scrollOffset.y = y1;
        }
        if (x || x === 0) {
            const [ci, left, curColWidth] = help.rangeReduceIf(
                0,
                col.len,
                0,
                0,
                x,
                i => this.getColWidth(i)
            );
            let x1 = left;
            if (x > 0) {
                x1 += curColWidth;
            }
            this.scrollIndexes[1] = x > 0 ? ci : 0;
            scrollOffset.x = x1;
        }

    }
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height)
    getCellRectWithIndexes(x, y, forSelector = true) {
        const {ri, top, height} = this.getCellRowByY(y);
        const {ci, left, width} = this.getCellColByX(x);
        const {row, col} = this;
        // 鼠标坐标在 第一列 索引栏
        // 如果是forSelector就是行选 返回的width是table_width
        if (ri >= 0 && ci === 0) {
            const nwidth = forSelector ? this.colTotalWidth() : width;
            const ntop = forSelector ? top - row.height : top;
            return {
                ri, ci, left: 0, top: ntop, width: nwidth, height,
            };
        }
        if (ri === 0 && ci >= 0) {
            const nheight = forSelector ? this.rowTotalHeight() : height;
            const nleft = forSelector ? left - col.indexWidth : left;
            return {
                ri, ci, left: nleft, top: 0, width, height: nheight,
            };
        }
        return {
            ri, ci, left: left - col.indexWidth, top: top - row.height, width, height,
        };
    }
    getCellRowByY(y) {// 根据y坐标获得所在行号
        const {row, scrollOffset} = this;
        const [ri, top, height] = help.rangeReduceIf(
            0,
            row.len,
            row.height - scrollOffset.y, // top
            row.height, // 行高
            y,
            i => this.getRowHeight(i)// 传入获取第i行行高的cb函数
        );
        if (top <= 0) {
            return {ri: 0, top: 0, height};
        }
        return {ri, top, height};
    }
    getCellColByX(x) {
        const {col, scrollOffset} = this;
        const [ci, left, width] = help.rangeReduceIf(
            0,
            col.len,
            col.indexWidth - scrollOffset.x,
            col.indexWidth,
            x,
            i => this.getColWidth(i)
        );
        if (left <= 0) {
            return {ci: 0, left: 0, width: col.indexWidth};
        }
        return {ci, left, width};
    }
    setRowHeight(index, height) {
        this.rowm[index] = this.rowm[index] || {};
        this.rowm[index].height = height;
    // this.render();
    }
    setColWidth(index, width) {
        this.colm[index] = this.colm[index] || {};
        this.colm[index].width = width;
    // this.render();
    }
    setSelectRectIndexes(index) {
        this.selectRectIndexes = index;
        return this;
    }
    getCell(ri, ci) {
        if (this.cellmm[ri] && this.cellmm[ri][ci]) {
            return this.cellmm[ri][ci];
        }
        return null;
    }
    // 编辑完成 input的文字放进canvas里
    setCellText(ri, ci, itext) {
        const {cellmm} = this;
        cellmm[ri] = cellmm[ri] || {};
        cellmm[ri][ci] = cellmm[ri][ci] || {};
        cellmm[ri][ci].text = itext;
    }
}