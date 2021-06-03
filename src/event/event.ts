/**
 * @file 事件管理
 * - canvas 接受用户操作，并将dom数据加工后转发到engine上（engine.emit)
 *   业务层处理业务逻辑通过 egine.on(eventname, callback); 处理
 */
import { Engine } from '../engine';
import { addEventListener, isNil, each } from '../utils';
import { IExcelEvent } from '../interface';

export enum ExcelEvent {
    // common events
    CLICK = 'click',
    DBLCLICK = 'dblclick',
    MOUSEDOWN = 'mousedown',
    MOUDEUP = 'mouseup',
    CONTEXTMENU = 'contextmenu',
    MOUSEENTER = 'mouseenter',
    MOUSEOUT = 'mouseout',
    MOUSEOVER = 'mouseover',
    MOUSEMOVE = 'mousemove',
    MOUSELEAVE = 'mouseleave',
    KEYUP = 'keyup',
    KEYDOWN = 'keydown',
    WHEEL = 'wheel',
    FOCUS = 'focus',
    BLUR = 'blur',

    // canvas events
    CANVAS_CONTEXTMENU = 'canvas:contextmenu',
    CANVAS_CLICK = 'canvas:click',
    CANVAS_DBLCLICK = 'canvas:dblclick',
    CANVAS_MOUSEDOWN = 'canvas:mousedown',
    CANVAS_MOUSEUP = 'canvas:mouseup',
    CANVAS_MOUSEENTER = 'canvas:mouseenter',
    CANVAS_MOUSELEAVE = 'canvas:mouseleave',
    CANVAS_MOUSEMOVE = 'canvas:mousemove',
    CANVAS_MOUSEOUT = 'canvas:mouseout',
    CANVAS_MOUSEOVER = 'canvas:mouseover',

    // 业务层
    CANVAS_CELLCLICK = 'canvas:cellclick',
    CANVAS_SELECT = 'canvas:select',
}

export class EventController {
    protected destroyed = false;
    protected extendEvents: any[] = []; // 使用数组存放监听事件函数，当engine销毁的时候，一并销毁掉这些lisener
    protected engine: Engine;
    protected selecting = false;
    constructor(engine: Engine) {
        this.engine = engine;
        this.initEvents();

    }
    initEvents() {
        const { engine, extendEvents = [] } = this;

        const canvas = engine.canvasRender;
        const el = canvas.get('el');

        // 滚动
        extendEvents.push(addEventListener(el, 'DOMMouseScroll', this.onWheelEvent.bind(this)));
        extendEvents.push(addEventListener(el, 'mousewheel', this.onWheelEvent.bind(this)));

        // mousemove
        extendEvents.push(addEventListener(el, 'mousemove', this.onCanvasEvents.bind(this)));
        extendEvents.push(addEventListener(el, 'mouseup', this.onCanvasEvents.bind(this)));
        extendEvents.push(addEventListener(el, 'mousedown', this.onCanvasEvents.bind(this)));

        // click
        extendEvents.push(addEventListener(el, 'click', this.onCanvasEvents.bind(this)));


        // 键盘事件
        if (typeof window !== 'undefined') {
            extendEvents.push(addEventListener(window as any, 'keydown', this.onExtendEvents.bind(this)));
            extendEvents.push(addEventListener(window as any, 'keyup', this.onExtendEvents.bind(this)));
            extendEvents.push(addEventListener(window as any, 'focus', this.onExtendEvents.bind(this)));
        }
    }
    /**
     * 处理 canvas 事件
     * @param evt 事件句柄
     * 鼠标在canvas画布上的操作，将env转换为画布坐标
     */
    protected onCanvasEvents(evt: IExcelEvent) {
        const { engine } = this;
        const canvas = engine.canvasRender;
        const eventType = evt.type;

        const point = canvas.getPointByClient(evt.clientX, evt.clientY);
        evt.canvasX = point.x;
        evt.canvasY = point.y;
        // if (eventType === 'click') {
        //     this.onCanvasClick(evt);
        // } else 
        if (eventType === 'mousedown') {
            this.onMouseDown(evt);
        } else if (eventType === 'mousemouve') {
            this.onMouseMove(evt);
        } else if (eventType === 'mouseup') {
            this.selecting = false;
        }
        engine.emit(`canvas:${eventType}`, evt);
    }
    onMouseDown(evt: IExcelEvent) {
        if (evt.detail === 2) {
            this.onCanvasDblClick(evt);
        } else {
            // 单选：mousedown mouseup === click
            // 框选：mousedown mousemove mouseup
            if (!evt.shiftKey) {
                this.selecting = true;
                this.onCanvasClick(evt);
            }
        }
    }
    onMouseMove(evt: IExcelEvent) {
        const { engine } = this;
        if (this.selecting) {
            if (evt.buttons === 1 && !evt.shiftKey) {
                const cell = engine.getIdxByPoint({
                    x: evt.canvasX,
                    y: evt.canvasY
                });
                // engine.emit('canvas:selectEnd', cell);

            }
        }
    }
    // 找到当前canvas点击的哪个cell
    onCanvasClick(evt: IExcelEvent) {
        const { engine } = this;
        const cell = engine.getIdxByPoint({
            x: evt.canvasX,
            y: evt.canvasY
        });
        engine.emit('canvas:cellclick', cell);
    }
    // canvas 双击 进入编辑
    onCanvasDblClick(evt: IExcelEvent) {
        const { engine } = this;
        engine.emit(`canvas:dblclick`, evt);
    }
    /**
     * 处理滚轮事件
     * @param evt 事件句柄
     */
    protected onWheelEvent(evt: IExcelEvent) {
        if (isNil(evt.wheelDelta)) {
            evt.wheelDelta = -evt.detail;
        }
        this.engine.emit('wheel', evt);
    }
    /**
     * 处理扩展事件
     * @param evt 事件句柄
     */
    protected onExtendEvents(evt: IExcelEvent) {
        this.engine.emit(evt.type, evt);
    }

    public destroy() {
        const { extendEvents } = this;
        each(extendEvents, (event) => {
            event.remove();
        });
        this.extendEvents.length = 0;
        this.destroyed = true;
    }
}