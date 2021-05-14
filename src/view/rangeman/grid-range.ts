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
// 当前view组件渲染所需的viewdata
// 以后会由上层注入进来
const gridRangeViewData = {
    fixedheadermargin: {
        left: 50,
        top: 25,
    }
};
interface IGridRange {
    render: (renderRange?: RangeIndexes) => void;
}

export class GridRange extends BaseRange implements IGridRange {
    readonly namespace = 'grid-range';
    // 画布全局状态：滚动距离、画布大小
    private _fixedheadermargin: { left: number; top: number; }; // 为索引栏绘制预留区域

    // 画布数据：gridmap：this._props.dataStore.gridmap
    private _gridmap: GridIdxToOffsetMap;
    private _allrange: RangeIndexes;
    private _rect: RectOffset; // 绘制的区域
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
        this._fixedheadermargin = gridRangeViewData.fixedheadermargin;
        // window.addEventListener('click', () => this._renderRange({ sri: 0, sci: 0, eri: 3, eci: 3 }))
    }
    // 在render处初始化 this上的数据：rect、gridmap
    render(range?: RangeIndexes): void {
        this._gridmap = this._props.dataStore.gridmap;
        this._allrange = { sri: 0, eri: this._gridmap.row.length - 2, sci: 0, eci: this._gridmap.col.length - 2 };
        this._rect = this._canvas.getViewRange();

        if (!range) {
            this._renderAll();
        }
        else {
            this._renderRange(range);
        }
    }
    private _renderAll() {
        const ctx = this._ctx;
        const fixedHeaderPadding = this._fixedheadermargin;
        ctx.translate(fixedHeaderPadding.left, fixedHeaderPadding.top);
        this._renderGridBg();
        this._renderGridLines();
    }
    private _renderRange(range: RangeIndexes) {
        const context = this._ctx;
        const { left, top, width, height } = draw.getRangeOffsetByIdxes(this._gridmap, range);
        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        this._renderGridBg(range);
        this._renderGridLines(range);
        context.restore();
    }
    private _renderGridBg(range?: RangeIndexes) {
        const context = this._ctx;
        context.save();
        const { left, top, width, height } = !range ? this._rect : draw.getRangeOffsetByIdxes(this._gridmap, range);
        this._canvas.clearRect(left, top, width, height);
        this._canvas.applyAttrToCtx({ bgcolor: this._style.bgcolor });
        context.fillRect(left, top, width, height);
        context.restore();
    }
    private _renderGridLines(range?: RangeIndexes) {
        const context = this._ctx;
        context.save();
        this._canvas.applyAttrToCtx({
            linecolor: this._style.linecolor,
            linewidth: this._style.linewidth,
        });
        // 开始遍历画线
        this._drawLines(range);
        context.restore();
    }
    //  canvas绘制grid棋盘格：先画多行的横线，再画多列的竖线
    private _drawLines(range?: RangeIndexes) {
        const renderange = range ? range : this._allrange;
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