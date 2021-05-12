import { RangeController } from '../rangeman/index'; // 抽象依赖于具体了。。
import { Base } from './base';
import { LooseObject } from '../../interface';
import { CanvasView } from '../view/canvas';

export abstract class BaseRange extends Base {
    protected _ctx: CanvasRenderingContext2D;
    protected _style: LooseObject;
    protected _props: RangeController;
    protected _canvas: CanvasView;
    getDefaultCfg() {
        const cfg = super.getDefaultCfg();
        return cfg;
    }
    constructor(
        rangecontroller: RangeController,
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