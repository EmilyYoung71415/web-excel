/**
 * @file: 表格底层网格绘制
 * 用于：
 *  - 首次渲染表格网格全局绘制
 *  - 局部range刷新时，clearRect后，重绘range范围的grid
 */
import { GridStyle, RectOffset, GridMdata, ScrollIndexes, Point } from '../../type';
import { applyAttrsToContext } from '../../utils/canvas-util/draw';
// TODO:  模拟range需要的数据
const gridRangeViewData = {
    rect: {
        left: 0,
        top: 0,
        width: 800, // viewwidth
        height: 400,
    },
    style: {
        bgcolor: '#fff',
        // cellpadding:,
        linewidth: .5,
        linecolor: '#333333',
    },
    // 具体的每行：行个数、行高
    source: {
        col: {
            size: 100,
            minsize: 10,
            len: 20,
        },
        colm: {
            1: {
                size: 60,
            },
            4: {
                size: 140,
            },
        },
        row: {
            size: 25,
            len: 20,
        },
        rowm: {
            1: {
                size: 40,
            },
        },
    },
};

type lineStyle = {
    lineWidth: number;
    strokeStyle: string;
}
// TODO: render Grid: 初始化的棋盘、 指定range的grid重绘
// fixedheader：索引栏单独range
export class GridRange {
    namespace: string;
    private _ctx: CanvasRenderingContext2D;
    private _rect: RectOffset;
    private _bgstyle: { fillStyle: string };
    private _linestyle: lineStyle;
    private _source: GridMdata;
    private _scrollindexes: ScrollIndexes;
    private _viewRect: { width: number; height: number };

    constructor(_ctx: CanvasRenderingContext2D) {
        this._ctx = _ctx;
        this.namespace = 'grid-range';
        // 得到必备的数据
        this._rect = gridRangeViewData.rect;
        this._bgstyle = {
            fillStyle: gridRangeViewData.style.bgcolor,
        };
        this._linestyle = {
            lineWidth: gridRangeViewData.style.linewidth,
            strokeStyle: gridRangeViewData.style.linecolor,
        };
        this._source = gridRangeViewData.source;
    }
    clear() {
        const rect = this._rect;
        this._ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
    }
    render(viewdata) {
        this._viewRect = { height: 400, width: 800 };
        this._scrollindexes = { ri: 0, ci: 0 };
        const { left, top, width, height } = this._rect;
        const context = this._ctx;
        // 清空：rect // 只有range的最底层zindex会清空当前选区
        this.clear();
        // 保存上下文，设置 clip
        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        this._renderGridBg();
        this._renderGridLines();
        context.restore();
    }
    private _renderGridBg() {
        const { left, top, width, height } = this._rect;
        const context = this._ctx;
        context.save();
        applyAttrsToContext(context, this._bgstyle);
        context.fillRect(left, top, width, height);
        context.restore();
    }
    private _renderGridLines() {
        const context = this._ctx;
        context.save();
        applyAttrsToContext(context, this._linestyle);
        // 开始遍历画线
        context.translate(50, 30); // 给fixedheader留空间
        this._drawLinesForRows(true);
        this._drawLinesForRows(false);
        context.restore();
    }
    private _drawLinesForRows(isRow: boolean) {
        const rowLen = this._source[`${isRow ? 'row' : 'col'}`].len;
        const rowHeight = this._source[`${isRow ? 'row' : 'col'}`].size;
        const rowMaxHeight = this._viewRect[`${isRow ? 'height' : 'width'}`];
        const rowWidth = this._viewRect[`${isRow ? 'width' : 'height'}`];
        let startY = 0;
        let endY = 0;
        let curheight = 0;
        const rowAddedIdx = this._scrollindexes[`${isRow ? 'ri' : 'ci'}`] || 0;
        for (let i = 0; i < rowLen; i++) {
            if (isRow) {
                this._drawLine({ x: 0, y: startY }, { x: rowWidth, y: endY });
            }
            else {
                this._drawLine({ x: startY, y: 0 }, { x: endY, y: rowWidth });
            }
            const curSpRow = this._source[`${isRow ? 'rowm' : 'colm'}`][i + rowAddedIdx];
            const curRowHeight = curSpRow ? curSpRow.size : rowHeight;
            startY = endY += curRowHeight;
            curheight += curRowHeight;
            if (curheight > rowMaxHeight) break;
        }
    }
    private _drawLine(start: Point, end: Point) {
        const context = this._ctx;
        context.moveTo(start.x, start.y);    // 起点
        context.lineTo(end.x, end.y);// 终点
        context.stroke();
    }
}