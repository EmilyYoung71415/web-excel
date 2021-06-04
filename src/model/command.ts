/**
 * @file action层通过command层操作datamodel里的数据
 *       action -> command -> command: datamodel: vdata -> UI = render(vdata)
 * - 考虑维护renderqueue 进行setdata之后的异步渲染（每次渲染尽量积累足够多的车
 * - 考虑rangemm维护在这里 cellmm = computed(rangemm)
 */
import { Cell } from '../type';
import { _merge, parseRangeKey } from '../utils';

type SetRangeOperation = {
    type: 'setRange';
    rangeidxes?: string;
    properties: Cell;
}

type ScrollOperation = {
    type: 'scrollView';
    distance: number;
    isVertical: boolean;
}

type ResizeRowOperation = {
    type: 'resizeGrid';
    idx: number;
    distance: number;
    dir: 'add' | 'cut';
}


type AddRowOperation = {
    type: 'addRow',
    count: number;
    bettweenkey: string;
}

export type Operation =
    | SetRangeOperation
    | ScrollOperation
    | ResizeRowOperation
    | AddRowOperation;


interface Command {
    setRange: (op: SetRangeOperation) => void;
    scrollView: (op: ScrollOperation) => void;
}

function setCellmm(ri: number, ci: number, properties: Cell) {
    let cellmm = {};
    try {
        cellmm = this._proxyViewdata.cellmm[ri][ci];
    } catch {
        this._proxyViewdata.cellmm[ri] = cellmm;
    }
    this._proxyViewdata.cellmm[ri][ci] = _merge(cellmm, properties);
}

export const Command: Command = {
    setRange(op: SetRangeOperation): void {
        // 对datamodel.range进行修改
        const { rangeidxes, properties } = op;
        const curRangeidxes = (rangeidxes && parseRangeKey(rangeidxes)) || this._selectIdxes;// 没传的话就是默认的当前selectidxes
        const { sri, sci, eri, eci } = curRangeidxes;
        // 先降级处理，把range打散为cell操作 之后引入rangemm统一管理
        // 遍历cellmm 给每一个range内的单元格挂上属性
        for (let i = sri; i <= eri; i++) {
            for (let j = sci; j <= eci; j++) {
                setCellmm.call(this, i, j, properties);
            }
        }
    },
    scrollView(op: ScrollOperation): void {
        const { distance, isVertical } = op;
        const { row, col } = this._grid;
        let scrollOffset = 0;
        let scrollIdx = 0;
        const maxLen = isVertical ? row.len : col.len;
        const getCurSize = isVertical ? (i) => this.getRowHeight(i) : (i) => this.getColWidth(i);
        for (let i = 0; i < maxLen; i++) {
            if (scrollOffset > distance) break;
            const curSize = getCurSize(i);
            scrollOffset += curSize;
            scrollIdx = i;
        }
        this._scrollOffset[isVertical ? 'y' : 'x'] = scrollOffset;
        this._scrollIdexes[isVertical ? 'ri' : 'ci'] = scrollIdx;
        this.computedGridMap(this._scrollIdexes);
        this._proxyViewdata.gridmap = this._computedgridmap;
        this._proxyViewdata.scrollIdexes = this._scrollIdexes;
    }
}