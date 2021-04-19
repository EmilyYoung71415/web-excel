import {h} from '../baserender/element';

export default class Scrollbar {
    constructor(vertical = true, $viewdata) {
        this.vertical = vertical;
        this.moveFn = null;
        this.$viewdata = $viewdata;
        this.el = h('div', `excel-scrollbar ${vertical ? 'vertical' : 'horizontal'}`)
            .child(this.contentEl = h('div', ''))
            // 滚动方式1:鼠标在滚动条上移动
            .on('scroll.stop', ev => {
                // 移动距离
                const {scrollTop, scrollLeft} = ev.target;
                if (this.moveFn) {
                    this.moveFn(this.vertical ? scrollTop : scrollLeft, ev);
                }
            });
    }

    render() {
        const {viewRect} = this.$viewdata;
        if (this.vertical) {
            this.set(viewRect.height, this.$viewdata.rowTotalHeight());// 竖滚动条
        }
        else {
            this.set(viewRect.width, this.$viewdata.colTotalWidth());// 横滚动条
        }
    }

    // 决定什么时候显示滚动条 viewDis 躺在 contentDis里
    set(viewDis, contentDis) {
        if (contentDis > viewDis) {
            const longKey = this.vertical ? 'height' : 'width';
            const shortKey = this.vertical ? 'width' : 'height';
            this.el.css(longKey, `${viewDis}px`).show();
            this.contentEl
                .css(shortKey, '1px')
                .css(longKey, `${contentDis}px`);
        }
        else {
            this.el.hide();
        }
        return this;
    }

    move(v) { // 调用el.scroll触发scroll事件
        this.el.scroll(v);
        return this;
    }

    scroll() {
        return this.el.scroll();
    }
}
