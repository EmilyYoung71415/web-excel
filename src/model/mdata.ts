import {
    Mdata,
    SourceData,
    GridIdxToOffsetMap,
    ViewTableSize,
    RectOffset,
    Rect,
    Point,
    GridMdata,
    RangeIndexes,
    RangeOffset,
    ViewDataRange,
    ViewDataSource,
    ScrollIndexes,
} from '../type/index';
import { _merge, draw, isObj } from '../utils/index';
import { Operation, Command } from './command';
import { ViewModel } from './vdata';

export const FIXEDHEADERMARGIN = {
    left: 50,
    top: 25,
}
interface IDataModel {
    // 外界载入grid棋盘数据 如果没有主动调用 那会启用默认的生成棋盘格
    resetGrid: (grid: GridMdata) => GridMdata;
    // 当source被设置了关键数据更改的时候 会触发调用
    computedGridMap: (scroll: ScrollIndexes) => void;
    // 载入表格数据
    source: (sdata: SourceData) => void;
    // 根据单元格的逻辑索引得到
    // getOffsetByIdx: (ri: number, ci: number) => RectOffset;
    // // 根据单元格的逻辑索引得到
    // getRangeOffsetByIdxes: (rect: RangeIndexes) => RangeOffset;
    // 根据点在画布上的物理坐标得到逻辑索引
    getIdxByPonit: (point: Point) => RectOffset;
    command: (op: Operation) => void;
}

const defaultGridData = {
    row: { len: 100, size: 25, },
    col: { len: 25, size: 25, },
}

export class DataModel implements IDataModel {
    // modeldata：视图数据、互动数据 计算出viewdata
    private _mdata: Mdata;
    // sourcedata：griddata => viewtdata: gridmap
    private _grid: GridMdata;

    // ==== viewdata 决定视图的渲染  ====//
    // gridmap 棋盘格布局数据
    private _computedgridmap: GridIdxToOffsetMap;
    // public rangemm: ViewDataRange = {};
    private _initcellmm: ViewDataRange = {};
    private _selectIdxes: RangeIndexes = null;
    private _scrollIdexes: ScrollIndexes = { ri: 0, ci: 0 };
    private _viewModel: ViewModel;
    private _proxyViewdata: ViewDataSource;

    private _getDefaultSource() {
        return {
            viewHeight: 800,
            viewWidth: 400,
            ...defaultGridData,
            scrollOffset: { x: 0, y: 0, },
        }
    }
    constructor(viewmodel: ViewModel, viewopt: ViewTableSize) {
        this._selectIdxes = { sri: 1, sci: 1, eri: 1, eci: 1 };
        // ViewModel
        this._viewModel = viewmodel;
        Promise.resolve().then(() => {
            this._init(viewopt);
        });
    }
    _init(viewopt: ViewTableSize) {
        const defaultdata = this._getDefaultSource();
        this._mdata = Object.assign(defaultdata, viewopt, this._grid);
        this.computedGridMap(this._scrollIdexes);
        // 将计算出的vdata放入viewmodel：1.proxy对数据进行访问拦截 2. 绑定data-view之间的关系
        // 之后的交互action-view响应：修改this._viewdata即可
        this._proxyViewdata = this._viewModel.init({
            ...viewopt,
            gridmap: this._computedgridmap,
            cellmm: this._initcellmm,
            scrollIdexes: this._scrollIdexes,
        });
        // this._proxyViewdata.cellmm[1][1].fontColor = 'red';
        // this._proxyViewdata.cellmm[2] = {}; // 必须要手动sett {} 才能对新加属性形成追踪
        // this._proxyViewdata.cellmm[2][3] = { text: 'www', fontColor: 'red' };
        // this._proxyViewdata.cellmm[2][6] = { text: '哈哈哈哈哈', fontColor: 'red' };


        // new Array(30).fill(1).forEach((item, i) => {
        //     this._proxyViewdata.cellmm[i] = {};
        //     this._proxyViewdata.cellmm[i][1] = { text: i + '_' + 1, }
        // });

        // 滚动模拟
        // setInterval(() => {
        //     this._scrollIdexes.ri++;
        //     // this._scrollIdexes.ci++;
        //     this.computedGridMap(this._scrollIdexes);
        //     this._proxyViewdata.gridmap = this._computedgridmap;
        //     this._proxyViewdata.scrollIdexes = this._scrollIdexes;
        // }, 50)
    }
    resetGrid(grid: GridMdata): GridMdata {
        this._grid = _merge(defaultGridData, grid);
        return this._grid;
    }
    // 绘制基础的棋盘，并生成gripmap
    // 从source配置的行列信息 取得棋盘格的行高、列宽等信息
    computedGridMap(scroll: ScrollIndexes) {
        const [rowsumheight, row] = this._buildLinesForRows(true, scroll.ri);
        const [colsumwidth, col] = this._buildLinesForRows(false, scroll.ci);
        // gridmap棋盘格里记录的索引key是相对的 即当前视图内的scrollindex之后的
        this._computedgridmap = {
            fixedpadding: FIXEDHEADERMARGIN,
            rowsumheight,
            colsumwidth,
            row,
            col
        }
    }
    source(mdata: SourceData) {
        const { cellmm } = mdata;
        if (isObj(cellmm)) {
            this._initcellmm = cellmm;
        }
    }
    command(op: Operation): void {
        // this._proxyViewdata.xxx = xxx;
        return Command[op.type].call(this, op);
    }
    getIdxByPoint(point: Point): Rect {
        // row[i].top <= point.x < row[i+1].top
        const { row, col } = this._computedgridmap;

        const targetCell: Rect = {
            ri: -1,
            ci: -1,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }
        // TODO: perf: 二分查找
        for (let i = 0; i < row.length; i++) {
            if (row[i].top < point.y && point.y < row[i + 1].top) {
                Object.assign(targetCell, row[i]);
            }
        }

        for (let j = 0; j < col.length; j++) {
            if (col[j].left < point.x && point.y < col[j + 1].left) {
                Object.assign(targetCell, col[j]);
            }
        }

        return targetCell;
    }
    _getOffsetByIdx(ri: number, ci: number): RectOffset {
        return draw.getOffsetByIdx(this._computedgridmap, ri, ci);
    }
    _getRangeOffsetByIdxes(rect: RangeIndexes): RangeOffset {
        return draw.getRangeOffsetByIdxes(this._computedgridmap, rect);
    }
    _buildLinesForRows(isRow: boolean, scrollIdx: number): [number, any[]] {
        const mdata = this._mdata;
        const rowLen = mdata[`${isRow ? 'row' : 'col'}`].len;
        const rowHeight = mdata[`${isRow ? 'row' : 'col'}`].size;
        const rowMaxHeight = mdata[`${isRow ? 'viewHeight' : 'viewWidth'}`];
        // const rowWidth = mdata[`${isRow ? 'viewWidth' : 'viewHeight'}`];
        let startY = 0;
        let endY = 0;
        let curheight = 0;
        const rowarr = [];
        // 先采用最简单的，最上面改的方式：
        // gridmap记录viewrange的单元格信息
        // gridmap[0] = 视觉上的0.
        // 实际是 gridmap.index = 整个表格的[scrollidx+index]
        // 滚动 -> gridmap重新计算 -> 整个表格render
        const rowAddedIdx = scrollIdx || 0;
        for (let i = 0; i < rowLen; i++) {
            const curSpRow = (mdata[`${isRow ? 'rowm' : 'colm'}`] || {})[i + rowAddedIdx];
            const curRowHeight = curSpRow ? curSpRow.size : rowHeight;
            startY = endY += curRowHeight;
            curheight += curRowHeight;
            rowarr[i] = {
                [`${isRow ? 'ri' : 'ci'}`]: i,
                [`${isRow ? 'top' : 'left'}`]: startY - curRowHeight,
                [`${isRow ? 'height' : 'width'}`]: curRowHeight,
            };
            if (curheight >= rowMaxHeight) {
                // 多生成一个假数据=cell[i] 主要是为了复用left变量
                rowarr[i + 1] = {
                    [`${isRow ? 'ri' : 'ci'}`]: i + 1,
                    [`${isRow ? 'top' : 'left'}`]: startY,
                    [`${isRow ? 'height' : 'width'}`]: curRowHeight,
                }
                break;
            }
        }
        // 棋盘刚好被整除进 virtualview = realview
        return [curheight, rowarr];
    }
}