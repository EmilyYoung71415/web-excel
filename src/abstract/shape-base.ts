/**
 * @file registerView所需要的基类
 * - 用于canvas表格以外的dom建设，辅助用户action 及 表格显示的
 * - createRender、对dom注册的事件、以及对外开放的事件behavior:creatHook
 */
import { Base } from './base';
import { LooseObject } from '../interface';
import { Engine } from '../engine';
export class Shape extends Base {
    engine: Engine;
    getDefaultCfg() {
        const cfg = super.getDefaultCfg();
        return cfg;
    }
    constructor(Engine: Engine, cfg?: LooseObject) {
        super(cfg);
        this.engine = Engine;
    }
    createRender(): string { }
    initEvent() { }
    creatHook() { }
}