import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import Editor from './editor';
import {h} from './element';
import * as _ from './sheet_private';

function initDom(targetEl) {
    const {row, col} = this.$viewdata;
    this.el = h('div', 'web-excel');
    this.tableEl = h('canvas', 'excel-table');
    this.table = new Table(this.tableEl.el, this.$viewdata);
    // resizer
    this.rowResizer = new Resizer(false, row.height);
    this.colResizer = new Resizer(true, col.minWidth);
    // scrollbar
    this.verticalScrollbar = new Scrollbar(true, this.$viewdata);
    this.horizontalScrollbar = new Scrollbar(false, this.$viewdata);
    // selector: 点击某个单元格，实现单元格选中的功能
    this.selector = new Selector(this.$viewdata);
    // overlayerEl: 等同于canvas大小； content大小是除开索引栏的内容大小
    // 绑定mousemove 和 mousedown事件
    this.overlayerEl = h('div', 'excel-overlayer').children(
        this.overlayerCEl = h('div', 'excel-overlayer-content').children(
            this.selector.el
        )
    );
    // editor: 附着在单元格上的输入框
    this.editor = new Editor(this.$viewdata);
    this.el.children(
        this.tableEl.el,
        this.overlayerEl.el, // z-index:10
        this.rowResizer.el,
        this.colResizer.el, // z-index:11
        this.verticalScrollbar.el, // z-index:12
        this.horizontalScrollbar.el,
        this.editor.el
    );
    // 根节点载入组件节点
    targetEl.appendChild(this.el.el);
}

export default class Sheet {
    // 组件挂载节点 和 配置信息
    constructor(targetEl, viewdata) {
        this.$viewdata = viewdata;
        this.focusing = false;// table当前是否为focus状态
        initDom.call(this, targetEl);
        this.table.render();
        // 给dom绑定事件：overlayerEl: (mousemove & mousedown) | window.resize | window.keydown
        _.sheetInitEvent.call(this);
        _.sheetReset.call(this);
    }
    loadData(data) {
        this.$viewdata.loadData(data);
        this.table.render();
    }
    // resize时，视窗发生变化，重新reload
    reload() {
        _.sheetReset.call(this);
        this.table.render();
    }
    // sheet的宽高
    getRect() {
        const {width} = this.el.box();
        const height = this.$viewdata.view.height();
        return {width, height};
    }
    // table内容页 空出了 索引栏空间
    getTableOffset() {
        const {row, col} = this.$viewdata;
        const {width, height} = this.getRect();
        return {
            width: width - col.indexWidth,
            height: height - row.height,
            left: col.indexWidth,
            top: row.height,
        };
    }
}