import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import Editor from './editor';
import OverLayer from './overLayer';
import {h} from '../baserender/element';
import * as _ from './sheet_private';

function initDom($target) {
    const {row, col, viewRect} = this.$viewdata;
    this.$el = h('div', 'web-excel');
    this.table = new Table(this.$viewdata);
    // resizer
    this.rowResizer = new Resizer(false, row.height);
    this.colResizer = new Resizer(true, col.minWidth);
    // scrollbar
    this.verticalScrollbar = new Scrollbar(true, this.$viewdata);
    this.horizontalScrollbar = new Scrollbar(false, this.$viewdata);
    // selector: 点击某个单元格，实现单元格选中的功能
    this.selector = new Selector(this.$viewdata);
    // overlayer: 等同于canvas大小； content大小是除开索引栏的内容大小
    // 绑定mousemove 和 mousedown事件
    this.overlayer = new OverLayer(this.selector, this.$viewdata);
    // editor: 附着在单元格上的输入框
    this.editor = new Editor(this.$viewdata);
    this.$el.children(
        this.table.el,
        this.overlayer.el, // z-index:10
        this.rowResizer.el,
        this.colResizer.el, // z-index:11
        this.verticalScrollbar.el, // z-index:12
        this.horizontalScrollbar.el,
        this.editor.el
    );
    const scrollbarpadding = 10;
    this.$el.css({
        width: `${viewRect.width + scrollbarpadding}px`,
        height: `${viewRect.height + scrollbarpadding}px`,
        overflow: 'hidden',
    });
    // 根节点载入组件节点
    $target.appendChild(this.$el.el);
}

export default class Sheet {
    // 组件挂载节点 和 配置信息
    constructor($target, viewdata) {
        this.$viewdata = viewdata;
        initDom.call(this, $target);
        // 给dom绑定事件：overlayer: (mousemove & mousedown) | window.resize | window.keydown
        _.sheetInitEvent.call(this);
        _.sheetReset.call(this);
    }

    loadData(data) {
        this.$viewdata.loadData(data);
        this.table.render();
    }

    // resize时，视窗发生变化，重新reload
    sheetReload() {
        _.sheetReset.call(this);
    }
}
