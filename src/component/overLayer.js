/**
 * @file 盖在canvas表格上的一层dom
 * 宿主般的存在：
 *      selector、之后的右键菜单等
 */
import {h} from '../baserender/element';

export default class OverLayer {
    constructor(selector, viewData) {
        this.$box = h('div', 'excel-overlayer').children(
            this.$innerbox = h('div', 'excel-overlayer-content').children(
                selector.el
            )
        );
        this.el = this.$box.el;
        this.$viewdata = viewData;
    }
    init({sheetRect, tableInnerRect}) {
        this.$box.offset(sheetRect);// 包裹层
        this.$innerbox.offset(tableInnerRect);// table内容层
    }
    on(...args) {
        this.$box.on(...args);
        return this;
    }
    checkFocusing(ev = {}) {
        return this.$box.el.contains(ev.target);
    }
};