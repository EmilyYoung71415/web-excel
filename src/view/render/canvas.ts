
import { GridIdxToOffsetMap, CanvasChangeType, Cell, RectOffset } from '../../type';
import { defaultCanvasOption } from '../../config/engineoption';
import { RangeRenderController } from '../rangeman';
import { AbstraCanvas } from '../../abstract/canvas';
type clientPoint = {
    clientX: number; // 点相对于浏览器的定位
    clientY: number;
}

type canvasPoint = {
    canvasX: number; // canvas相对于浏览器的坐标系 取值为整数
    canvasY: number;
}

type paintPoint = {
    pointX: number;  // 真正绘制图形时，图形是根据 pointX/pointY 定位的
    pointY: number;  // 无缩放变形时canvasX=pointX
}
interface ICanvas {
    onCanvasChange(changeType: CanvasChangeType);
    draw(
        rangekey: string,
        data: Cell,
    ): void;
}

type IDrawAll = {
    viewHeight: number;
    viewWidth: number;
    gridmap: GridIdxToOffsetMap;
}

export class CanvasRender extends AbstraCanvas implements ICanvas {
    // canvasCoord: Point; // canvas自身坐标系 取值为整数
    clientRect: RectOffset; // FIXME:  为啥 grid-range拿不到这里的公共的数据？
    private _rangeRenderController: RangeRenderController; // canvas的绘制任务由range控制
    changeType: CanvasChangeType;
    getDefaultCfg() {
        return defaultCanvasOption;
    }
    constructor(
        container: HTMLElement,
    ) {
        super(container);
        this._rangeRenderController = new RangeRenderController(this);
        // this._initEvents();
    }
    // action层：setRange(range).bgcolor = 'red';
    // controller层：知道调用哪个render(canvasrender) bgcolor对应 draw调用rangecontroller
    // 找到range的单元格 绑定的rangerender，再决定drawrecord 绘制顺序 （rangecontroller维护着以range为key的map
    // 绘制好之后 维护数据
    // 初始化
    drawAll(viewdata: IDrawAll) {
        this.set('width', viewdata.viewWidth);
        this.set('height', viewdata.viewHeight);
        this._setDOMSize();
        this._rangeRenderController.drawAll(viewdata.gridmap);
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
    draw(
        rangekey: string,
        data: Cell,
    ): void {
        this._rangeRenderController.command(rangekey, data);
    }
    _setDOMSize() {
        super._setDOMSize();
        // 获取canvas绘制在dom上的：相对视窗的位置、大小
        setTimeout(() => {
            const bbox = this.get('el').getBoundingClientRect();
            const clientRect = {
                left: bbox.left,
                top: bbox.top,
                width: bbox.width,
                height: bbox.height,
            };
            this.clientRect = clientRect;
        });
    }
    // 改写基类方法
    _createDom(): HTMLElement {
        const $canvas = super._createDom();
        $canvas.id = 'xexcel-canvas';
        return $canvas;
    }
}