/**
 * @file 表格的渲染能力：可跨cell 与command维护的rangemm一一对应
 * rangeman是一个分层概念，将具体的绘制动作拆解，而不是都写在rendercontent里
 * RangeRenderController是对单独的range，进行管理的功能，注入细节range需要的变量，以及控制range的绘制方式（全局or局部）
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
    render() {
        this.viewdata = this.canvas.$store;
        this._renderGrid();
        this._renderCells(); // cellmm
        // this.renderMerge();
    }
    _renderGrid() {
        const renderList = [this._gridRange, this._fixedHeaderRange];
        for (const range of renderList) {
            range.render();
        }
    }
    _renderCells() {
        const cellmm = this.viewdata.cellmm;
        const { ri: scrollIdxY, ci: scrollIdxX } = this.viewdata.scrollIdexes;
        // 绝对逻辑索引去拿单元格信息，相对逻辑索引找位置
        for (const rowkey in cellmm) {
            const colMaps = cellmm[rowkey];
            const renderkeyri = +rowkey - scrollIdxY;
            if (renderkeyri >= 0 && colMaps) {
                if (colMaps) {
                    for (const colkey in colMaps) {
                        const renderContent = colMaps[colkey];
                        const renderkeyci = +colkey - scrollIdxX;
                        // TODO:  结合merge变量 综合 range的起始
                        // const rangekey = getRangeKey(rowkey, colkey);
                        // this.cellmm[rangekey]存的是当前range有的所有特殊属性
                        // 默认属性的 保留在range实例里无需单独设置
                        if (renderkeyci >= 0 && renderContent) {
                            this._renderCellmm(renderkeyri, renderkeyci, renderContent);
                        }
                    }
                }
            }
        }
    }
    _renderCellmm(rowkey: number, colkey: number, rangedata: Cell) {
        const { gridmap } = this.viewdata;
        const rectOffset = draw.getOffsetByIdx(gridmap, rowkey, colkey);
        // action：注册behavior、registerview
        // 性能优化：首屏渲染离线优化
        this.canvas.drawRegion(rectOffset, () => {
            this._styleRange.render(rectOffset, rangedata);
            this._textRange.render(rectOffset, rangedata);
        });
    }
}