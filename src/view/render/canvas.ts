/**
 * @file canvas 表格主体渲染器
 * - 表格的大部分绘制由rangeman管理：基础网格、文字、样式等
 * - 绘制提供三种方式：render全局绘制、基于某单元格的局部绘制、外部接管canvas绘制（如辅助线）
 * - 外部接管canvas进行绘制，需要借助 saveDrawingSurface、restoreDrawingSurface
 */
import { CanvasChangeType, ViewTableSize, RectOffset, ViewDataSource } from '../../type';
import { defaultCanvasOption } from '../../config/engineoption';
import { RangeRenderController } from '../rangeman';
import { AbstraCanvas } from '../../abstract/canvas';

interface ICanvas {
    render: () => void;
    // 将选中区域的单元格 局部绘制
    // renderRange: () => void;
    saveDrawingSurface: () => void;
    restoreDrawingSurface: () => void;
}

export class CanvasRender extends AbstraCanvas implements ICanvas {
    // canvasCoord: Point; // canvas自身坐标系 取值为整数
    clientRect: RectOffset; // FIXME:  为啥 grid-range拿不到这里的公共的数据？
    private _rangeRenderController: RangeRenderController; // canvas的绘制任务由range控制
    private _curImageData: string | null;
    changeType: CanvasChangeType;
    $store: ViewDataSource;
    getDefaultCfg() {
        return defaultCanvasOption;
    }
    constructor(
        container: HTMLElement,
        viewopt: ViewTableSize
    ) {
        super(container);
        this._rangeRenderController = new RangeRenderController(this);
        this.set('width', viewopt.viewWidth);
        this.set('height', viewopt.viewHeight);
        this._setDOMSize();
    }
    // 初始化
    render() {
        this.set('width', this.$store.viewWidth);
        this.set('height', this.$store.viewHeight);
        this._setDOMSize();
        this._rangeRenderController.render();
    }
    saveDrawingSurface() {
        const context = this.get('context');
        const pixelRatio = this._getPixelRatio();
        this._curImageData = context.getImageData(0, 0, this.get('width') * pixelRatio, this.get('height') * pixelRatio);
    }
    restoreDrawingSurface() {
        if (!this._curImageData) return;
        const context = this.get('context');
        context.putImageData(this._curImageData, 0, 0);
    }
    protected _setDOMSize() {
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
    protected _createDom(): HTMLElement {
        const $canvas = super._createDom();
        $canvas.id = 'xexcel-canvas';
        return $canvas;
    }
}