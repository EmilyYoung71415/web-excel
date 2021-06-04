/**
 * @file 滚动条
 */
import { Shape } from '../../abstract/shape-base';
import { modifyCSS } from '../../utils';
export class ScrollBar extends Shape {
    private $vertical: HTMLElement;
    private $horizontal: HTMLElement;
    initEvent() {
        const $vertical = document.querySelector('.xexcel-scrollbar-wrapper .vertical') as HTMLElement;
        const $horizontal = document.querySelector('.xexcel-scrollbar-wrapper .horizontal') as HTMLElement;
        this.$vertical = $vertical;
        this.$horizontal = $horizontal;
        this.initSize();
    }
    createRender() {
        return `
            <div class="xexcel-scrollbar-wrapper">
                <div class="xexcel-scrollbar vertical" style="display: none">
                    <div class="xexcel-scrollbar-inner inner" style="width: 1px;"></div>
                </div>
                <div class="xexcel-scrollbar horizontal" style="display: none">
                    <div class="xexcel-scrollbar-inner inner" style="height: 1px;"></div>
                </div>
            </div>
        `
    }
    initSize() {
        const $verticalInner = this.$vertical.querySelector('.inner') as HTMLElement;
        const $horizontalInner = this.$horizontal.querySelector('.inner') as HTMLElement;

        const { viewH, viewW, contentH, contentW } = this.engine.getBoxSize();
        const verticalShow = contentH > viewH;
        const horizontalShow = contentW > viewW;
        modifyCSS(this.$vertical, {
            height: viewH + 'px',
            display: verticalShow ? 'block' : 'none',
        });
        modifyCSS($verticalInner, {
            height: contentH + 'px',
        });

        modifyCSS(this.$horizontal, {
            width: viewW + 'px',
            display: horizontalShow ? 'block' : 'none',
        });
        modifyCSS($horizontalInner, {
            width: contentW + 'px',
        });
    }
}