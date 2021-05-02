/**
 * @file 跨cell的管理器
 * - 样式
 * - 选区
 * - 合并单元格
 * - 条件格式
 * - 格式刷
 */
import { RangeIndexes, RectOffset, CanvasCtxAttrs } from '../../type';
import { IEngine } from '../../interface';
export interface IBaseRange {
    clear: (indexes: RangeIndexes) => void;
    getOffsetByIdxes: (indexes: RangeIndexes) => RectOffset;
    render: (
        indexes: RangeIndexes,
        attrs: CanvasCtxAttrs
    ) => void;
}

export class BaseRange implements IBaseRange {
    protected namespace: string;
    protected engine: IEngine;
    constructor(engine: IEngine) {
        this.engine = engine;
    }
    clear(indexes: RangeIndexes) {
        const ctx = this.engine.getCtx();
        const rect = this.getOffsetByIdxes(indexes);
        ctx.clearRect(rect.left, rect.top, rect.width, rect.height);
    }
    // 根据逻辑索引得到物理位置
    // - 逻辑索引：传的是索引是：相对, 计算得到的位置也是相对的
    getOffsetByIdxes(indexes: RangeIndexes): RectOffset {
        return this.engine.getViewOffsetByViewIdxes(indexes);
    }
    // 子类各自实现
    render(indexes: RangeIndexes, attrs: CanvasAttrs) { }
}

// z-index: 即绘制顺序
// background < border < text < selector
// + merge: merge < selector
//            |_ merge的时候 会把range的起始重新计算
//            |— merge: clearrect、 paint计算后的range
class RangeController {
    constructor() {



    }
    render(isDrawAll: boolean) {

    }
    // 得到canvas上当前的选中区域 selectIndexes
    // 最上层mdata：selectIndexes那里拿
    private _getRefreshRegions(): Array<any> {
        return [];
    }
}