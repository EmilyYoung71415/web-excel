import {Draw} from '../baserender/canvas';
import {h} from '../baserender/element';
import * as _ from './table_private';

export default class Table {
    constructor(viewData) {
        this.$box = h('canvas', 'excel-table');
        const el = this.$box.el;
        this.context = el.getContext('2d');
        this.draw = new Draw(el);// canvas操作的类
        this.el = el;
        this.$viewdata = viewData;
    }
    init(sheetRect) {
        this.$box.attr(sheetRect);
    }
    render() {
        this.clear();
        _.renderContentGrid.call(this);// 绘制content格子
        _.renderFixedHeaders.call(this);// 绘制第0行/第0列的 索引栏
        _.renderContent.call(this);// 将表格数据填充进单元格
    }
    clear() {
        this.draw.clear();
    }
    getRect() {
        return this.$box.box();
    }
}