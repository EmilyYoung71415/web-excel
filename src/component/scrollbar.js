import { h } from './element';

export default class Scrollbar {
    constructor(vertical=true){
        this.vertical = vertical;
        this.moveFn = null;
        this.el = h('div', `excel-scrollbar ${vertical ? 'vertical' : 'horizontal'}`)
                    .child(this.contentEl = h('div', ''))
                    .on('scroll',(ev)=>{
                        // 移动距离
                        const { scrollTop, scrollLeft } = ev.target;
                        if (this.moveFn) {
                            this.moveFn(this.vertical ? scrollTop : scrollLeft, ev);
                        }
                    })
    }
    // 决定什么时候显示滚动条 viewDis 躺在 contentDis里  
    set(viewDis, contentDis){
        if(contentDis>viewDis){
            const longKey = this.vertical ?'height' : 'width';
            const shortKey = this.vertical?'width':'height';
            this.el.css(longKey, `${viewDis}px`).show();
            this.contentEl
                .css(shortKey,'1px')
                .css(longKey,`${contentDis}px`);
        }
        else{
            this.el.hide()
        }
        return this;
    }
}