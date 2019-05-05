import { h } from './element';
export default class Resizer{
    constructor(vertical = false,minDistance){
        this.el = h('div', `excel-resizer ${vertical ? 'vertical' : 'horizontal'}`)
                  .children(
                    this.hoverEl = h('div', 'excel-resizer-hover'),
                    this.lineEl = h('div', 'excel-resizer-line').hide()
                  ).hide();
        this.cRect = null;
        this.finishedFn = null;
        this.minDistance = minDistance;
        this.vertical = vertical;
        this.moving = false;// 状态记录
    }
    hide() {
        this.el.offset({
          left: 0,
          top: 0,
        }).hide();
    }
    // rect : {top, left, width, height}
    // line : {width, height}
    show(rect,line){
        const {
            moving, vertical, hoverEl, lineEl, el,
        } = this;
        if (moving) return;
        this.cRect = rect;
        const {
            left, top, width, height,
        } = rect;
        el.offset({
            left: vertical ? left + width - 5 : left,
            top: vertical ? top : top + height - 5,
        }).show();
        hoverEl.offset({
            width: vertical ? 5 : width,// 竖即第一列上的hover，宽度格子宽度，高度5
            height: vertical ? height : 5,
        });
    }
}