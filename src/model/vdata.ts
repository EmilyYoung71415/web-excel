/**
 * @file viewmodel: 视图层数据 串联render 和 controller
 * - _state：controller修改后的最新的viewdata的数据
 * - 代理访问拦截：scrollidxes变量更改后对viewdata的代理访问
 * - UI = render(viewmodel.state); vdata更改自动触发视图render
 */
import { ViewDataSource } from '../type';
import { CanvasRender } from '../view';
import { isObj, isNil } from '../utils';

const hasOwn = (val: any, key: any) => Object.prototype.hasOwnProperty.call(val, key);
const originToProxy = new WeakMap(); // origin->proxy: 找到任何代理过的数据是否存在
const proxyToOrigin = new WeakMap(); // 通过代理数据找到原始的数据

export class ViewModel {
    public state: ViewDataSource;
    private _canvasRender: CanvasRender;

    constructor(canvasrender: CanvasRender) {
        this._canvasRender = canvasrender;
    }
    init(viewdataObj: ViewDataSource): ViewDataSource {
        this.state = this.proxy(viewdataObj);
        this._canvasRender.$store = this.state; // 将viewdata挂在渲染器上，下面的数据不靠传参获得数据了
        // 首次需要手动调用render
        this.updateCanvasView();
        return this.state;
    }
    // 首屏渲染前，对当前数据进行代理，然后渲染，得到依赖收集，
    // 同时数据代理方便 scroll数据的 viewdata控制
    proxy<T extends Array<T>>(target: ViewDataSource): ViewDataSource {
        let observed = originToProxy.get(target)
        // 原数据已经有相应的可响应数据, 返回可响应数据
        if (observed !== void 0) {
            return observed;
        }
        // 原数据已经是可响应数据
        if (proxyToOrigin.has(target)) {
            return target;
        }
        // 新增数据 添加进proxy代理里
        observed = new Proxy(target, {
            get: (target: ViewDataSource, key: PropertyKey) => {
                // 要报symbol的错
                let res = Reflect.get(target, key);
                if (isNil(res)) {
                    res = Object.create(null);
                    res[key] = Object.create(null);
                }
                if (isObj(res)) return this.proxy(res);
                return res;
            },
            set: (target: ViewDataSource, key: PropertyKey, val: any) => {
                const hadKey = hasOwn(target, key);
                const oldValue = target[key]
                // 每一次的 proxy 数据，都会保存在 Map 中，访问时会直接从中查找，从而提高性能
                val = proxyToOrigin.get(val) || val

                const result = Reflect.set(target, key, val);
                // 通过 判断 key 是否为 target 自身属性，以及设置val是否跟target[key]相等 
                // 可以确定 trigger 的类型，并且避免多余的 trigger
                if (!hadKey) {
                    this.updateCanvasView();
                } else if (val !== oldValue) {
                    this.updateCanvasView();
                }
                // 返回代理后的对象
                return result;
            }
        })
        // origin -> proxy
        originToProxy.set(target, observed);
        // proxy -> origin
        proxyToOrigin.set(observed, target);
        return observed;
    }
    updateCanvasView() {
        this._canvasRender.render();
    }
}