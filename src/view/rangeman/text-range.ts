/**
 * @file: 在指定range绘制文字
 * 文字渲染规则：超出则换行，若最后一行仍超出box则省略号
 */

// setRange(xxx).fontColor = 'xx'; 就会触发 该range的textrange重绘
import { RectOffset, CellText } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
import { assembleFont, getTextWidth } from '../../utils';
import { MAX_BORDER_SIZE } from './style-range';

type UpdateText = CellText & { text?: string };
interface ITextRange {
    render: (
        rect: RectOffset,
        params: UpdateText,
    ) => void;
    draw: (
        rect: RectOffset,
        text: string,
    ) => void;
}

export class TextRange extends BaseRange implements ITextRange {
    readonly namespace = 'text-range';
    // todo: 删除线、下划线 貌似要自己画线
    getDefaultCfg() {
        return {
            fontColor: '#000',
            fontSize: 12,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            fontStyle: 'normal',
            // textAlign: 'center',
            // textBaseline: 'middle',
            cellPadding: 4,
            lineHeight: 12 * 0.14,
        };
    }
    constructor(
        rangecontroller: RangeRenderController,
        cfg?: CellText
    ) {
        super(rangecontroller, cfg);
        this._setFont();
    }
    // render()：index索引、clip裁剪、apply属性设置等等 assembleFont
    // 可以只改属性 也可以只改文字
    render(
        rect: RectOffset,
        params: UpdateText = { text: '' },
    ): void {
        // 上面将idx对应的text、坐标等拿到传下来
        const { text } = params;
        if (!text) return;
        this._setObj(params);
        this._setFont();
        // 减去border的影响
        const contentRect = {
            left: rect.left + MAX_BORDER_SIZE,
            top: rect.top + MAX_BORDER_SIZE,
            width: rect.width - MAX_BORDER_SIZE * 2,
            height: rect.height - MAX_BORDER_SIZE * 2,
        }
        this.draw(rect, text);
        // this._canvas.drawRegion(contentRect, this.draw.bind(this, rect, text));
        this._setObj(this.getDefaultCfg());
    }
    // draw()：header时 new的时候的cfg已设置 直接draw文字
    draw(
        rect: RectOffset,
        text: string,
    ): void {
        const context = this._ctx;
        const padding = this.get('cellPadding');
        const { left, top, width: boxWidth, height: boxHeight } = rect;
        const [boxContentWidth, boxContentHeight] = [boxWidth - padding * 2, boxHeight - padding * 2];
        const font = this.get('font');
        this._canvas.applyAttrToCtx(this._cfg);
        const onelineWidth = Math.ceil(getTextWidth(text, font));
        // 当一行文字的时候，直接针对单元格垂直居中对齐
        if (onelineWidth < boxWidth) {
            this._canvas.applyAttrToCtx({
                ...this._cfg,
                textAlign: 'center',
                textBaseline: 'middle',
            });
            const [tx, ty] = [left + (boxWidth / 2), top + (boxHeight / 2)];
            context.fillText(text, tx, ty);
            return;
        }
        // 当多行文字的时候，需要计算的方式对齐，所以需要先将文字修改为左上对齐
        // 修改对齐方式
        this._canvas.applyAttrToCtx({
            ...this._cfg,
            textAlign: 'left',
            textBaseline: 'top',
        });
        const fontsize = this.get('fontSize');
        const lineHeight = this.get('lineHeight');
        // len：当前串的像素长度 start:新一行以哪个字符开始
        const textLine = { len: 0, start: 0, height: 0, count: 0 };
        const textLineHeight = fontsize + lineHeight;
        const maxlineCount = ~~(boxContentHeight / textLineHeight); // 最多绘制行数
        const tx = left + padding;
        let ty = top + padding;
        for (let i = 0; i < text.length && textLine.count < maxlineCount; i++) {
            const char = text[i];
            textLine.len += getTextWidth(char, font);
            if (textLine.len > boxContentWidth) { // 字符累积到一行的宽度 开始渲染并换行
                textLine.count += 1;
                let cutTxt = '';
                if (textLine.count === maxlineCount) {
                    // i-1用两个字符代替省略号
                    cutTxt = text.substring(textLine.start, i - 1) + '...';
                } else {
                    cutTxt = text.substring(textLine.start, i + 1);
                }
                context.fillText(cutTxt, tx, ty);
                ty += textLineHeight;
                textLine.len = 0;
                textLine.height += textLineHeight;
                textLine.start = i + 1;
            }
        }
        if (textLine.len > 0) {
            context.fillText(text.substring(textLine.start), tx, ty);
        }
    }
    _setFont() {
        const font = assembleFont(this._cfg as CellText);
        this.set('font', font);
    }
}