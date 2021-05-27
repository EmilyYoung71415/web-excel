/**
 * @file registerView所需要的基类
 * - 用于canvas表格以外的dom建设，辅助用户action 及 表格显示的
 * - createRender、对dom注册的事件、以及对外开放的事件behavior:creatHook
 */
import { Base } from './base';
import { LooseObject } from '../interface';

export class Shape extends Base {
    getDefaultCfg() {
        const cfg = super.getDefaultCfg();
        return cfg;
    }
    constructor(cfg?: LooseObject) {
        super(cfg);
    }
    createRender(): string { }
    initEvent() { }
    creatHook() { }
}