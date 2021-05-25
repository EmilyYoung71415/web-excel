/**
 * @file viewmodel: 视图层数据 串联render 和 controller
 * - _state：controller修改后的最新的viewdata的数据
 * - 代理访问拦截：scrollidxes变量更改后对viewdata的代理访问
 * - UI = render(viewmodel.state); vdata更改自动触发视图render
 */
import { ViewDataSource } from '../type';
import { CanvasRender } from '../view';
import { isObj } from '../utils';

export class ViewModel {
    public state: ViewDataSource;
    private _canvasRender: CanvasRender;
    private _revocableObject = null;

    private _updateRequest = 0;
    private _updateDelayCount = 0;

    constructor(canvasrender: CanvasRender) {
        this._canvasRender = canvasrender;
    }
    init(viewdataObj: ViewDataSource): ViewDataSource {
        this.state = this.proxy(viewdataObj);
        // 首次需要手动调用render
        this.updateCanvasView(false);
        return this.state;
    }
    // 首屏渲染前，对当前数据进行代理，然后渲染，得到依赖收集，
    // 同时数据代理方便 scroll数据的 viewdata控制
    proxy<T extends Array<T>>(viewdataObj: ViewDataSource): ViewDataSource {
        if (!isObj(viewdataObj)) {
            return viewdataObj;
        }

        Object.keys(viewdataObj).map(key => {
            if (isObj(viewdataObj)) {
                viewdataObj[key] = this.proxy(viewdataObj[key]);
            }
        });
        this._revocableObject = Proxy.revocable(viewdataObj, {
            get: (target: ViewDataSource, key: PropertyKey) => {
                // 收集依赖
                return Reflect.get(target, key);
            },
            set: (target: ViewDataSource, key: PropertyKey, value: any) => {
                this._updateRequest++;
                this.updateCanvasView(true);
                return Reflect.set(target, key, value);
            },
            deleteProperty: (target: ViewDataSource, propertyKey: PropertyKey) => {
                this._updateRequest++;
                this.updateCanvasView(true);
                return Reflect.deleteProperty(target, propertyKey);
            },
            defineProperty: (target: ViewDataSource, propertyKey: PropertyKey, value: any) => {
                this._updateRequest++;
                this.updateCanvasView(true);
                return Reflect.defineProperty(target, propertyKey, value);
            }
        });
        return this._revocableObject.proxy;
    }

    /**
     * 取消代理一个sources对象，当访问或修改被取消后的对象会发生报错
     * @param targetObj 
     */
    revoke<T extends Array<T> | any>(targetObj: T) {
        // this._state.revoke(targetObj);
    }
    updateCanvasView(auto = false) {
        if (!auto) {
            this._canvasRender.render(this.state);
            return;
        }
        requestAnimationFrame(() => {
            // raf 里加入一个节流，控制最多一帧内触发一次渲染
            this._updateDelayCount++;
            if (this._updateDelayCount === this._updateRequest) {
                this._canvasRender.render(this.state);
                this._updateRequest = this._updateDelayCount = 0;
            }
        });
    }
}