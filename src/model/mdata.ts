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
    RectIndexes,
    Cell,
    ScrollOffset,
    TableStatus
} from '../type/index';
import { _merge, draw, isObj, each } from '../utils/index';
import { Operation, Command } from './command';
import { ViewModel } from './vdata';

export const FIXEDHEADERMARGIN = {
    left: 50,
    top: 25,
}

export const BUFFERPADDING = 2;

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
    command: (op: Operation) => void;
    getCell: (point: RectIndexes) => Cell;
    getRowHeight: (index: number) => number;
    getColWidth: (index: number) => number;
    getStatus: () => TableStatus;
    emit: (evt: string, ...args: any[]) => void;
}

const defaultGridData = {
    row: { len: 100, size: 25, },
    col: { len: 25, size: 25, },
    colm: {},
    rowm: {},
    cellmm: {},
}

export class DataModel implements IDataModel {
    // modeldata：视图数据、互动数据 计算出viewdata
    _mdata: Mdata;
    private _boxrealsize: number[];
    // sourcedata：griddata => viewtdata: gridmap
    private _grid: GridMdata;

    // ==== viewdata 决定视图的渲染  ====//
    // gridmap 棋盘格布局数据
    private _computedgridmap: GridIdxToOffsetMap;
    // public rangemm: ViewDataRange = {};
    private _initcellmm: ViewDataRange = {};
    private _selectIdxes: RangeIndexes = null;
    private _scrollIdexes: ScrollIndexes = { ri: 0, ci: 0 };
    private _scrollOffset: ScrollOffset = { x: 0, y: 0 };
    private _viewModel: ViewModel;
    private _proxyViewdata: ViewDataSource;
    emit: (evt: string, ...args: any[]) => void; // 父传下来的方法

    private _getDefaultSource() {
        return {
            viewHeight: 800,
            viewWidth: 400,
            ...defaultGridData,
            scrollOffset: { x: 0, y: 0, },
        }
    }
    constructor(viewmodel: ViewModel, data: Mdata) {
        this._selectIdxes = { sri: 1, sci: 1, eri: 1, eci: 1 };
        // ViewModel
        this._viewModel = viewmodel;
        Promise.resolve().then(() => {
            this._init(data);
        });
    }
    _init(data: Mdata) {
        const defaultdata = this._getDefaultSource();
        const _mdata = Object.assign(defaultdata, this._grid, data);
        const _mdatacellmm = _merge(_mdata.cellmm, this._initcellmm);
        _mdata.cellmm = _mdatacellmm;
        const localmdata = this.import();
        this._mdata = _merge(_mdata, localmdata);
        this.computedGridMap(this._scrollIdexes);
        // 将计算出的vdata放入viewmodel：1.proxy对数据进行访问拦截 2. 绑定data-view之间的关系
        // 之后的交互action-view响应：修改this._viewdata即可

        // vdata = ViewTableSize + cellmm + scrollIdexes + gridmap
        // gridmap = f(mdata);

        // import(mdata) : ui = render(vdata = computed(mdata))
        // export:(vdata) => mdata; vTom(vdata);
        // vTom函数：way1 diff f(originmdata) vs vdata反向得到操作
        //          way2 在操作时 维护变化量
        // 先暂时采用way2
        this._proxyViewdata = this._viewModel.init({
            gridmap: this._computedgridmap,
            cellmm: this._initcellmm,
            scrollIdexes: this._scrollIdexes,
            ...this._mdata,
        });
        setTimeout(() => {
            this.command({
                type: 'resizeGrid',
                idx: 1,
                diff: 20,
                isCol: true
            });
        }, 1500);
    }
    import(): Mdata {
        return JSON.parse(localStorage.getItem('excel-2021') || '{}') as unknown as Mdata;
    }
    export() {
        localStorage.setItem('excel-2021', JSON.stringify(this._mdata));
    }
    resetGrid(grid: GridMdata): GridMdata {
        this._grid = _merge(defaultGridData, grid);
        this._boxrealsize = this.getRealContentSize(this._grid);
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
    // TODO: selector、editor的 evt => rect是根据这个函数来的
    // 现在的问题是：resizer会更改gridmap，怎么能实现gridmap更改之后，下面依赖gridmap计算出的东西都重新计算、重绘一遍
    getIdxByPoint(point: Point): Rect {
        // row[i].top <= point.x < row[i+1].top
        const { row, col } = this._proxyViewdata.gridmap;

        const targetCell: Rect = {
            ri: -1,
            ci: -1,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }
        // TODO: perf: 二分查找
        // FIX:  这样的算法算出来，当点位在中间位置时， ij与坐标系标注一致
        // 当无论是在包围盒的哪个边缘，都应该按在中间位置算的
        for (let i = 0; i < row.length; i++) {
            if (row[i].top < point.y && point.y <= row[i + 1].top) {
                // -1 是为了和cellmm的计数对齐，从0开始
                Object.assign(targetCell, row[i - 1]);
            }
        }
        for (let j = 0; j < col.length; j++) {
            if (col[j].left < point.x && point.x <= col[j + 1].left) {
                Object.assign(targetCell, col[j - 1]);
            }
        }
        targetCell.left += BUFFERPADDING * 2; //this._computedgridmap.fixedpadding.left;
        targetCell.top += BUFFERPADDING;//this._computedgridmap.fixedpadding.top;
        return targetCell;
    }
    getCell(point: RectIndexes): Cell {
        if (!this._proxyViewdata.cellmm[point.ri]) return null;
        return this._proxyViewdata.cellmm[point.ri][point.ci];
    }
    // 绘制高度
    getSumHeight(): number {
        return this._computedgridmap.rowsumheight;
    }
    getSumWidth(): number {
        return this._computedgridmap.colsumwidth;
    }
    // [rowsumheight, colsumwidth]
    getRealContentSize(initgrid?: GridMdata): number[] {
        if (this._boxrealsize) return this._boxrealsize;
        const grid = initgrid ? initgrid : this._grid;
        const { row, col, rowm, colm } = grid;
        let colsumwidth = col.len * col.size;
        let rowsumheight = row.len * row.size;
        each(colm, item => {
            colsumwidth -= col.size;
            colsumwidth += item.size;
        });

        each(rowm, item => {
            rowsumheight -= col.size;
            rowsumheight += item.size;
        });
        this._boxrealsize = [rowsumheight, colsumwidth];
        return this._boxrealsize;
    }
    getRowHeight(index: number): number {
        const { row, rowm } = this._grid;
        return rowm[`${index}`] ? rowm[`${index}`].size : row.size;
    }
    getColWidth(index: number): number {
        const { col, colm } = this._grid;
        return colm[`${index}`] ? colm[`${index}`].size : col.size;
    }
    setSelect(range: RangeIndexes): RangeIndexes {
        this._selectIdxes = range;
        return range;
    }
    getStatus(): TableStatus {
        return {
            scroll: {
                offsetX: this._scrollOffset.x,
                offsetY: this._scrollOffset.y,
                ri: this._scrollIdexes.ri,
                ci: this._scrollIdexes.ci
            }
        }
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