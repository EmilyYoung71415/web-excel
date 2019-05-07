import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import { h } from './element';
import _ from './sheet_private';
export default class Sheet {
    constructor(targetEl, options = {}){
        this.el = h('div', 'web-excel');//创建div标签
        const {
            row, col, style, view,
        } = options;
        this.col = col;
        this.row = row;
        this.view = view;
        this.focusing = false;// table当前是否为focus状态
        this.tableEl = h('canvas', 'excel-table')
        this.table = new Table(this.tableEl.el, row, col, style);
        // resizer
        this.rowResizer = new Resizer(false, row.height);
        this.colResizer = new Resizer(true, col.minWidth);
        // scrollbar
        this.verticalScrollbar = new Scrollbar(true);
        this.horizontalScrollbar = new Scrollbar(false);
        // selector
        this.selector = new Selector();
        this.overlayerEl = h('div', 'excel-overlayer').children(
                this.overlayerCEl = h('div', 'excel-overlayer-content').children(
                    this.selector.el,
                ),
            );//绑定mousemove 和 mousedown事件
            
        // web-excel里push节点canvas、resizer
        this.el.children(
            this.tableEl,
            this.overlayerEl.el,// z-index:10
            this.rowResizer.el,
            this.colResizer.el,// z-index:11
            this.verticalScrollbar.el,// z-index:12
            this.horizontalScrollbar.el,
        );
        // 根节点载入组件节点
        targetEl.appendChild(this.el.el);
        //overlayerEl:mousemove&mousedown; | window.resize | window.keydown
        _.sheetInitEvent.call(this);
        _.sheetReset.call(this);
    }
    loadData(data){
        const { table } = this;
        table.loadData(data);
        table.render();
    }
    reload(){
        _.sheetReset.call(this);
        this.table.render();
    }
    getRect() {
        const { width } = this.el.box();
        const height = this.view.height();
        return { width, height };
      }
    
    getTableOffset() {
        const { row, col } = this;
        const { width, height } = this.getRect();
        return {
            width: width - col.indexWidth,
            height: height - row.height,
            left: col.indexWidth,
            top: row.height,
        };
    }
}