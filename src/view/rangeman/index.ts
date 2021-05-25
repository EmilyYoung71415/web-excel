/**
 * @file 表格的渲染能力：可跨cell 与command维护的rangemm一一对应
 * - 网格： grid-range = gridrange + fixedheader-range
 * - 单元格样式内容 cell-range = stylerange + textrange
 * - 选区 selector-range
 * - 合并单元格 merge-range
 * - 条件格式 formula-range
 * - 格式刷 copypaint-range
 */
import { GridRange } from './grid-range';
import { FixedHeaderRange } from './fixedheader-range';
import { TextRange } from './text-range';
import { StyleRange } from './style-range';
import { _merge, draw } from '../../utils';
import { Cell, ViewDataSource } from '../../type';
import { CanvasRender } from '..';

export class RangeRenderController {
    private _gridRange: GridRange;
    private _fixedHeaderRange: FixedHeaderRange;
    private _textRange: TextRange;
    private _styleRange: StyleRange;

    canvas: CanvasRender;
    public viewdata: ViewDataSource;

    constructor(canvas: CanvasRender) {
        this.canvas = canvas;
        // 子range设计成可以拿父实例是为了：1.可以直接使用笔触 2.直接使用父处理好的数据 3.向上通知父
        this._gridRange = new GridRange(this);
        this._fixedHeaderRange = new FixedHeaderRange(this);
        this._textRange = new TextRange(this);
        this._styleRange = new StyleRange(this);
    }
    render(source: ViewDataSource) {
        this.viewdata = source;
        this._renderGrid();
        this._renderCells(); // cellmm
        // this.renderMerge();
    }
    _renderCellmm(rowkey: number, colkey: number, rangedata: Cell) {
        const { gridmap } = this.viewdata;
        const rectOffset = draw.getOffsetByIdx(gridmap, rowkey, colkey);
        // 滚动的view：
        // action：注册behavior、registerview
        // 性能优化：首屏渲染离线优化
        this.canvas.drawRegion(rectOffset, () => {
            this._styleRange.render(rectOffset, rangedata);
            this._textRange.render(rectOffset, rangedata);
        });
    }
    _renderGrid() {
        const renderList = [this._gridRange, this._fixedHeaderRange];
        for (const range of renderList) {
            range.render(this.viewdata.gridmap);
        }
    }
    _renderCells() {
        const cellmm = this.viewdata.cellmm;
        for (const rowkey in cellmm) {
            const colMaps = cellmm[rowkey];
            for (const colkey in colMaps) {
                // TODO:  结合merge变量 综合 range的起始
                // const rangekey = getRangeKey(rowkey, colkey);
                // this.cellmm[rangekey]存的是当前range有的所有特殊属性
                // 默认属性的 保留在range实例里无需单独设置
                this._renderCellmm(+rowkey, +colkey, colMaps[colkey]);
            }
        }
    }
}