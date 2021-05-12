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
    }
    // 不传则是全部重绘
    // render不支持修改绘制属性
    // 支持全局重绘 or 局部绘制grid
    render(range?: RangeIndexes): void {
        const { gridmap } = this._props.dataStore;
        this._rect = this._canvas.getViewRange();
        this.gridmap = gridmap;
        if (!range) {
            this._renderAll();
        }
        else {
            // this._canvas.drawRegion(this._rect, this._renderAll.bind(this));
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
        const { sri, eri, sci, eci } = range;
        const sx = gridmap.col[sci].left;
        const sy = gridmap.row[sri].top;
        // 传入单元格范围:[1,1]~[3,3]即1,1的左上角~3,3的右下角，即4,4的左上角
        const ex = gridmap.col[eci + 1].left;
        const ey = gridmap.row[eri + 1].top;
        const rect = { left: sx, top: sy, width: ex - sx, height: ey - sy };
        const context = this._ctx;
        const { left, top, width, height } = rect;
        context.clearRect(left, top, width, height);
        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        this._drawLines(range);
        context.restore();
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
        this._drawLines();
        context.restore();
    }
    /**
     * 绘制基础的棋盘，并生成gripmap
     * canvas绘制grid棋盘格：先画多行的横线，再画多列的竖线
     * 从source配置的行列信息 取得棋盘格的行高、列宽等信息
     */
    private _drawLines(range?: RangeIndexes) {
        const gridmap = this.gridmap;
        const allrange = {
            sri: 0,
            eri: gridmap.row.length - 2,
            sci: 0,
            eci: gridmap.col.length - 2,
        };
        const renderrange = range ? range : allrange;
        const { sri, eri, sci, eci } = renderrange;
        // TODO:  datamodel： getoffsetbyidx
        const sx = gridmap.col[sci].left;
        const sy = gridmap.row[sri].top;
        // 传入单元格范围:[1,1]~[3,3]即1,1的左上角~3,3的右下角，即4,4的左上角
        const ex = gridmap.col[eci + 1].left;
        const ey = gridmap.row[eri + 1].top;
        const rect = { left: sx, top: sy, width: ex - sx, height: ey - sy };
        const { left, top, width, height } = rect;
        this._canvas.clearRect(left, top, width, height);
        for (let i = sri; i <= eri; i++) {
            const rowy = gridmap.row[i].top;
            this._canvas.drawLine({ x: sx, y: rowy }, { x: ex, y: rowy });
        }
        // 画竖线
        for (let i = sci; i <= eci; i++) {
            const colx = gridmap.col[i].left;
            this._canvas.drawLine({ x: colx, y: sy }, { x: colx, y: ey });
        }
    }
}