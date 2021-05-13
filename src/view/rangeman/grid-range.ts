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
import { GridIdxToOffsetMap, RectOffset, ScrollIndexes, RangeIndexes } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';
import { draw } from '../../utils';
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
    }
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

    // 棋盘映射: idx=>物理坐标
    public gridmap: GridIdxToOffsetMap;
    private _allrange: RangeIndexes;
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
        this._scrollindexes = gridRangeViewData.scrollindexes;
        this._fixedheadermargin = gridRangeViewData.fixedheadermargin;
        this.namespace = 'grid-range';
        window.addEventListener('click', () => this.renderRange({ sri: 0, sci: 0, eri: 3, eci: 3 }))
    }
    // 不传则是全部重绘
    // render不支持修改绘制属性
    // 支持全局重绘 or 局部绘制grid
    render(range?: RangeIndexes): void {
        const { gridmap } = this._props.dataStore;
        this._rect = this._canvas.getViewRange();
        this.gridmap = gridmap;
        this._allrange = { sri: 0, eri: gridmap.row.length - 2, sci: 0, eci: gridmap.col.length - 2 };
        if (!range) {
            this._renderAll();
        }
        else {
            this.renderRange(range);
        }
    }
    _renderAll() {
        // console.log(this)
        const ctx = this._ctx;
        const fixedHeaderPadding = this._fixedheadermargin;
        ctx.translate(fixedHeaderPadding.left, fixedHeaderPadding.top);
        this._renderGridBg();
        this._renderGridLines();
    }
    renderRange(range: RangeIndexes) {
        const gridmap = this.gridmap;
        const context = this._ctx;
        const { left, top, width, height } = draw.getRangeOffsetByIdxes(gridmap, range);
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
        const gridmap = this.gridmap;
        context.save();
        const { left, top, width, height } = !range ? this._rect : draw.getRangeOffsetByIdxes(gridmap, range);
        this._canvas.clearRect(left, top, width, height);
        this._canvas.applyAttrToCtx({ bgcolor: this._style.bgcolor });
        context.fillRect(left, top, width, height);
        context.restore();
    }
    private _renderGridLines(range?: RangeIndexes) {
        const context = this._ctx;
        context.save();
        this._canvas.applyAttrToCtx({
            linecolor: range ? 'blue' : this._style.linecolor,
            linewidth: this._style.linewidth,
        });
        // 开始遍历画线
        this._drawLines(range);
        context.restore();
    }
    /**
     * 绘制基础的棋盘，并生成gripmap
     * canvas绘制grid棋盘格：先画多行的横线，再画多列的竖线
     * 从source配置的行列信息 取得棋盘格的行高、列宽等信息
     */
    private _drawLines(range?: RangeIndexes) {
        const gridmap = this.gridmap;
        const renderange = range ? range : this._allrange;
        const { sri, sci, eci, eri } = renderange;
        const { left, top, right, bottom, width, height } = draw.getRangeOffsetByIdxes(gridmap, renderange);
        // this._canvas.clearRect(left, top, width, height);
        // TODO：思考这一层 需要 加上scrollidx的影响吗
        for (let i = sri; i <= eri; i++) {
            const rowy = gridmap.row[i].top;
            this._canvas.drawLine({ x: left, y: rowy }, { x: right, y: rowy });
        }
        // 画竖线
        for (let i = sci; i <= eci; i++) {
            const colx = gridmap.col[i].left;
            this._canvas.drawLine({ x: colx, y: top }, { x: colx, y: bottom });
        }
    }
}