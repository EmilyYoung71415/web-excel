/**
 * @file: 在指定range绘制文字
 * 文字渲染规则：超出则换行，若最后一行仍超出box则省略号
 */

// setRange(xxx).fontColor = 'xx'; 就会触发 该range的textrange重绘
export type Text = {
    // 文字渲染规则：超出则换行且 若最后一行仍超出则省略
    // textWrap: 'wrap' | 'nowrap' | 'ellipsis';
    /** 设置文本内容的当前对齐方式 */
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
    /** 设置在绘制文本时使用的当前文本基线 */
    // textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    /** 字体装饰: 下划线、删除线 */
    textDecoration?: 'underline' | 'line-through';
    /** 字体样式: 斜体 */
    fontStyle?: 'normal' | 'italic';
    /** 文本颜色 */
    fontColor: string;
    /** 文本字体大小 */
    fontSize?: number;
    /** 文本字体 */
    fontFamily?: string;
    /** 文本粗细 */
    fontWeight?: 'normal' | 'bold' | number;
    /** 文本行高 */
    lineHeight?: number;
}

import { RectOffset } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';

interface ITextRange {
    draw: (
        rect: RectOffset,
        text: string,
    ) => void;
}

export class TextRange extends BaseRange implements ITextRange {
    getDefaultCfg() {
        return {
            fontColor: '#ddd',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            lineHeight: 20,
            fontStyle: 'normal',
            textAlign: 'center'
        };
    }
    constructor(
        rangecontroller: RangeRenderController,
        cfg: Text
    ) {
        super(rangecontroller, cfg);
    }
    // render()：index索引、clip裁剪、apply属性设置等等
    // draw()：header时 new的时候的cfg已设置 直接draw文字
    draw(
        rect: RectOffset,
        text: string,
    ): void {
        const { left, top, width, height } = rect;
        this._ctx.fillStyle = 'red';
        const [tx, ty] = [left + (width / 2), top + (height / 2)];
        this._ctx.fillText(text, tx, ty);
    }
}