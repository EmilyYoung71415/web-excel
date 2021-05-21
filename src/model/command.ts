import { DataModel } from './mdata';
import { Cell } from '../type';

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
    setRange: (datamodel: DataModel, op: SetRangeOperation) => void;
}


export const Command: Command = {
    setRange(datamodel: DataModel, op: SetRangeOperation): void {
        // 对datamodel.range进行修改
    }
}