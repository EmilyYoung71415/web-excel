import Resizer from './resizer';
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
        // web-excel里push节点canvas、resizer
        this.el.children(
            this.tableEl,
            this.rowResizer.el,
            this.colResizer.el
        );
        // 根节点载入组件节点
        targetEl.appendChild(this.el.el);
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