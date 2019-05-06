import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Table from './table';
import { h } from './element';
import { bind } from '../events/event';
/***
 * 独立于类的私有方法
 * 只能由类内部调用 且 类调用时传入类的当前上下文this
 */
function sheetReset() {
    const {
      el, tableEl, view,
    } = this;
    tableEl.attr({
      width: el.box().width,
      height: view.height(),
    });
    verticalScrollbarSet.call(this);
    horizontalScrollbarSet.call(this);
}

function tableMousemove(ev){
    if(ev.buttons!==0) return;
    const {
        table, rowResizer, colResizer, tableEl
    } = this;
    const tRect = tableEl.box();
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height)
    const cRect = table.getCellRectWithIndexes(ev.offsetX, ev.offsetY);
    // 行的辅助线显示:鼠标在第一列move ri>=0 ci==0
    if(cRect.ri>=0&&cRect.ci==0){
        rowResizer.show(cRect,{
            width:tRect.width
        })
    }else{
        rowResizer.hide()
    }

    if(cRect.ci>=0&&cRect.ri==0){
        colResizer.show(cRect,{
            height:tRect.height
        })
    }else{
        colResizer.hide()
    }
}

function rowResizerFinished(cRect, distance) {
    const { ri } = cRect;
    const { table } = this;
    table.setRowHeight(ri - 1, distance);
}
  
function colResizerFinished(cRect, distance) {
    const { ci } = cRect;
    const { table } = this;
    table.setColWidth(ci - 1, distance);
}
function verticalScrollbarSet() {
    const {
      table, verticalScrollbar, view, row,
    } = this;
    verticalScrollbar.set(view.height() - row.height, table.rowTotalHeight());
}
function horizontalScrollbarSet() {
    const {
      table, horizontalScrollbar, el, col,
    } = this;
    horizontalScrollbar.set(el.box().width - col.indexWidth, table.colTotalWidth());
}

function verticalScrollbarMove(distance) {
    const { table } = this;
    table.scroll({ y: distance });
}
  
function horizontalScrollbarMove(distance) {
    const { table } = this;
    table.scroll({ x: distance });
}
export default class Sheet {
    constructor(targetEl, options = {}){
        this.el = h('div', 'web-excel');//创建div标签
        const {
            row, col, style, view,
        } = options;
        this.col = col;
        this.row = row;
        this.view = view;
        this.tableEl = h('canvas', 'excel-table')
            .on('mousemove', (evt) => {
                tableMousemove.call(this, evt);
            });
        this.table = new Table(this.tableEl.el, row, col, style);
        // resizer
        this.rowResizer = new Resizer(false, row.height);
        this.colResizer = new Resizer(true, col.minWidth);
        // scrollbar
        this.verticalScrollbar = new Scrollbar(true);
        this.horizontalScrollbar = new Scrollbar(false);
        // web-excel里push节点canvas、resizer
        this.el.children(
            this.tableEl,
            this.rowResizer.el,
            this.colResizer.el,
            this.verticalScrollbar.el,
            this.horizontalScrollbar.el,
        );
        // 根节点载入组件节点
        targetEl.appendChild(this.el.el);
        // resizer类在resize动作结束之后 将收集到的相关数据通过回调函数返回
        // table使用数据改变行高列宽
        this.rowResizer.finishedFn = (cRect,distance)=>{
            rowResizerFinished.call(this,cRect,distance);
        }
        this.colResizer.finishedFn = (cRect,distance)=>{
            colResizerFinished.call(this,cRect,distance);
        }
        // 滚动条滚动cb
        this.verticalScrollbar.moveFn = (distance, evt) => {
            verticalScrollbarMove.call(this, distance, evt);
        };
        this.horizontalScrollbar.moveFn = (distance, evt) => {
            horizontalScrollbarMove.call(this, distance, evt);
        };
        bind(window, 'resize', () => {
            this.reload();
        });
        sheetReset.call(this);
    }
    loadData(data){
        const { table } = this;
        table.loadData(data);
        table.render();
    }
    reload(){
        sheetReset.call(this);
        this.table.render();
    }
}