/**
 * @file 固定的行列索引栏
 * - init: 根据gridmap绘制
 * - resizer：行列伸缩
 * - select：选中 对应行列的表头块高亮
 * - mousedown：辅助线
 */
import { GridIdxToOffsetMap, RectOffset, ScrollIndexes, Point } from '../../type';
import { RangeController } from './index';
import { CanvasView } from '../view/canvas';

const viewData = {
    scrollindexes: { ri: 0, ci: 0 },
    fixedheadermargin: {
        left: 50,
        top: 25,
    },
    rect: {
        left: 0,
        top: 0,
        width: 800, // viewwidth
        height: 400,
    },
    style: {// fixedheader
        bgcolor: '#f4f5f8', // 585757
        linewidth: .5,
        linecolor: '#d0d0d0',
        text: {
            align: 'center',
            baseline: 'middle',
            size: 12,
            family: 'sans-serif',
        },
    },
    // source: gridmap,
};
interface IHeaderRange {
    render: () => void;
}

export class FixedHeaderRange implements IHeaderRange {
    namespace: string;
    // 画布全局状态：滚动距离、画布大小
    private _scrollindexes: ScrollIndexes;
    private _rowheadrect: RectOffset; // 绘制的区域
    private _colheadrect: RectOffset; // 绘制的区域
    // private _fixedheadermargin: { left: number; top: number; };

    // range状态：笔触、绘制区域
    private _ctx: CanvasRenderingContext2D;

    // range绘制细节依赖：绘制数据
    private _style: {
        linecolor: string;
        linewidth: number;
        bgcolor: string;
    };
    private _source: GridIdxToOffsetMap;

    private _props: RangeController;
    private _canvas: CanvasView;
    constructor(
        rangecontroller: RangeController
    ) {
        this._props = rangecontroller;
        this._canvas = rangecontroller.canvas;
        this._ctx = this._canvas.get('context');
        this._scrollindexes = viewData.scrollindexes;
        this._rowheadrect = {
            left: viewData.fixedheadermargin.left,
            top: 0,
            width: viewData.rect.width,
            height: viewData.fixedheadermargin.top,
        };
        this._colheadrect = {
            left: 0,
            top: viewData.fixedheadermargin.top,
            width: viewData.fixedheadermargin.left,
            height: viewData.rect.height,
        };
        this._style = viewData.style;
    }
    render() {
        this._source = this._props.dataStore.gridmap;
        // FIXME:应该是gridmap，先渲染grid 再渲染content
        const fixedheadermargin = {
            left: 50,
            top: 25,
        };
        this._ctx.save();
        this._ctx.translate(-fixedheadermargin.left, -fixedheadermargin.top);
        this._canvas.drawRegion(this._rowheadrect, this._renderHeader.bind(this, true));
        this._canvas.drawRegion(this._colheadrect, this._renderHeader.bind(this, false));
        this._ctx.restore();
    }
    _renderHeader(isRow: boolean) {
        const { left, top, width, height } = this[`${isRow ? '_rowheadrect' : '_colheadrect'}`];
        const col = this._source[`${isRow ? 'col' : 'row'}`];
        const context = this._ctx;
        context.save();
        this._canvas.applyAttrToCtx({ bgcolor: this._style.bgcolor });
        context.fillRect(left, top, width, height);
        this._canvas.applyAttrToCtx({ ...this._style });
        let curx = isRow ? left : top;
        const key = isRow ? 'width' : 'height';
        col.forEach(item => {
            const colwidth = item[key];
            if (isRow) {
                this._canvas.drawLine({ x: curx, y: top }, { x: curx, y: top + height });
            }
            else {
                this._canvas.drawLine({ x: left, y: curx }, { x: left + width, y: curx });
            }
            // TODO:  填充字
            curx += colwidth;
        });
        context.restore();
    }
}