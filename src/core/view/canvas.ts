
import { Point, Cursor, CanvasChangeType, CanvasCfg, RangeIndexes, Rect, RectOffset } from '../../type';
import { defaultCanvasOption } from '../../config/engineoption';
import { _merge } from '../../utils';
import { RangeController } from '../rangeman';
/**
 * @interface 对外提供的api
 */
interface ICanvas {
    onCanvasChange(changeType: CanvasChangeType);
    // event => point // 根据事件对象获取画布坐标
    // point => Rect (indexes, offset)  //
    // Event=> 这个应该是event上层传下来的point
    getRectByEvent(ev: Event): Rect;
    /**
     * 设置鼠标在画布的样式cursor
     * @param {Cursor} cursor  cursor 样式
     */
    setCursor(cursor: Cursor);
    // 首次渲染：init + 遍历全部的range
    // init: drawGrid、 drawFixedHeader
    draw(viewdata: unknown);
    // 局部渲染，传range实例
    drawRegin();
}
export class CanvasView implements ICanvas {
    // 静态属性
    static PX_SUFFIX = 'px';
    private _cfg: CanvasCfg; // mdata的子集
    private _ClientRect: RectOffset; // canvas相对视口的位置
    private _rangeController: RangeController; // canvas的绘制任务由range控制
    changeType: CanvasChangeType;
    // 把所有的属性都放在cfg上 然后通过this._get去代理访问
    constructor(
        cfg: CanvasCfg
    ) {
        // 与canvas有关的设置
        this._cfg = _merge(defaultCanvasOption, cfg);
        this._initDom();
        this._rangeController = new RangeController({
            ctx: this._get('context')
        });
        // this._initEvents();
    }
    drawRegin() {
        throw new Error('Method not implemented.');
    }
    getPointByEvent(ev: Event): Point {
        throw new Error('Method not implemented.');
    }
    getRectByEvent(ev: Event): Rect {
        throw new Error('Method not implemented.');
    }
    onCanvasChange(changeType: CanvasChangeType) {
        /**
         * 触发画布更新的2种 changeType
         * 1. attr: 修改画布的绘图属性 ----- range聚合而来的
         * 2. changeSize: 改变画布单元格尺寸、可视区域 ----- resizer、scroll
         */
        // if (['attr', 'changeSize'].includes(changeType)) {
        //     this._set('refreshElements', [this]);
        //     this.draw();
        // }
    }
    setCursor(cursor: Cursor) {
        throw new Error('Method not implemented.');
    }
    draw(viewdata: unknown) {
        // TODO:
        // 如果用户没有载入数据 即未调用source接口
        // 应开启自动draw模式
        // 得到canvas的视口大小 和 默认设计的行高、列宽 自动布局生成grid
        // 自动时 viewdata 也是由上游调时 传下来的

        // 局部时 需计算出当前的 绘制视口
        // 全部重新绘制时候 默认是在canvas的00位置
        this._rangeController.command('drawall', viewdata);
    }
    private drawAll() {
        const context = this._get('context');
        // context.clearRect(x, y, width, height); 画布的起始、宽度高度
        // applyAttrsToContext(context, this); // 笔触设置
        // this.rangeController.render('drawll');
        // grid、header、range有的所有
    }
    // 没传，则默认遍历 全部的range
    private drawRegion(selectindexes?: [], command?: string) {
        const context = this._get('context');
        // this.rangeController.render();
        // 遍历当前selectindexes 指定的区域的range

        // 如merge: drawRegion(selectindexes, 'merge');
    }
    // 根据事件对象获取画布坐标 => 画布坐标得到 单元格包围盒 getRectByPoint
    private _getPointByEvent(ev: Event): Point {
        throw new Error('Method not implemented.');
    }
    /**
     * 将窗口坐标转变成画布坐标
     * @param  {number} clientX 窗口 x 坐标
     * @param  {number} clientY 窗口 y 坐标
     * @return {object} 画布坐标
     */
    private _getPointByWindowToCanvas(clientX: number, clientY: number): Point {
        const bbox = this._ClientRect;
        return {
            x: clientX - bbox.left,
            y: clientY - bbox.top,
        };
    }
    private _initDom() {
        const el = this._createDom();
        this._set('el', el);
        this._setDOMSize(this._get('width'), this._get('height'));
        const container = this._get('container');
        container.appendChild(el);
        // 获取canvas绘制在dom上的：相对视窗的位置、大小
        setTimeout(() => {
            const bbox = this._get('el').getBoundingClientRect();
            this._ClientRect = {
                left: bbox.left,
                top: bbox.top,
                width: bbox.width,
                height: bbox.height,
            };
        });
    }
    private _initEvents() {
        // const eventController = new EventController({
        //     canvas: this,
        // });
        // eventController.init();

        // private clearEvents() {
        // const eventController = this._get('eventController');
        // eventController.destroy();
    }
    private _createDom(): HTMLElement {
        const $canvas = document.createElement('canvas');
        $canvas.id = 'xexcel-canvas';
        const context = $canvas.getContext('2d');
        this._set('context', context);
        return $canvas;
    }
    private _setDOMSize(width: number, height: number) {
        const el = this._get('el');
        const context = this._get('context');
        const pixelRatio = this._getPixelRatio();
        // 高清屏适配
        el.width = pixelRatio * width;
        el.height = pixelRatio * height;
        el.style.cssText = `transform:scale(${1 / pixelRatio});transform-origin:0 0`;
        if (pixelRatio > 1) {
            // 像素单位缩放
            context.scale(pixelRatio, pixelRatio);
        }
    }
    // 代理访问config上的
    private _get(name) {
        return this._cfg[name];
    }
    private _set(name, val): void {
        this._cfg[name] = val;
    }
    // 获取设备像素比
    private _getPixelRatio() {
        const pixelRatio = this._get('pixelRatio') || (window ? window.devicePixelRatio : 1);
        // 不足1取1，超1取整
        const respixelRatio = pixelRatio >= 1 ? Math.ceil(pixelRatio) : 1;
        this._set('pixelRatio', respixelRatio);
        return respixelRatio;
    }
}