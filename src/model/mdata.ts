import {
    Mdata,
    GridIdxToOffsetMap,
    ViewTableSize,
    RectOffset,
    Point,
    GridMdata,
    RangeIndexes,
    RangeOffset
} from '../type/index';
import { _merge, draw } from '../utils/index';
import { CanvasRender } from '../view';

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
    source: (mdata: Mdata) => void;
    // 根据单元格的逻辑索引得到
    // getOffsetByIdx: (ri: number, ci: number) => RectOffset;
    // // 根据单元格的逻辑索引得到
    // getRangeOffsetByIdxes: (rect: RangeIndexes) => RangeOffset;
    // 根据点在画布上的物理坐标得到逻辑索引
    getIdxByPonit: (point: Point) => RectOffset;
}

const defaultGridData = {
    row: { len: 100, size: 25, },
    col: { len: 25, size: 25, },
}

type DataModelConfig = ViewTableSize & {
    canvasrender: CanvasRender
}
export class DataModel implements IDataModel {
    // 对source进行访问代理 this.source.data = this.data
    // 每次当source变化会重新计算gridmap棋盘格数据
    private _mdata: Mdata;
    private _grid: GridMdata;
    private _canvasRender: CanvasRender;
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
    constructor(viewopt: DataModelConfig) {
        Promise.resolve().then(() => {
            this._init(viewopt);
        });
    }
    _init(viewopt: DataModelConfig) {
        const defaultdata = this._getDefaultSource();
        this._mdata = Object.assign(viewopt, defaultdata, this._grid);
        this._canvasRender = viewopt.canvasrender;
        this.computedGridMap();
        // // 离线化 化了再放到画布上
        this._canvasRender.drawAll({
            gridmap: this.gridmap,
            ...viewopt,
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
        this.gridmap = {
            fixedpadding: FIXEDHEADERMARGIN,
            rowsumheight,
            colsumwidth,
            row,
            col
        }
    }
    source(mdata: Mdata) {

    }
    _getOffsetByIdx(ri: number, ci: number): RectOffset {
        return draw.getOffsetByIdx(this.gridmap, ri, ci);
    }
    _getRangeOffsetByIdxes(rect: RangeIndexes): RangeOffset {
        return draw.getRangeOffsetByIdxes(this.gridmap, rect);
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
    _buildFixedHeaderIdx() {

    }
}