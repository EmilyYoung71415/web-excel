/**
 * @file 事件管理
 * - canvas 接受用户操作，并将dom数据加工后转发到engine上（engine.emit)
 *   业务层处理业务逻辑通过 egine.on(eventname, callback); 处理
 */
import { Engine } from '../engine';
import { addEventListener, isNil, each, isBetween } from '../utils';
import { IExcelEvent } from '../interface';
import { Rect } from '../type';

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
    CANVAS_SCROLL = 'canvas:scroll',
    CANVAS_RESIZE = 'canvas:resize',

    // 业务层
    CANVAS_CELLCLICK = 'canvas:cellclick',
    CANVAS_SELECT = 'canvas:select',
}

export class EventController {
    protected destroyed = false;
    protected extendEvents: any[] = []; // 使用数组存放监听事件函数，当engine销毁的时候，一并销毁掉这些lisener
    protected engine: Engine;
    protected selectStartRect: Rect | null;
    protected multiSelect = false;
    protected isResizing = false;
    protected el = null;
    constructor(engine: Engine) {
        this.engine = engine;
        this.initEvents();

    }
    initEvents() {
        const { engine, extendEvents = [] } = this;
        const dom = engine.domRender;
        const el = dom.get('el');
        this.el = el;


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

        extendEvents.push(addEventListener(window as any, 'onbeforeunload', this.unload.bind(this)));
    }
    /**
     * 处理 canvas 事件
     * @param evt 事件句柄
     * 鼠标在canvas画布上的操作，将env转换为画布坐标
     */
    protected onCanvasEvents(evt: IExcelEvent) {
        const { engine } = this;
        const dom = engine.domRender;
        const eventType = evt.type;

        const point = dom.getPointByClient(evt.clientX, evt.clientY);
        evt.canvasX = point.x;
        evt.canvasY = point.y;
        if (eventType === 'mousedown') {
            this.onMouseDown(evt);
        } else if (eventType === 'mousemove') {
            this.onMouseMove(evt);
        } else if (eventType === 'mouseup') {
            if (this.multiSelect) {
                // 框选结束
                this.multiSelect = false;
                this.selectStartRect = null;
                return;
            }
        }
        engine.emit(`canvas:${eventType} `, evt);
    }
    onMouseDown(evt: IExcelEvent) {
        const classList = Array.from(evt.target.classList);
        if (classList.includes('xexcel-scrollbar')) return;
        if (evt.detail === 2) {
            this.onCanvasDblClick(evt);
        } else {
            // 单选：mousedown mouseup === click
            // 框选：mousedown mousemove mouseup
            if (!evt.shiftKey) {
                this.onCanvasClick(evt);
            }
        }
    }
    onMouseMove(evt: IExcelEvent) {
        const { engine } = this;
        this.engine.changeCursor('auto');
        if (this.checkResizerCell(evt)) {
            return;
        }
        if (this.selectStartRect && !this.isResizing) {
            if (evt.buttons === 1 && !evt.shiftKey) {
                const endCell = engine.getIdxByPoint({
                    x: evt.canvasX,
                    y: evt.canvasY
                });
                let [eri, eci] = [endCell.ri, endCell.ci];

                if (eri === -1 && eci === -1) return;
                let { ri: sri, ci: sci } = this.selectStartRect;

                if (sri >= eri) {
                    [sri, eri] = [eri, sri];
                }
                if (sci >= eci) {
                    [sci, eci] = [eci, sci];
                }
                const width = endCell.left + endCell.width - this.selectStartRect.left;
                const height = endCell.top + endCell.height - this.selectStartRect.top;
                engine.emit('canvas:select', {
                    sri,
                    sci,
                    eri,
                    eci,
                    left: this.selectStartRect.left,
                    top: this.selectStartRect.top,
                    width,
                    height,
                });
                this.multiSelect = true;
            }
        }
    }
    checkResizerCell(evt: IExcelEvent): Rect | null {
        const { fixedColWidth, fixedRowHeight } = this.engine.getStatus();
        if (evt.canvasX > fixedColWidth && evt.canvasY > fixedRowHeight) return null;
        // if (evt.buttons !== 0) return false;
        const cell = this.engine.getIdxByPoint({
            x: evt.canvasX,
            y: evt.canvasY
        });
        if (cell.ci === -1 && cell.ri === -1) return null;
        if (cell.ci === -1 || cell.ri === -1) {
            const isColResizing = cell.ri === -1;
            const { lineoffset } = cell;
            const boxsize = isColResizing ? cell.width : cell.height;
            const evtOffset = isColResizing ? evt.canvasX : evt.canvasY;
            const buffer = ~~(boxsize / 6);
            if (isBetween(evtOffset, lineoffset - buffer, lineoffset + buffer)) {
                this.engine.changeCursor(`${isColResizing ? 'col-resize' : 'row-resize'}`);
                return cell;
            }
        }
        return null;
    }
    handleResize(evt: IExcelEvent, cell: Rect) {
        const canvasrender = this.engine.canvasRender;
        canvasrender.saveDrawingSurface();
        const { rowminsize, colminsize, sumheight, sumwidth } = this.engine.getStatus();
        const isColResizing = cell.ri === -1;
        const minDistance = isColResizing ? colminsize : rowminsize;
        let startEvt = evt;
        let distance = isColResizing ? cell.width : cell.height;
        this.mouseMoveUp(moveFunc, moveUp);

        function moveFunc(e) {
            this.isResizing = true;
            canvasrender.restoreDrawingSurface();
            if (startEvt !== null && e.buttons === 1) {
                if (isColResizing) {
                    distance += e.movementX;
                }
                else {
                    distance += e.movementY;
                }
                if (distance > minDistance) {
                    drawGuidelines(distance + cell[isColResizing ? 'left' : 'top']);
                }
                startEvt = e;
            }
        }

        function moveUp() {
            startEvt = null;
            this.isResizing = false;
            canvasrender.restoreDrawingSurface();
            const cellsize = isColResizing ? cell.width : cell.height;
            if (distance < minDistance) {
                distance = minDistance;
            }
            this.engine.dataModel.command({
                type: 'resizeGrid',
                isCol: isColResizing,
                idx: isColResizing ? cell.ci : cell.ri,
                diff: distance - cellsize
            });
        }

        function drawGuidelines(offset: number) {
            const context = canvasrender.get('context');
            context.strokeStyle = '#4b89ff';
            context.setLineDash([10, 10]);
            context.lineWidth = 3;
            context.beginPath();
            if (isColResizing) {
                context.moveTo(offset, 0);
                context.lineTo(offset, sumheight);
            }
            else {
                context.moveTo(0, offset);
                context.lineTo(sumwidth, offset);
            }
            context.stroke();
        }
    }
    // 找到当前canvas点击的哪个cell
    onCanvasClick(evt: IExcelEvent) {
        const { engine } = this;
        const resizerCell = this.checkResizerCell(evt);
        if (resizerCell) {
            this.handleResize(evt, resizerCell);
            return;
        }
        this.selectStartRect = null;
        const cell = engine.getIdxByPoint({
            x: evt.canvasX,
            y: evt.canvasY
        });
        this.selectStartRect = cell;
        engine.emit('canvas:cellclick', cell);
    }
    mouseMoveUp(moveFunc, moveUpFunc) {
        const func1 = addEventListener(this.el, 'mousemove', moveFunc.bind(this));
        const func2 = addEventListener(this.el, 'mouseup', movefinished.bind(this));
        function movefinished(evt) {
            func1.remove();
            func2.remove();
            moveUpFunc.call(this, evt);
        }
    }
    // canvas 双击 进入编辑
    onCanvasDblClick(evt: IExcelEvent) {
        const { engine } = this;
        this.selectStartRect && engine.emit('canvas:dblclick', this.selectStartRect);
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

    unload() {
        this.engine.emit('destroy');
        this.engine.dataModel.export();
        this.destroy();
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