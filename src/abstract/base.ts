/**
 * @file 基本类
 * - cfg属性挂在_cfg上
 * - 通过this.get(xx) 来读取this._cfg.xx
 * - this.set同理
 */
import { isObj, _merge } from '../utils';
import { LooseObject } from '../interface';
import { EventEmitter } from '../event';

export interface IBase {
    _cfg: LooseObject;
    get(name: string): any;
    set(name: string, value: any);
}

export abstract class Base extends EventEmitter implements IBase {
    _cfg: LooseObject;
    getDefaultCfg() {
        return {};
    }
    constructor(cfg) {
        super();
        const defaultCfg = this.getDefaultCfg();
        this._cfg = _merge(defaultCfg, cfg);
    }
    get(keystr) {
        const keys = keystr.split('.');
        const resval = keys.reduce((accur, key) => {
            return accur[key];
        }, this._cfg);
        return resval;
    }
    set(key, value) {
        this._cfg[key] = value;
    }
    _setObj(obj: LooseObject) {
        if (!isObj(obj)) return;
        const defaultCfg = this.getDefaultCfg();
        for (const key in obj) {
            if (defaultCfg[key]) {
                this.set(key, obj[key]);
            }
        }
    }
}