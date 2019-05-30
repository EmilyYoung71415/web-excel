import { Draw,DrawBox } from '../draw/canvas';
import help from '../utils/help';
import _ from './table_private';

export default class Table{
    constructor(el,viewData){
        this.el = el;
        this.context = el.getContext('2d');
        this.draw = new Draw(el);// canvas操作的类
        this.$viewdata = viewData;
    }
    render(){
        this.clear()
        _.renderContentGrid.call(this);//绘制content格子
        _.renderFixedHeaders.call(this);//绘制第0行/第0列的 索引栏
        _.renderContent.call(this);// 将表格数据填充进单元格
    }
    //-------------------------------------------
    // loadData(data){
    //     if(data){
    //         const {rowm, colm, cellmm, styles, borders} = data;
    //         if (rowm) this.rowm = rowm;
    //         if (colm) this.colm = colm;
    //         if (cellmm) this.cellmm = cellmm;
    //         if (styles) this.styles = styles;
    //         if (borders) this.borders = borders;
    //     }
    // }
    //-------------------------------------------
    clear(){
        this.draw.clear()
    }
    //-------------------------------------------
    // // 根据鼠标坐标点，获得所在的cell矩形信息
    // // (ri, ci, offsetX, offsetY, width, height)
    // getCellRectWithIndexes(x,y,forSelector=true){
    //     const { ri, top, height } = _.getCellRowByY.call(this,y);
    //     const { ci, left, width } = _.getCellColByX.call(this,x);
    //     const {row,col} = this;
    //     // 鼠标坐标在 第一列 索引栏
    //     // 如果是forSelector就是行选 返回的width是table_width
    //     if (ri >= 0 && ci === 0){
    //         const nwidth = forSelector ? this.colTotalWidth() : width;
    //         const ntop = forSelector ? top - row.height : top;
    //         return {
    //             ri, ci, left: 0, top: ntop, width: nwidth, height,
    //         };
    //     }
    //     if(ri === 0 && ci >= 0){
    //         const nheight = forSelector ? this.rowTotalHeight() : height;
    //         const nleft = forSelector ? left - col.indexWidth : left;
    //         return {
    //             ri, ci, left: nleft, top: 0, width, height: nheight,
    //         };
    //     }
    //     return {
    //         ri, ci, left: left - col.indexWidth, top: top - row.height, width, height,
    //     };
    // }
    // offset = {x: , y: }
    // scroll(offset,cb=()=>{}){
    //     const { x, y } = offset;// 滚动条在浏览器中 横向滚动距离 和 竖向滚动距离
    //     const { scrollOffset, col, row } = this; 
    //     // y:y>0 都要产生滚动距离 按照滚动区间来 划分真正的滚动距离
    //     if (y||y==0) {
    //         // 由滚动距离计算出 
    //         // 隐藏的内容里，最后一行的逻辑索引、视口高度、最后一行的行高
    //         // [1,0,25],[2,25,150]
    //         // 每次滚动是一格一格的滚动 不存在中间差
    //         // top是不加上当前height的滚动距离 实际上 top+height是真正的滚动距离
    //         const [ri, top, height] = help.rangeReduceIf(
    //             0, 
    //             row.len, 
    //             0, 
    //             0, 
    //             y, 
    //             i => this.getRowHeight(i)
    //         );
    //         let y1 = top;
    //         if (y > 0) y1 += height;// 只要产生了滚动都至少会滚动一行
    //         if (scrollOffset.y !== y1) {
    //             this.scrollIndexes[0] = y > 0 ? ri : 0;// ri+1是最新第一行索引
    //             // 这次与上次滚动的相对移动距离
    //             cb(y1 - scrollOffset.y);
    //             scrollOffset.y = y1;
    //             this.render();  
    //         }
    //     } 
    //     if (x||x==0) {
    //         const [ci, left, width] = help.rangeReduceIf(
    //             0, 
    //             col.len, 
    //             0, 
    //             0, 
    //             x, 
    //             i => this.getColWidth(i)
    //         );
    //         let x1 = left;
    //         if (x > 0) x1 += width;
    //         if (scrollOffset.x !== x1) {
    //             this.scrollIndexes[1] = x > 0 ? ci: 0;
    //             cb(x1 - scrollOffset.x);// 将移动距离传入cb
    //             scrollOffset.x = x1;
    //             this.render();
    //         }
    //     }
        
    // }
    // colTotalWidth(){
    //     // col是normal-size colm包含了特殊样式列的列样式
    //     const { col, colm } = this;
    //     const [cmTotal, cmSize] = help.sum(colm, v => v.width || 0);
    //     return ((col.len - cmSize) * col.width) + cmTotal;
    // }
    // rowTotalHeight(){
    //     const { row, rowm } = this;
    //     const [rmTotal, rmSize] = help.sum(rowm, v => v.height || 0);
    //     return ((row.len - rmSize) * row.height) + rmTotal;
    // }
    // // 列个数
    // colEach(colLen, cb) {
    //     let x = 0;
    //     for (let i = 0; i <= colLen; i += 1) {
    //       const colWidth = this.getColWidth(i);//当前列的列宽
    //       // 列索引 当前一笔的起始点 当前列的列宽
    //       cb(i, x, colWidth);
    //       x += colWidth;
    //     }
    // }
    // rowEach(rowLen, cb) {
    //     let y = 0;
    //     for (let i = 0; i <= rowLen; i += 1) {
    //       const rowHeight = this.getRowHeight(i);
    //       cb(i, y, rowHeight);
    //       y += rowHeight;
    //     }
    // }
    // getColWidth(index) {//如果当前列未在特殊样式列 就是normal-size
    //     const { col, colm } = this;
    //     return colm[`${index}`] ? colm[`${index}`].width : col.width;
    // }
    // getRowHeight(index) {
    //     const { row, rowm } = this;
    //     return rowm[`${index}`] ? rowm[`${index}`].height : row.height;
    // }
    // setRowHeight(index,height){
    //     this.rowm[index] = this.rowm[index] || {}
    //     this.rowm[index].height = height;
    //     this.render();
    // }
    // setColWidth(index,width){
    //     this.colm[index] = this.colm[index] || {}
    //     this.colm[index].width = width;
    //     this.render();
    // }
    // colSumWidth(min, max) {
    //     // 传入table的其实索引 min max,获取每列宽度的函数
    //     // 返回当前范围 [index_colmin,index_max] 的列宽
    //     return help.rangeSum(min, max, i => this.getColWidth(i));
    // }
    // rowSumHeight(min, max) {
    //     return help.rangeSum(min, max, i => this.getRowHeight(i));
    // }
    // [startIndexes, endIndexes]
    // setSelectRectIndexes(index){
    //     this.selectRectIndexes  = index;
    //     return this;
    // }
    // getSelectRect(){
    //     const { scrollOffset } = this;
    //     const [[sri, sci], [eri, eci]] = this.selectRectIndexes;
    //     const { left, top } = this.cellPosition(sri - 1, sci - 1);
    //     let height = this.rowSumHeight(sri - 1, eri);
    //     let width = this.colSumWidth(sci - 1, eci);

    //     if (eri >= 0 && eci === 0) {
    //         width = this.colTotalWidth();
    //     }
    //     if (eri === 0 && eci >= 0) {
    //         height = this.rowTotalHeight();
    //     }

    //     return {
    //         left: left - scrollOffset.x,
    //         top: top - scrollOffset.y,
    //         height,
    //         width,
    //     };
    // }
    // cellPosition(ri, ci) {
    //     const left = this.colSumWidth(0, ci);
    //     const top = this.rowSumHeight(0, ri);
    //     return {
    //         left, top,
    //     };
    // }
    //-------------------------------------------
}