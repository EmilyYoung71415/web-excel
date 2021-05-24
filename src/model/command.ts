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
    | ResizeRowOperation
    | AddRowOperation;


interface Command {
    setRange: (op: SetRangeOperation) => void;
}

export const Command: Command = {
    setRange(op: SetRangeOperation): void {
        // 对datamodel.range进行修改
        const { rangeidxes, properties } = op;
        const curRangeidxes = rangeidxes;// 没传的话就是默认的当前selectidxes
        // 先降级处理，把range打散为cell操作
        const { sri, sci, eri, eci } = parseRangeKey(curRangeidxes);
        // 遍历cellmm 给每一个range内的单元格挂上属性
        for (let i = sri; i <= eri; i++) {
            if (!this.cellmm[i]) {
                this.cellmm[i] = {};
            }
            const rowmm = this.cellmm[i];
            for (let j = sci; j <= eci; j++) {
                const cellmm = rowmm[j] ? rowmm[j] : {};
                this.cellmm[i][j] = _merge(cellmm, properties);
            }
        }
        // 暂时手动调用 且 set一次就更新一次
        this._cellmmRender();
    }
}