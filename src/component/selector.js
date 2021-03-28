import { h } from './element';

const gSelectorHeightBorderWidth = 2 * 2 - 1;

export default class Selector{
    constructor(viewdata) {
        this.cornerEl = h('div', 'excel-selector-corner');
        this.areaEl = h('div', 'excel-selector-area').child(this.cornerEl);
        this.el = h('div', 'excel-selector')
            .child(this.areaEl).hide()
            .on('click.stop', () => {});
        this.$viewdata = viewdata; 
    }
    render(){
        const selectCoord = this.$viewdata.getSelectRect();
        if (!selectCoord) return;
        const { left, top, width, height } = selectCoord;
        // FIXME: 滚动单元格附着有点误差
        this.areaEl.offset({
            width: width - gSelectorHeightBorderWidth,
            height: height - gSelectorHeightBorderWidth,
            left,
            top,
        });
        this.el.show();
    }
}