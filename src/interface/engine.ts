import { RangeIndexes, RectOffset } from '../type';
export interface IEngine {
    getCtx: () => CanvasRenderingContext2D;
    // 算上scrollIdx
    getViewIdxByIdx: (indexes: RangeIndexes) => RangeIndexes;
    getIdxByViewIdx: (indexes: RangeIndexes) => RangeIndexes;
    // for(let i = videx; i< source.length;i++); 普通行高列宽、特殊的
    getViewOffsetByViewIdxes: (indexes: RangeIndexes) => RectOffset;
}