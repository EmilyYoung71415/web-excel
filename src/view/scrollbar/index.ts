/**
 * @file 滚动条
 */
import { Shape } from '../../abstract/shape-base';
export class ScrollBar extends Shape {
    initEvent() {
    }
    createRender() {
        const viewHeight = this.engine.get('viewOption.viewHeight');
        const viewWidth = this.engine.get('viewOption.viewWidth');
        const contentHeight = 75015;
        const contentWidth = 1500;
        return `
            <div class="xexcel-scrollbar-wrapper">
                <div class="xexcel-scrollbar vertical" style="height: ${viewHeight}px; display: block;">
                    <div class="xexcel-scrollbar-inner" style="width: 1px; height: ${contentHeight}px;"></div>
                </div>
                <div class="xexcel-scrollbar horizontal" style="width: ${viewWidth}px; display: block;">
                    <div class="xexcel-scrollbar-inner" style="height: 1px; width: ${contentWidth}px;"></div>
                </div>
            </div>
        `
    }
}