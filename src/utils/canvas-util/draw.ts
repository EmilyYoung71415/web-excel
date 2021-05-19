// drawline
// mergeRange
// applyAttrsToContext


// 考虑把每个图形都包裹一下？
// 所有的几何图形需要支持以下计算：
// • 包围盒，用于裁剪和快速拾取
// • 点到图形的距离（点是否在线上）：用于边（stroke）的拾取
// • 极值点，用于计算包围盒
// • 点是否在图形内，用于拾取填充
// • 长度（周长）：用户 lineDash 动画计算 和 按照比例获取点
// • 按照比例获取点：给出一个比例值获取对应的点，用于沿着图形的运动动画以及文本定位等
// • 指定点的切线：绘制箭头
import { RangeIndexes, RectOffset, RangeOffset, GridIdxToOffsetMap } from '../../type/index';
export const isColorProp = (prop: string): boolean => {
    return ['fillStyle', 'strokeStyle'].includes(prop);
};

export const getOffsetByIdx = (gridmap: GridIdxToOffsetMap, ri: number, ci: number): RectOffset => {
    const fixedRowHeight = gridmap.fixedpadding.top;
    const fixedColWidth = gridmap.fixedpadding.left;
    // ri = -1
    if (ri === -1 && ci === -1) {
        return {
            left: -fixedColWidth,
            top: -fixedRowHeight,
            width: fixedColWidth,
            height: fixedRowHeight,
        }
    }
    // 行索引栏
    if (ri === -1) {
        const cellLeft = gridmap.col[ci].left;
        const cellWidth = gridmap.col[ci].width;
        return {
            left: cellLeft,
            top: -fixedRowHeight,
            width: cellWidth,
            height: fixedRowHeight,
        }
    }
    else if (ci === -1) {
        const cellTop = gridmap.row[ri].top;
        const cellHeight = gridmap.row[ri].height;
        return {
            left: -fixedColWidth,
            top: cellTop,
            width: fixedColWidth,
            height: cellHeight,
        }
    }
    const cellLeft = gridmap.col[ci].left;
    const cellWidth = gridmap.col[ci].width;
    const cellTop = gridmap.row[ri].top;
    const cellHeight = gridmap.row[ri].height;
    return {
        left: cellLeft,
        top: cellTop,
        width: cellWidth,
        height: cellHeight,
    }
}

// 传入单元格范围:[1,1]~[3,3]即1,1的左上角~3,3的右下角，即4,4的左上角
export const getRangeOffsetByIdxes = (gridmap: GridIdxToOffsetMap, rect: RangeIndexes): RangeOffset => {
    const { sri, sci, eri, eci } = rect;
    const sRect = getOffsetByIdx(gridmap, sri, sci);
    const isOneCell = eri === sri && eci === sci;
    if (isOneCell) {
        return {
            ...sRect,
            right: sRect.left + sRect.width,
            bottom: sRect.top + sRect.height,
        }
    } else {
        const eRect = getOffsetByIdx(gridmap, eri + 1, eci + 1);
        return {
            left: sRect.left,
            top: sRect.top,
            right: eRect.left,
            bottom: eRect.top,
            width: eRect.left - sRect.left,
            height: eRect.top - sRect.top,
        }
    }
}