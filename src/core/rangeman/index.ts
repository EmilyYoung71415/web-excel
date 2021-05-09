/**
 * @file 跨cell的管理器
 * - 样式 style-range
 * - 选区 selector-range
 * - 合并单元格
 * - 条件格式
 * - 格式刷
 */
import {GridRange} from './grid-range';
import {FixedHeaderRange} from './fixedheader-range';
import {_merge} from '../../utils';
import {GridIdxToOffsetMap} from '../../type';
import {CanvasView} from '../view/canvas';

const COMMAND = {
    // 'drawall': // 整个可视区域
};

export class RangeController {
    private _gridRange: GridRange;
    private _fixedHeaderRange: FixedHeaderRange;
    private _cacheQueue: unknown;
    private _viewdata: unknown;
    canvas: CanvasView;
    dataStore: {
        gridmap: GridIdxToOffsetMap | null;
    };
    constructor(canvas: CanvasView) {
        this.canvas = canvas;
        this.dataStore = {
            gridmap: null,
        };
        this._gridRange = new GridRange(this);
        // this._fixedHeaderRange = new FixedHeaderRange(this);
        // range会维护一个队列：
        // rectidx: range实例
        this._cacheQueue = {
            'drawall': [this._gridRange],
        };
    }
    // 首次渲染是
    // 以action聚合range
    command(action: string, viewdata: unknown) {
        // viewdata暂时先这样处理
        this._viewdata = _merge(this._viewdata, viewdata);
        switch (action) {
        case 'drawall': // 特殊的选区key
            this.render('drawall');
            break;
        default:
            break;
        }
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
        // 按照实例的zindex排序好后返回
        return this._cacheQueue[rectidx];
    }
    // 得到canvas上当前的选中区域 selectIndexes
    // 最上层mdata：selectIndexes那里拿
    private _getRefreshRegions(): Array<any> {
        return [];
    }
    handleSetData(key: string, newval: unknown) {
        this.dataStore[key] = newval;
    }
}