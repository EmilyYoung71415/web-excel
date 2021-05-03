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
import { CanvasCtxAttrs } from '../../type';

export const isColorProp = (prop: string): boolean => {
    return ['fillStyle', 'strokeStyle'].includes(prop);
};

const CANVAS_ATTRS_MAP = {
    bgcolor: 'fillStyle',
    linecolor: 'strokeStyle',
    opacity: 'globalAlpha',
};

export function applyAttrsToContext(context: CanvasRenderingContext2D, attrs: CanvasCtxAttrs): void {
    for (let k in attrs) {
        const v = attrs[k];
        const name = CANVAS_ATTRS_MAP[k] ? CANVAS_ATTRS_MAP[k] : k;
        context[name] = v;
    }
};