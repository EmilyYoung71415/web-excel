/**
 * @file 固定的行列索引栏
 * - init: 根据gridmap绘制
 * - resizer：行列伸缩
 * - select：选中 对应行列的表头块高亮
 * - mousedown：辅助线
 */
import { GridIdxToOffsetMap, RectOffset, ScrollIndexes, Point } from '../../type';
import { applyAttrsToContext } from '../../utils/canvas-util/draw';
import { RangeController } from './index';

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
    private _bgstyle: string;
    private _linecolor: string;
    private _linewidth: number;
    private _source: GridIdxToOffsetMap;

    private _props: RangeController;
    constructor(
        _ctx: CanvasRenderingContext2D,
        rangecontroller: RangeController
    ) {
        this._props = rangecontroller;
        this._ctx = _ctx;
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
        this._bgstyle = viewData.style.bgcolor;
        this._linecolor = viewData.style.linecolor;
        this._linewidth = viewData.style.linewidth;
    }
    render() {
        this._source = this._props.dataStore.gridmap;
        this._renderHeader(true);
        this._renderHeader(false);
    }
    _renderHeader(isRow: boolean) {
        const { left, top, width, height } = this[`${isRow ? '_rowheadrect' : '_colheadrect'}`];
        const col = this._source[`${isRow ? 'col' : 'row'}`];
        const context = this._ctx;
        context.save();
        context.clearRect(left, top, width, height);
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        applyAttrsToContext(context, { fillStyle: this._bgstyle });
        context.fillRect(left, top, width, height);
        applyAttrsToContext(context, { strokeStyle: this._linecolor, lineWidth: this._linewidth });
        let curx = isRow ? left : top;
        const key = isRow ? 'width' : 'height';
        col.forEach(item => {
            const colwidth = item[key];
            if (isRow) {
                this._drawLine({ x: curx, y: top }, { x: curx, y: top + height });
            }
            else {
                this._drawLine({ x: left, y: curx }, { x: left + width, y: curx });
            }
            // TODO:  填充字
            curx += colwidth;
        });
        context.restore();
    }
    private _drawLine(start: Point, end: Point) {
        const context = this._ctx;
        context.moveTo(start.x, start.y);    // 起点
        context.lineTo(end.x, end.y);// 终点
        context.stroke();
    }
}