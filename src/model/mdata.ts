import {
    Mdata,
    GridIdxToOffsetMap,
    ViewTableSize,
    RectOffset,
    Point,
    GridMdata
} from '../type/index';
import { _merge } from '../utils/index';

interface IDataModel {
    // 外界载入grid棋盘数据 如果没有主动调用 那会启用默认的生成棋盘格
    resetGrid: (grid: GridMdata) => GridMdata;
    // 当source被设置了关键数据更改的时候 会触发调用
    computedGridMap: (grid: GridMdata) => void;
    // 载入表格数据
    source: (mdata: Mdata) => void;
    // 根据单元格的逻辑索引得到
    getOffsetByIdx: (ri: number, ci: number) => RectOffset;
    // 根据点在画布上的物理坐标得到逻辑索引
    getIdxByPonit: (point: Point) => RectOffset;
}

const defaultGridData = {
    row: { len: 100, size: 25, },
    col: { len: 25, size: 25, },
}

export class DataModel implements IDataModel {
    // 对source进行访问代理 this.source.data = this.data
    // 每次当source变化会重新计算gridmap棋盘格数据
    private _mdata: Mdata;
    private _grid: GridMdata;
    public gridmap: GridIdxToOffsetMap;
    private _getDefaultSource() {
        return {
            // viewHeight: document.documentElement.clientHeight,
            // viewWidth: document.documentElement.clientWidth,
            // // len > viewheight
            // row: { len: 100, size: 25, },
            // col: { len: 25, size: 25, },
            scrollOffset: { x: 0, y: 0, },
            scrollIndexes: { ri: 0, ci: 0, },
            selectRectIndexes: null,
        }
    }
    constructor(viewopt: ViewTableSize) {
        const defaultdata = this._getDefaultSource();
        Promise.resolve().then(() => {
            this._mdata = Object.assign(viewopt, defaultdata, this._grid);
            this.computedGridMap();
            console.log(this.gridmap);
        });
    }
    resetGrid(grid: GridMdata): GridMdata {
        this._grid = _merge(defaultGridData, grid);
        return this._grid;
    }
    computedGridMap() {
        const [rowsumheight, row] = this._buildLinesForRows(true);
        const [colsumwidth, col] = this._buildLinesForRows(false);
        this.gridmap = {
            rowsumheight,
            colsumwidth,
            row,
            col
        }
    }
    source(mdata: Mdata) {

    }
    getOffsetByIdx(ri: number, ci: number): RectOffset {
        const gridmap = this.gridmap;
        return {
            left: gridmap.col[ci].left,
            top: gridmap.row[ri].top,
            width: gridmap.col[ci].width,
            height: gridmap.row[ri].height,
        }
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
                return [curheight, rowarr];
            }
        }
        return [curheight, rowarr];
    }
}