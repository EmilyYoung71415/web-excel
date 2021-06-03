/**
 * @file 选区
 */
import { modifyCSS } from '../../utils';
import { Shape } from '../../abstract/shape-base';
import { Range, Rect } from '../../type';

export class Selector extends Shape {
    initEvent() {
        this.engine.on('canvas:cellclick', (rect: Rect) => {
            this.handleSelect({
                sri: rect.ri,
                sci: rect.ci,
                eri: rect.ri,
                eci: rect.ci,
                ...rect,
            });
        });
        this.engine.on('canvas:select', (rect: Range) => {
            this.handleSelect(rect);
        });
    }
    createRender() {
        return `
            <div class="xexcel-selector">
                <div class="xexcel-selector-area" contenteditable="true" style="display:none">
                    <div class="xexcel-selector-corner"></div>
                </div>
            </div>
        `;
    }
    handleSelect(rect: Range) {
        const $selector = document.querySelector('.xexcel-selector .xexcel-selector-area') as HTMLElement;
        const { sri, sci, eri, eci } = rect;
        if (sri === -1 && sci === -1) {
            modifyCSS($selector, { display: 'none' });
            return;
        }
        // 行选
        if (sci === -1 && eri >= 0) {
            rect.width = this.engine.getSumWidth();
        }
        // 列选
        if (sri === -1 && eci >= 0) {
            rect.height = this.engine.getSumHeight();
        }
        const borderpadding = 2;
        const rectOffset = {
            width: rect.width + 'px',
            height: rect.height + 'px',
            left: (rect.left - 2 * borderpadding) + 'px',
            top: rect.top + 'px',
            display: 'block'
        };
        modifyCSS($selector, rectOffset);
        this.engine.dataModel.setSelect(rect);
    }
}