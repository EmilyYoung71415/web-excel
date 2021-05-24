import {
    Mdata,
    SourceData,
    GridIdxToOffsetMap,
    ViewTableSize,
    RectOffset,
    Point,
    GridMdata,
    RangeIndexes,
    RangeOffset,
    ViewDataRange,
    ViewDataSource,
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
    computedGridMap: (grid: GridMdata) => void;
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
    private _initselectIdxes: RangeIndexes = null;
    private _viewModel: ViewModel;
    private _proxyViewdata: ViewDataSource;

    private _getDefaultSource() {
        return {
            viewHeight: 800,
            viewWidth: 400,
            ...defaultGridData,
            scrollOffset: { x: 0, y: 0, },
            scrollIndexes: { ri: 0, ci: 0, },
            selectRectIndexes: null,
        }
    }
    constructor(viewmodel: ViewModel, viewopt: ViewTableSize) {
        // ViewModel
        this._viewModel = viewmodel;
        Promise.resolve().then(() => {
            this._init(viewopt);
        });
    }
    _init(viewopt: ViewTableSize) {
        const defaultdata = this._getDefaultSource();
        this._mdata = Object.assign(defaultdata, viewopt, this._grid);
        this.computedGridMap();
        // 将计算出的vdata放入viewmodel：1.proxy对数据进行访问拦截 2. 绑定data-view之间的关系
        // 之后的交互action-view响应：修改this._viewdata即可
        this._proxyViewdata = this._viewModel.init({
            ...viewopt,
            gridmap: this._computedgridmap,
            cellmm: this._initcellmm,
            selectIdxes: this._initselectIdxes,
        });
    }
    resetGrid(grid: GridMdata): GridMdata {
        this._grid = _merge(defaultGridData, grid);
        return this._grid;
    }
    // 绘制基础的棋盘，并生成gripmap
    // 从source配置的行列信息 取得棋盘格的行高、列宽等信息
    computedGridMap() {
        const [rowsumheight, row] = this._buildLinesForRows(true);
        const [colsumwidth, col] = this._buildLinesForRows(false);
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
    _getOffsetByIdx(ri: number, ci: number): RectOffset {
        return draw.getOffsetByIdx(this._computedgridmap, ri, ci);
    }
    _getRangeOffsetByIdxes(rect: RangeIndexes): RangeOffset {
        return draw.getRangeOffsetByIdxes(this._computedgridmap, rect);
    }
    getIdxByPonit(point: Point): RectOffset {
        // 二分查找定位
    }
    _buildLinesForRows(isRow: boolean): [number, any[]] {
        const mdata = this._mdata;
        const rowLen = mdata[`${isRow ? 'row' : 'col'}`].len;
        const rowHeight = mdata[`${isRow ? 'row' : 'col'}`].size;
        const rowMaxHeight = mdata[`${isRow ? 'viewHeight' : 'viewWidth'}`];
        // const rowWidth = mdata[`${isRow ? 'viewWidth' : 'viewHeight'}`];
        let startY = 0;
        let endY = 0;
        let curheight = 0;
        const rowarr = [];
        const rowAddedIdx = mdata.scrollIndexes[`${isRow ? 'ri' : 'ci'}`] || 0;
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