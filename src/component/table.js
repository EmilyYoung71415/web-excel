import {Draw} from '../draw/canvas';
import * as _ from './table_private';

export default class Table {
    constructor(el, viewData) {
        this.el = el;
        this.context = el.getContext('2d');
        this.draw = new Draw(el);// canvas操作的类
        this.$viewdata = viewData;
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
}