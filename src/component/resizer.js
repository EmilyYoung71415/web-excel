import {h} from './element';
import {mouseMoveUp} from '../events/event';
export default class Resizer {
    constructor(vertical = false, minDistance) {
        this.el = h('div', `excel-resizer ${vertical ? 'vertical' : 'horizontal'}`)
            .children(
                this.hoverEl = h('div', 'excel-resizer-hover')
                    .on('mousedown.stop', evt => this.mousedownHandler(evt)),
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
        })
            .hide();
    }
    // rect : {top, left, width, height}
    // line : {width, height}
    show(rect, line) {
        const {
            moving, vertical, hoverEl, lineEl, el,
        } = this;
        if (moving) {
            return;
        }
        this.cRect = rect;
        const {
            left, top, width, height,
        } = rect;
        el.offset({
            left: vertical ? left + width - 5 : left,
            top: vertical ? top : top + height - 5,
        }).show();
        hoverEl.offset({
            width: vertical ? 5 : width, // 竖即第一列上的hover，宽度格子宽度，高度5
            height: vertical ? height : 5,
        });
        lineEl.offset({
            width: vertical ? 0 : line.width,
            height: vertical ? line.height : 0,
        });
    }
    mousedownHandler(evt) {
        let startEvt = evt;
        const {
            el, lineEl, cRect, vertical, minDistance,
        } = this;
        let distance = vertical ? cRect.width : cRect.height;
        lineEl.show();
        mouseMoveUp(window, moveFunc.bind(this), moveUp.bind(this));
        function moveFunc(e) {
            this.moving = true;
            if (startEvt !== null && e.buttons === 1) {
                if (vertical) {
                    distance += e.movementX;
                    if (distance > minDistance) {
                        el.css('left', `${cRect.left + distance}px`);
                    }
                }
                else {
                    distance += e.movementY;
                    if (distance > minDistance) {
                        el.css('top', `${cRect.top + distance}px`);
                    }
                }
                startEvt = e;
            }
        }

        function moveUp() {
            startEvt = null;
            lineEl.hide();
            this.moving = false;
            this.hide();
            const {finishedFn} = this;
            if (finishedFn && finishedFn instanceof Function) {
                if (distance < minDistance) {
                    distance = minDistance;
                }
                finishedFn(cRect, distance);
            }
        }
    }
}