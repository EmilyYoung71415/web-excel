import {h} from '../baserender/element';

const gSelectorHeightBorderWidth = 2 * 2 - 1;

export default class Selector {
    constructor(viewdata) {
        this.cornerEl = h('div', 'excel-selector-corner');
        this.areaEl = h('div', 'excel-selector-area').child(this.cornerEl);
        this.el = h('div', 'excel-selector')
            .child(this.areaEl).hide()
            .on('click.stop', () => {});
        this.$viewdata = viewdata;
    }
    /**
     * 触发：overlayer的mousemove，单击表格单元格
     * 决定指标：
     *      selectorRectIndexes: 左上起点rect, 右下终点rect [[sri, sci], [eri, eci]]
     *      selectorCoord：{left, top, width, height} // 根据逻辑index 求物理坐标
     * 关联影响：
     *      selector本身：selectStart、selectEnd、selectMove
     *      行列伸缩
     *      行列滚动
     */
    render() {
        const selectCoord = this.$viewdata.getSelectRect();
        if (!selectCoord) {
            return;
        }
        const {left, top, width, height} = selectCoord;
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