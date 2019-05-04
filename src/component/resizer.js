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
    }
}