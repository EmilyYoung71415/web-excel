/**
 * @file 跨cell的管理器
 * - 样式 style-range
 * - 选区 selector-range
 * - 合并单元格
 * - 条件格式
 * - 格式刷
 */
import { GridRange } from './grid-range';
import { FixedHeaderRange } from './fixedheader-range';
import { TextRange } from './text-range';
import { StyleRange } from './style-range';
import { _merge, draw, parseRangeKey } from '../../utils';
import { Cell, GridIdxToOffsetMap } from '../../type';
import { CanvasRender } from '..';

type IDataStore = {
    gridmap: GridIdxToOffsetMap;
}

export class RangeRenderController {
    private _gridRange: GridRange;
    private _fixedHeaderRange: FixedHeaderRange;
    private _textRange: TextRange;
    private _styleRange: StyleRange;

    private _cacheQueue: unknown;
    canvas: CanvasRender;
    dataStore: IDataStore;
    constructor(canvas: CanvasRender) {
        this.canvas = canvas;
        this.dataStore = {
            gridmap: null,
        };
        // 子range设计成可以拿父实例是为了：1.可以直接使用笔触 2.直接使用父处理好的数据 3.向上通知父
        this._gridRange = new GridRange(this);
        this._fixedHeaderRange = new FixedHeaderRange(this);
        this._textRange = new TextRange(this);
        this._styleRange = new StyleRange(this);

        this._cacheQueue = {
            'drawall': [this._gridRange, this._fixedHeaderRange],
        };
    }
    drawAll(gridmap: GridIdxToOffsetMap) {
        this.dataStore = {
            gridmap: gridmap,
        };
        this.render('drawall');
    }
    command(rangekey: string, rangedata: Cell) {
        // setRange({sri:1,sci:1,eri:1,eci:1}).text = '输入多行文字测试一下';
        // 遍历cell属性 生成各个实例， 按照zindex顺序维护成renderqueue
        const { gridmap } = this.dataStore;
        const rectidxes = parseRangeKey(rangekey);
        const rectOffset = draw.getRangeOffsetByIdxes(gridmap, rectidxes);
        this.canvas.drawRegion(rectOffset, () => {
            this._styleRange.render(rectOffset, rangedata);
            this._textRange.render(rectOffset, rangedata);
        });
    }
    // 局部更新是 以rangeidx 聚合 range 渲染
    render(rectidx: string) {
        const rangelist = this._getRenderList(rectidx);
        try {
            for (const range of rangelist) {
                range.render();
            }
        }
        catch (error) {
            throw new Error('range.render 出错');
        }
    }
    private _getRenderList(rectidx: string): Array<any> {
        if (rectidx === 'drawall') return this._cacheQueue[rectidx];
    }
    // 得到canvas上当前的选中区域 selectIndexes
    // 最上层mdata：selectIndexes那里拿
    private _getRefreshRegions(): Array<any> {
        return [];
    }
}