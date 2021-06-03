/**
 * @file 选区
 */
import { modifyCSS } from '../../utils';
import { Shape } from '../../abstract/shape-base';
import { Rect } from '../../type';

export class Selector extends Shape {
    initEvent() {
        const $selector = document.querySelector('.xexcel-selector .xexcel-selector-area') as HTMLElement;
        this.engine.on('canvas:cellclick', (rect: Rect) => {
            if (rect.ri === -1 && rect.ci === -1) {
                modifyCSS($selector, { display: 'none' });
                return;
            }
            // 行选
            if (rect.ci === -1) {
                rect.width = this.engine.getSumWidth();
            }
            // 列选
            if (rect.ri === -1) {
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
}