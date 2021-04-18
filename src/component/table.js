import {Draw} from '../baserender/canvas';
import {h} from '../baserender/element';
import * as _ from './table_private';

export default class Table {
    constructor(viewData) {
        this.$box = h('canvas', 'excel-table');
        const {el} = this.$box;
        this.context = el.getContext('2d');
        this.draw = new Draw(el);// canvas操作的类
        this.el = el;
        this.$viewdata = viewData;
        this.isUpdating = false; // 默认为初始化
    }

    init() {
        // 将canvas2倍屏 然后css缩小scale
        // TODO: canvas高清处理
        const {pixelRatio, viewRect} = this.$viewdata;
        const cssText = [
            `transform:scale(${1 / pixelRatio})`,
            'transform-origin:0 0',
        ].join(';');
        this.$box.attr(viewRect);
        this.$box.css('cssText', cssText);
    }

    render() {
        if (!this.isUpdating) {
            this.init();
            this.isUpdating = true;
        }
        this.clear();
        _.renderContentGrid.call(this); // 绘制content格子
        _.renderContent.call(this); // 将表格数据填充进单元格
        _.renderFixedHeaders.call(this); // 绘制第0行/第0列的 索引栏
    }

    clear() {
        this.draw.clear();
    }

    getRect() {
        return this.$box.box();
    }
}
