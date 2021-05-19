/**
 * @file: 在指定range绘制文字
 * 文字渲染规则：超出则换行，若最后一行仍超出box则省略号
 */

// setRange(xxx).fontColor = 'xx'; 就会触发 该range的textrange重绘
import { RectOffset, Text } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
import { assembleFont, getTextWidth } from '../../utils';

interface ITextRange {
    draw: (
        rect: RectOffset,
        text: string,
    ) => void;
}

export class TextRange extends BaseRange implements ITextRange {
    getDefaultCfg() {
        return {
            fontColor: '#000',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'center',
            textBaseline: 'middle',
        };
    }
    constructor(
        rangecontroller: RangeRenderController,
        cfg: Text
    ) {
        super(rangecontroller, cfg);
        const font = assembleFont(this._cfg as Text);
        this.set('font', font);
    }
    // render()：index索引、clip裁剪、apply属性设置等等 assembleFont
    // draw()：header时 new的时候的cfg已设置 直接draw文字
    draw(
        rect: RectOffset,
        text: string,
    ): void {
        const { left, top, width, height } = rect;
        this._canvas.applyAttrToCtx(this._cfg);
        const onelineWidth = Math.ceil(getTextWidth(text, this.get('font')));
        if (onelineWidth < width) {
            const [tx, ty] = [left + (width / 2), top + (height / 2)];
            this._ctx.fillText(text, tx, ty);
            return;
        }
    }
}