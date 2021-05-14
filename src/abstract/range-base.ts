import { RangeRenderController } from '../view/rangeman'; // 抽象依赖于具体了。。FIXME: 改为依赖抽象的接口
import { Base } from './base';
import { LooseObject } from '../interface';
import { CanvasRender } from '../view'; // FIXME: 改为依赖抽象的接口

export abstract class BaseRange extends Base {
    protected _ctx: CanvasRenderingContext2D;
    protected _style: LooseObject;
    protected _props: RangeRenderController;
    protected _canvas: CanvasRender;
    getDefaultCfg() {
        const cfg = super.getDefaultCfg();
        return cfg;
    }
    constructor(
        rangecontroller: RangeRenderController,
        cfg?: LooseObject
    ) {
        super(cfg);
        this._props = rangecontroller;
        this._canvas = rangecontroller.canvas;
        this._ctx = this._canvas.get('context');
        this._style = this.get('style');
    }
    // abstract render: () => void;
}