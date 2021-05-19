/**
 * @file 固定的行列索引栏
 * - init: 根据gridmap绘制
 * - resizer：行列伸缩
 * - select：选中 对应行列的表头块高亮
 * - mousedown：辅助线
 */
import { GridIdxToOffsetMap, RectOffset, ScrollIndexes, Point } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
import { TextRange } from './text-range';
import alphabet from '../../config/alphabet';
import { FIXEDHEADERMARGIN } from '../../model/mdata';

export class FixedHeaderRange extends BaseRange {
    namespace: string;
    // 画布全局状态：滚动距离、画布大小
    private _scrollindexes: ScrollIndexes;
    private _rowheadrect: RectOffset; // 绘制的区域
    private _colheadrect: RectOffset; // 绘制的区域
    private _fixedheadermargin: { left: number; top: number; };
    private _gridmap: GridIdxToOffsetMap;
    private _rect: RectOffset; // 绘制的区域
    private _textRange: TextRange; // 绘制文字的工具类

    getDefaultCfg() {
        return {
            style: {
                bgcolor: '#f4f5f8',
                linewidth: .5,
                linecolor: '#d0d0d0',
                text: {
                    fontColor: '#585757',
                    fontSize: 14,
                    fontFamily: 'sans-serif',
                },
            },
        };
    }
    constructor(
        rangecontroller: RangeRenderController
    ) {
        super(rangecontroller);
        this._fixedheadermargin = FIXEDHEADERMARGIN;
        this._textRange = new TextRange(rangecontroller, this._cfg.style.text);
    }
    _resetdata() {
        // this._scrollindexes = viewData.scrollindexes;
        this._rect = this._canvas.getViewRange();
        this._gridmap = this._props.dataStore.gridmap;
        this._rowheadrect = {
            left: this._fixedheadermargin.left,
            top: 0,
            width: this._rect.width,
            height: this._fixedheadermargin.top,
        };
        this._colheadrect = {
            left: 0,
            top: this._fixedheadermargin.top,
            width: this._fixedheadermargin.left,
            height: this._rect.height,
        };
    }
    render() {
        this._resetdata();
        this._ctx.save();
        this._ctx.translate(-this._fixedheadermargin.left, -this._fixedheadermargin.top);
        this._canvas.drawRegion(this._rowheadrect, this._renderHeader.bind(this, true));
        this._canvas.drawRegion(this._colheadrect, this._renderHeader.bind(this, false));
        this._ctx.restore();
    }
    _renderHeader(isRow: boolean) {
        const { left, top, width, height } = this[`${isRow ? '_rowheadrect' : '_colheadrect'}`];
        const col = this._gridmap[`${isRow ? 'col' : 'row'}`];
        const context = this._ctx;
        context.save();
        this._canvas.applyAttrToCtx({ ...this._style });
        context.fillRect(left, top, width, height);
        let curx = isRow ? left : top;
        const key = isRow ? 'width' : 'height';
        col.forEach((item, idx) => {
            const fixedSize = item[key];
            if (isRow) {
                this._canvas.drawLine({ x: curx, y: top }, { x: curx, y: top + height });
                this._textRange.draw({
                    left: curx,
                    top: top,
                    width: fixedSize,
                    height: height,
                }, this._getText(true, idx));
            }
            else {
                this._canvas.drawLine({ x: left, y: curx }, { x: left + width, y: curx });
                this._textRange.draw({
                    left: left,
                    top: curx,
                    width: width,
                    height: fixedSize,
                }, this._getText(false, idx));
            }
            curx += fixedSize;
        });
        context.restore();
    }
    _getText(isRow: boolean, idx: number): string {
        if (!isRow) return (idx + 1).toString();
        return alphabet.stringAt(idx);
    }
}