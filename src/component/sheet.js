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
        this.tableEl = h('canvas', 'excel-table');
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