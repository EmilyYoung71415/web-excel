/**
 * @file canvas基类: 和业务数据没关的一些方法
 * - 局部渲染 drawRegion
 * - 画线
 * - 设置笔触
 */
import { Base } from './base';
import { RectOffset, Point, CanvasCtxAttrs } from '../type';
import { isString } from '../utils';
import { LooseObject } from '@interface/index';
const CANVAS_ATTRS_MAP = {
    fontColor: 'fillStyle',
    bgcolor: 'fillStyle',
    linecolor: 'strokeStyle',
    linewidth: 'lineWidth',
    opacity: 'globalAlpha'
};

// 不需要将ctx传来传去
// 外界和组件内部的ctx共享的是一个 且保持更新
interface ICanvas {
    drawRegion(rect: RectOffset, renderfn: (extra?: LooseObject) => void, extra?: LooseObject);
    drawLine(start: Point, end: Point);
    drawRect(rect: RectOffset, fillcolor: string, border?: string);
    applyAttrToCtx(attr: CanvasCtxAttrs);
    clearRect(x: number, y: number, width: number, height: number);
    getViewRange(): RectOffset;
}

export abstract class AbstraCanvas extends Base implements ICanvas {
    constructor(container: HTMLElement) {
        super({ container });
        this._initContainer();
        this._initDom();
        // this.initEvents();
    }
    // 复写基类函数
    getDefaultCfg() {
        const cfg = super.getDefaultCfg();
        return cfg;
    }
    drawRegion(
        rect: RectOffset,
        renderfn: () => void,
    ): void {
        const context = this.get('context');
        const { left, top, width, height } = rect;
        context.clearRect(left, top, width, height);
        context.save();
        context.beginPath();
        context.rect(left, top, width, height);
        context.clip();
        renderfn();
        context.restore();
    }
    drawLine(start: Point, end: Point): void {
        const context = this.get('context');
        context.beginPath();
        context.moveTo(start.x, start.y);    // 起点
        context.lineTo(end.x, end.y);// 终点
        context.stroke();
    }
    drawRect(rect: RectOffset, fillcolor: string, border?: string) {
        const context = this.get('context');
        const { left, top, width, height } = rect;
        context.beginPath();
        context.rect(left, top, width, height);
        context.fillStyle = fillcolor;
        if (isString(border)) {
            const [bordersize, borderstyle, bordercolor] = border.split(' ');
            // border: 1px solid red  | 4px dash blue
            if (borderstyle === 'dash') {
                context.setLineDash([10, 10]);
            }
            context.lineWidth = bordersize.endsWith('px') ? bordersize.slice(0, -2) : bordersize;
            context.strokeStyle = bordercolor;
        }
        context.fill();
        context.stroke();
    }
    applyAttrToCtx(attrs: CanvasCtxAttrs) {
        const context = this.get('context');
        Object.keys(attrs).forEach(k => {
            const v = attrs[k];
            const name = CANVAS_ATTRS_MAP[k] ? CANVAS_ATTRS_MAP[k] : k;
            context[name] = v;
        });
    }
    clearRect(x: number, y: number, width: number, height: number) {
        const context = this.get('context');
        context.clearRect(x, y, width, height);
    }
    getViewRange(): RectOffset {
        return {
            left: 0,
            top: 0,
            width: this.get('width'),
            height: this.get('height'),
        };
    }
    protected _initContainer() {
        let container = this.get('container');
        if (typeof container === 'string') {
            container = document.getElementById(container);
            this.set('container', container);
        }
    }
    protected _initDom() {
        const el = this._createDom();
        this.set('el', el);
        // 设置初始宽度
        // this._setDOMSize(this.get('width'), this.get('height'));
    }
    // 创建画布容器
    // abstract createDom(): HTMLElement;
    protected _createDom(): HTMLElement {
        const element = document.createElement('canvas');
        const context = element.getContext('2d');
        // 缓存 context 对象
        this.set('context', context);
        return element;
    }
    protected _setDOMSize() {
        const width = this.get('width');
        const height = this.get('height');
        const el = this.get('el');
        const context = this.get('context');
        const pixelRatio = this._getPixelRatio();
        // 高清屏适配
        el.width = pixelRatio * width;
        el.height = pixelRatio * height;
        el.style.cssText = `transform:scale(${1 / pixelRatio});transform-origin:0 0`;
        if (pixelRatio > 1) {
            // 像素单位缩放
            context.scale(pixelRatio, pixelRatio);
        }
        this.get('container').appendChild(el);
    }
    // 获取设备像素比
    protected _getPixelRatio() {
        const pixelRatio = this.get('pixelRatio') || (window ? window.devicePixelRatio : 1);
        // 不足1取1，超1取整
        const respixelRatio = pixelRatio >= 1 ? Math.ceil(pixelRatio) : 1;
        this.set('pixelRatio', respixelRatio);
        return respixelRatio;
    }
}