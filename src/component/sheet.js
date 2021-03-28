import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import Editor from './editor';
import { h } from './element';
import * as _ from './sheet_private';

function initDom(targetEl) {
    const {row, col} = this.$viewdata;
    this.el = h('div', 'web-excel');
    this.tableEl = h('canvas', 'excel-table')
    this.table = new Table(this.tableEl.el,this.$viewdata);
    // resizer
    this.rowResizer = new Resizer(false, row.height);
    this.colResizer = new Resizer(true, col.minWidth);
    // scrollbar
    this.verticalScrollbar = new Scrollbar(true,this.$viewdata);
    this.horizontalScrollbar = new Scrollbar(false,this.$viewdata);
    /* 
     * 点击某个单元格，实现单元格选中的功能
     */
    // selector
    this.selector = new Selector(this.$viewdata);
    // overlayerEl: 等同于canvas大小； content大小是除开索引栏的内容大小
    this.overlayerEl = h('div', 'excel-overlayer').children(
        this.overlayerCEl = h('div', 'excel-overlayer-content').children(
            this.selector.el,
        ),
    );//绑定mousemove 和 mousedown事件
    this.editor = new Editor(this.$viewdata);
    this.el.children(
        this.tableEl.el,
        this.overlayerEl.el,// z-index:10
        this.rowResizer.el,
        this.colResizer.el,// z-index:11
        this.verticalScrollbar.el,// z-index:12
        this.horizontalScrollbar.el,
        this.editor.el,
    );
    // 根节点载入组件节点
    targetEl.appendChild(this.el.el);
}

export default class Sheet {
    // 组件挂载节点 和 配置信息
    constructor(targetEl, viewdata){
        this.$viewdata = viewdata;
        this.focusing = false;// table当前是否为focus状态
        initDom.call(this,targetEl);
        this.initRender();
        // 给dom绑定事件：overlayerEl:mousemove&mousedown; | window.resize | window.keydown
        _.sheetInitEvent.call(this);
        _.sheetReset.call(this);
    }
    initRender(){
        // toolbar,context...
        this.table.render();
    }
    loadData(data){
        this.$viewdata.loadData(data);
        this.table.render();
    }
    reload(){
        _.sheetReset.call(this);
        this.table.render();
    }
    getRect() {
        // ??? 为什么宽高不一致呢 初始化来源
        // getRectBounding 是得到可视化高度 
        // 便于窗口变化的时候 resize 调整窗口大小
        const { width } = this.el.box();
        const height = this.$viewdata.view.height();
        return { width, height };
      }
    // table内容页 空出了 索引栏空间
    getTableOffset() {
        const { row, col } = this.$viewdata;
        const { width, height } = this.getRect();
        return {
            width: width - col.indexWidth,
            height: height - row.height,
            left: col.indexWidth,
            top: row.height,
        };
    }
}