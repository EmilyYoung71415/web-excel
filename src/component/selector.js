import { h } from './element';

const gSelectorHeightBorderWidth = 2 * 2 - 1;

export default class Selector{
    constructor() {
        this.cornerEl = h('div', 'excel-selector-corner');
        this.areaEl = h('div', 'excel-selector-area').child(this.cornerEl);
        this.el = h('div', 'excel-selector').child(this.areaEl).hide()
          .on('click.stop', () => {});
        this.offset = null;
        this.indexes = null;
        this.sIndexes = null;
        this.eIndexes = null;
    }
    // 单元格逻辑索引 位置 设置seletor位置将其附着在单元格上
    set(indexes, offset){
        this.indexes = indexes;
        this.sIndexes = indexes;
        this.eIndexes = indexes;
        this.offset = offset;
        this.setAreaOffset();
        this.el.show();
    }
    setAreaOffset() {
        const {
            left, top, width, height,
        } = this.offset;
        this.areaEl.offset({
            width: width - gSelectorHeightBorderWidth,
            height: height - gSelectorHeightBorderWidth,
            left,
            top,
        });
    }
}