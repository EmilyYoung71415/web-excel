/**
 * @file: 表格底层网格绘制
 * 用于：
 *  - 首次渲染表格网格全局绘制
 *  - 局部range刷新时，clearRect后，重绘range范围的grid
 * TODO:api:command层
 *   setRange(RangeIndexes).source(gridRangeViewData).gridRender(); // 直接用全局的 opts
 *   setRange(RangeIndexes).gridRender({linewidth:2});// 局部渲染 & 修改部分设置
 *   setRange(sri:-1, sci:-1).gridRender() // 全局重绘
 */
import { GridIdxToOffsetMap, RectOffset, GridMdata, ScrollIndexes, Point, RangeIndexes } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
// 当前view组件渲染所需的viewdata
// 以后会由上层注入进来
const gridRangeViewData = {
    scrollindexes: { ri: 0, ci: 0 },
    rect: {
        left: 0,
        top: 0,
        width: 800, // viewwidth
        height: 400,
    },
    fixedheadermargin: {
        left: 50,
        top: 25,
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
            4: {
                size: 140,
            },
        },
    },
};
interface IGridRange {
    render: (renderRange?: RangeIndexes) => void;
}

export class GridRange extends BaseRange implements IGridRange {
    namespace: string;
    // 画布全局状态：滚动距离、画布大小
    private _scrollindexes: ScrollIndexes;
    private _rect: RectOffset; // 绘制的区域
    private _fixedheadermargin: { left: number; top: number; }; // 为索引栏绘制预留区域
    private _source: GridMdata;

    // 棋盘映射: idx=>物理坐标
    public gridmap: GridIdxToOffsetMap;
    getDefaultCfg() {
        return {
            style: {
                bgcolor: '#fff',
                // cellpadding:,
                linewidth: .5,
                linecolor: '#333333',
            },
        };
    }
    constructor(rangecontroller: RangeRenderController) {
        super(rangecontroller);
        this._rect = this._canvas.getViewRange();
        this._scrollindexes = gridRangeViewData.scrollindexes;
        this._fixedheadermargin = gridRangeViewData.fixedheadermargin;
        this.namespace = 'grid-range';
        this._source = gridRangeViewData.source;
        this.gridmap = { rowsumheight: 0, colsumwidth: 0, row: [], col: [] };

        window.addEventListener('click', () => {
            this.render({ sri: 0, sci: 0, eri: 4, eci: 4 });
        });
    }
    // 不传则是全部重绘
    // render不支持修改绘制属性
    // 支持全局重绘 or 局部绘制grid
    render(renderRange?: RangeIndexes): void {
        // this._canvas.drawRegion(this._rect, this._renderAll.bind(this));
        // // 清空：rect // 只有range的最底层zindex会清空当前选区
        // this.clear();
        // // 保存上下文，设置 clip
        // context.beginPath();
        // context.rect(left, top, width, height);
        // context.clip();
        // this._renderGridBg();
        // this._renderGridLines();
        // this._props.handleSetData('gridmap', this.gridmap);
        // context.restore();
        if (!renderRange) {
            this._renderAll();
        }
        else {
            // const { sri, eri, sci, eci } = renderRange;
            // const sx = this.gridmap.col[sci].left;
            // const sy = this.gridmap.row[sri].top;
            // // 传入单元格范围:[1,1]~[3,3]即1,1的左上角~3,3的右下角，即4,4的左上角
            // const ex = this.gridmap.col[eci + 1].left;
            // const ey = this.gridmap.row[eri + 1].top;
            // const rect = { left: sx, top: sy, width: ex - sx, height: ey - sy };
            // this._canvas.drawRegion(rect, this.renderRange.bind(this));
        }
    }
    _renderAll() {
        // console.log(this)
        const ctx = this._ctx;
        const fixedHeaderPadding = this._fixedheadermargin;
        ctx.translate(fixedHeaderPadding.left, fixedHeaderPadding.top);
        this._renderGridBg();
        this._renderGridLines();
        this._props.handleSetData('gridmap', this.gridmap);
    }
    renderRange(context) {
        // --------
        // TODO: 单元格合并的时候 fillStyle = bgclor && fillRect(range)即可
        // 局部刷新暂时先写死样式 以与 全局的基本棋盘绘制 区分开
        // context.strokeStyle = 'blue';
        // context.lineWidth = 2;
        // applyAttrsToContext(context, this._linestyle);
        // --------
        // 画横线
        // for (let i = sri; i <= eri; i++) {
        //     const rowy = this.gridmap.row[i].top;
        //     this._canvas.drawLine({ x: sx, y: rowy }, { x: ex, y: rowy });
        // }
        // // 画竖线
        // for (let i = sci; i <= eci; i++) {
        //     const colx = this.gridmap.col[i].left;
        //     this._canvas.drawLine({ x: colx, y: sy }, { x: colx, y: ey });
        // }
        // context.restore();
    }
    private _renderGridBg() {
        const context = this._ctx;
        const { left, top, width, height } = this._rect;
        context.save();
        this._canvas.applyAttrToCtx({ bgcolor: this._style.bgcolor });
        context.fillRect(left, top, width, height);
        context.restore();
    }
    private _renderGridLines() {
        const context = this._ctx;
        context.save();
        this._canvas.applyAttrToCtx({
            linecolor: this._style.linecolor,
            linewidth: this._style.linewidth,
        });
        // 开始遍历画线
        this._drawLinesForRows(true);
        this._drawLinesForRows(false);
        context.restore();
    }
    /**
     * 绘制基础的棋盘，并生成gripmap
     * canvas绘制grid棋盘格：先画多行的横线，再画多列的竖线
     * 从source配置的行列信息 取得棋盘格的行高、列宽等信息
     * @param isRow 在画横线 or 竖线
     */
    // TODO: 重写 这块应该是直接拿gridmap来进行渲染的
    private _drawLinesForRows(isRow: boolean) {
        const rowLen = this._source[`${isRow ? 'row' : 'col'}`].len;
        const rowHeight = this._source[`${isRow ? 'row' : 'col'}`].size;
        const rowMaxHeight = this._rect[`${isRow ? 'height' : 'width'}`];
        const rowWidth = this._rect[`${isRow ? 'width' : 'height'}`];
        let startY = 0;
        let endY = 0;
        let curheight = 0;
        const rowAddedIdx = this._scrollindexes[`${isRow ? 'ri' : 'ci'}`] || 0;
        for (let i = 0; i < rowLen; i++) {
            if (isRow) {
                // 要开放为画range的话 就不能是写死的:x:0
                this._canvas.drawLine({ x: 0, y: startY }, { x: rowWidth, y: endY });
            }
            else {
                this._canvas.drawLine({ x: startY, y: 0 }, { x: endY, y: rowWidth });
            }
            const curSpRow = (this._source[`${isRow ? 'rowm' : 'colm'}`] || {})[i + rowAddedIdx];
            const curRowHeight = curSpRow ? curSpRow.size : rowHeight;
            startY = endY += curRowHeight;
            curheight += curRowHeight;
            this.gridmap[`${isRow ? 'row' : 'col'}`][i] = {
                [`${isRow ? 'ri' : 'ci'}`]: i,
                [`${isRow ? 'top' : 'left'}`]: startY - curRowHeight,
                [`${isRow ? 'height' : 'width'}`]: curRowHeight,
            };
            if (curheight > rowMaxHeight) {
                this.gridmap[`${isRow ? 'rowsumheight' : 'colsumwidth'}`] = curheight;
                break;
            }
        }
    }
}