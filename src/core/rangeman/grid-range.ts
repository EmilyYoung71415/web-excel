/**
 * @file: 表格底层网格绘制
 * 用于：
 *  - 首次渲染表格网格全局绘制
 *  - 局部range刷新时，clearRect后，重绘range范围的grid
 */
import { GridStyle, RangeIndexes, CanvasCtxAttrs } from '../../type';
import { BaseRange } from './index';
import { IEngine } from '../../interface';
import { applyAttrsToContext } from '../../utils/canvas-util/draw';

export class GridRange extends BaseRange {
    constructor(engine: IEngine) {
        super(engine);
        this.namespace = 'grid-range';
    }
    render(
        indexes: RangeIndexes, // 根据indexes计算出offset
        attrs: GridStyle
    ) {
        // 清空：rect
        // 裁剪
        // 绘制： // 绘制的时候设置applyAttrsToContext()
        // 先填充bg
        // 画线
    };
}