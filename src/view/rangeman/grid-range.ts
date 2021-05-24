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
import { GridIdxToOffsetMap, RectOffset, RangeIndexes } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
import { draw } from '../../utils';
import { FIXEDHEADERMARGIN } from '../../model/mdata';
interface IGridRange {
    render: (gridmap: GridIdxToOffsetMap) => void;
}

export class GridRange extends BaseRange implements IGridRange {
    readonly namespace = 'grid-range';
    // 画布全局状态：滚动距离、画布大小
    private _fixedheadermargin: { left: number; top: number; }; // 为索引栏绘制预留区域

    private _gridmap: GridIdxToOffsetMap;
    private _rect: RectOffset; // 绘制的区域
    private _range: RangeIndexes; // 当前range绘制的所在gridmap的逻辑索引
    getDefaultCfg() {
        return {
            style: {
                bgcolor: '#fff',
                linewidth: 1,
                linecolor: '#333333',
            },
        };
    }
    constructor(rangecontroller: RangeRenderController) {
        super(rangecontroller);
        this._fixedheadermargin = FIXEDHEADERMARGIN;
    }
    // 在render处初始化 this上的数据：rect、gridmap
    render(gridmap: GridIdxToOffsetMap): void {
        this._gridmap = gridmap;
        // 局部重绘grid
        // if (range) {
        //     this._range = range;
        //     this._rect = draw.getRangeOffsetByIdxes(this._gridmap, range);
        //     this._canvas.drawRegion(this._rect, this._renderDetail.bind(this));
        // }
        this._range = { sri: 0, eri: this._gridmap.row.length - 2, sci: 0, eci: this._gridmap.col.length - 2 };
        this._rect = this._canvas.getViewRange();
        this._renderAll();
    }
    private _renderAll() {
        this._ctx.translate(this._fixedheadermargin.left, this._fixedheadermargin.top);
        this._renderDetail();
    }
    // range不传是全部重绘
    private _renderDetail() {
        this._renderGridBg();
        this._renderGridLines();
    }
    private _renderGridBg() {
        const context = this._ctx;
        context.save();
        const { left, top, width, height } = this._rect;
        this._canvas.clearRect(left, top, width, height);
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
        this._drawLines();
        context.restore();
    }
    //  canvas绘制grid棋盘格：先画多行的横线，再画多列的竖线
    private _drawLines() {
        const renderange = this._range;
        const { sri, sci, eci, eri } = renderange;
        const { left, top, right, bottom, width, height } = draw.getRangeOffsetByIdxes(this._gridmap, renderange);
        // this._canvas.clearRect(left, top, width, height);
        // 画横线
        for (let i = sri; i <= eri + 1; i++) {
            const rowy = this._gridmap.row[i].top;
            this._canvas.drawLine({ x: left, y: rowy }, { x: right, y: rowy });
        }
        // 画竖线
        for (let i = sci; i <= eci + 1; i++) {
            const colx = this._gridmap.col[i].left;
            this._canvas.drawLine({ x: colx, y: top }, { x: colx, y: bottom });
        }
    }
}