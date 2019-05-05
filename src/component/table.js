import { Draw,DrawBox } from '../draw/canvas';
import help from '../utils/help';
import alphabet from '../config/alphabet';
const gLeftFixedCellWidth = 60;
const gCellPaddingWidth = 5;
/***
 * table类的数据:
 * el,row,col,style来自组件入口的defaultOption 和类的初始化
 * loadData:给予数据配置
 */
export default class Table{
    constructor(el,row,col,style){
        this.el = el;
        this.context = el.getContext('2d');
        this.draw = new Draw(el);// canvas操作的类
        this.row = row;
        this.col = col;
        this.rowm = {}; // {rowIndex: {height: 200},....}
        this.colm = {}; // {colIndex: {width: 200},....}
        this.cellmm = {}; // {rowIndex: {colIndex: Cell}}
        this.scrollOffset = { x: 0, y: 0 };
        this.style = style;
        this.styles = []; // style特殊单元格
        this.borders = []; // border边框样式
    }
    render(){
        this.clear()
        this.renderContentGrid();//绘制content格子
        this.renderFixedHeaders();//绘制第0行/第0列的 索引栏
        this.renderContent();// 将表格数据填充进单元格
    }
    loadData(data){
        if(data){
            const {rowm, colm, cellmm, styles, borders} = data;
            if (rowm) this.rowm = rowm;
            if (colm) this.colm = colm;
            if (cellmm) this.cellmm = cellmm;
            if (styles) this.styles = styles;
            if (borders) this.borders = borders;
        }
    }
    clear(){
        this.draw.clear()
    }
    renderContentGrid(){
        const {draw, row, col} = this;
        draw.save();
        draw.attr({
            lineWidth: 0.5,
            strokeStyle: '#d0d0d0',
        });
        draw.translate(gLeftFixedCellWidth, row.height);
        const colSumWidth = this.colTotalWidth();// 全部列总宽
        const rowSumHeight = this.rowTotalHeight();// 全部行总高
        // 在table里的画横、竖
        // 每一行的横线起始两点坐标为(0,y),(colSumWidth, y)
        this.rowEach(row.len, (i, y) => {
            draw.line([0, y], [colSumWidth, y]);
        });
        this.colEach(col.len, (i, x) => {
            draw.line([x, 0], [x, rowSumHeight]);
        });
        draw.restore();
    }
    renderFixedHeaders(){// 表格的索引栏 有浅灰色的背景颜色
        const {draw, row, col} = this;
        draw.save();
        // 背景颜色   
        draw.attr({ fillStyle: '#f4f5f8' })
            // 填充背景
            .fillRect(0, 0, gLeftFixedCellWidth, this.rowTotalHeight() + row.height)
            .fillRect(0, 0, this.colTotalWidth() + gLeftFixedCellWidth, row.height);
        draw.attr({
            textAlign: 'center',
            textBaseline: 'middle',
            font: '500 12px sans-serif',
            fillStyle: '#585757',
            lineWidth: 0.5,
            strokeStyle: '#d0d0d0',
        });
        // 第一列 生成行索引
        this.rowEach(row.len, (i, y1, rowHeight) => {
            const y = y1 + row.height;
            const [tx, ty] = [0 + (gLeftFixedCellWidth / 2), y + (rowHeight / 2)];
            if (i !== row.len) draw.fillText(i + 1, tx, ty);
            // 分割线
            draw.line([0, y], [gLeftFixedCellWidth, y]);
        });
        draw.line([gLeftFixedCellWidth, 0], [gLeftFixedCellWidth, this.rowTotalHeight() + row.height]);
        // 第一行 生成列索引
        this.colEach(col.len, (i, x1, colWidth) => {
            const x = x1 + gLeftFixedCellWidth;
            const [tx, ty] = [x + (colWidth / 2), 0 + (row.height / 2)];
            if (i !== col.len) draw.fillText(alphabet.stringAt(i), tx, ty);
            draw.line([x, 0], [x, row.height]);
        });
        draw.line([0, row.height], [this.colTotalWidth() + gLeftFixedCellWidth, row.height]);
        // left-top-cell
        draw.attr({ fillStyle: '#fff' })
            .fillRect(0, 0, gLeftFixedCellWidth, row.height);
        draw.restore();
    }
    renderContent(){
        const { cellmm } = this;
        Object.keys(cellmm).forEach((rindex) => {
            Object.keys(cellmm[rindex]).forEach((cindex) => {
                this.renderCell(rindex, cindex, cellmm[rindex][rindex]);
            });
        });
    }
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height)
    getCellRectWithIndexes(x,y){
        const { ri, top, height } = this.getCellRowByY(y);
        const { ci, left, width } = this.getCellColByX(x);
        return {
            ri, ci, left, top, width, height,
        };
    }
    renderCell(rindex,cindex,cell){
        const {
            styles, cellmm, draw, row,
        } = this;

        const style = styles[cell.si];
        //传入逻辑索引返回得到单元格坐标、长宽,以此来生成drawbox
        const dbox = this.getDrawBox(rindex, cindex);
        const {
            bgcolor, bi, bti, bri, bbi, bli
        } = style;
        dbox.bgcolor = bgcolor;
        dbox.setBorders(
            this.borders[bi],
            this.borders[bti],
            this.borders[bri],
            this.borders[bbi],
            this.borders[bli],
        );
        draw.save().translate(gLeftFixedCellWidth, row.height);
        draw.rect(dbox);
        // render cell数据
        const cellText = cell.text;// TODO:格式化
        const wrapText = (style && style.wrapText) || this.style.wrapText;
        const font = Object.assign({}, this.style.font, style.font);
        draw.text(cellText, dbox, {
            align: (style && style.align) || this.style.align,
            valign: (style && style.align) || this.style.valign,
            font,
            color: (style && style.color) || this.style.color,
        }, wrapText);
        draw.restore();
    }
    getDrawBox(rindex, cindex){
        let x,y,width,height;//x.y 坐标值
        this.rowEach(rindex, (i, y1, rowHeight) => {
            y = y1;
            height = rowHeight;
        });
        this.colEach(cindex, (i, x1, colWidth) => {
            x = x1;
            width = colWidth;
        });
        return new DrawBox(x, y, width, height, gCellPaddingWidth);
    }
    colTotalWidth(){
        // col是normal-size colm包含了特殊样式列的列样式
        const { col, colm } = this;
        const [cmTotal, cmSize] = help.sum(colm, v => v.width || 0);
        return ((col.len - cmSize) * col.width) + cmTotal;
    }
    rowTotalHeight(){
        const { row, rowm } = this;
        const [rmTotal, rmSize] = help.sum(rowm, v => v.height || 0);
        return ((row.len - rmSize) * row.height) + rmTotal;
    }
    // 列个数
    colEach(colLen, cb) {
        let x = 0;
        for (let i = 0; i <= colLen; i += 1) {
          const colWidth = this.getColWidth(i);//当前列的列宽
          // 列索引 当前一笔的起始点 当前列的列宽
          cb(i, x, colWidth);
          x += colWidth;
        }
    }
    rowEach(rowLen, cb) {
        let y = 0;
        for (let i = 0; i <= rowLen; i += 1) {
          const rowHeight = this.getRowHeight(i);
          cb(i, y, rowHeight);
          y += rowHeight;
        }
    }
    getColWidth(index) {//如果当前列未在特殊样式列 就是normal-size
        const { col, colm } = this;
        return colm[`${index}`] ? colm[`${index}`].width : col.width;
    }
    getRowHeight(index) {
        const { row, rowm } = this;
        return rowm[`${index}`] ? rowm[`${index}`].height : row.height;
    }
    getCellRowByY(y){// 根据y坐标获得所在行号
        const { row,scrollOffset } = this;
        const [ri, top, height] = help.rangeReduceIf(
            0,
            row.len,
            row.height - scrollOffset.y,// top
            row.height,// 行高
            y,
            i => this.getRowHeight(i)//传入获取第i行行高的cb函数
        );
        if (top <= 0) {
            return { ri: 0, top: 0, height };
        }
        return { ri, top, height };
    }
    getCellColByX(x){
        const { col, scrollOffset } = this;
        const [ci, left, width] = help.rangeReduceIf(
            0,
            col.len,
            col.indexWidth - scrollOffset.x,
            col.indexWidth,
            x,
            i => this.getColWidth(i),
        );
        if (left <= 0) {
            return { ci: 0, left: 0, width: col.indexWidth };
        }
        return { ci, left, width };
    }
    setRowHeight(index,height){
        this.rowm[index] = this.rowm[index] || {}
        this.rowm[index].height = height;
        this.render();
    }
    setColWidth(index,width){
        this.colm[index] = this.colm[index] || {}
        this.colm[index].width = width;
        this.render();
    }
}