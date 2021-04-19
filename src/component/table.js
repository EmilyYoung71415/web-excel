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
        const {pixelRatio, viewRect} = this.$viewdata;
        // 根据pixelRatio进行高清适配
        const cssText = [
            `transform:scale(${1 / pixelRatio})`,
            'transform-origin:0 0',
        ].join(';');
        this.$box.attr({
            width: viewRect.width * pixelRatio,
            height: viewRect.height * pixelRatio,
        });
        this.$box.css('cssText', cssText);
    }

    render() {
        if (!this.isUpdating) {
            this.init();
            this.isUpdating = true;
        }
        this.clear();
        // 绘制顺序决定渲染层次(顶层->底层)：fixedheader > grid > content
        _.renderContent.call(this);      // 将表格数据填充进单元格
        _.renderContentGrid.call(this);  // 绘制content格子
        _.renderFixedHeaders.call(this); // 绘制第0行/第0列的 索引栏
    }

    clear() {
        this.draw.clear();
    }

    getRect() {
        return this.$box.box();
    }
}
