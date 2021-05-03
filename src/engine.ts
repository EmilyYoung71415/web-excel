import { EngineOption, Mdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasView } from './core/view';
import { _merge } from './utils';
export class Engine {
    // 默认配置项
    private _cfg: EngineOption = defaultEngineOption;
    // 数据
    // private _sources: Sources = null;
    private canvasView: CanvasView;

    constructor(container: HTMLElement, engineOpt?: EngineOption) {
        this.applyOptions(engineOpt);
        this.canvasView = new CanvasView({
            container: container,
            width: this._get('viewOption.viewWidth'),
            height: this._get('viewOption.viewHeight'),
        });
        // this.rangeController = new RangeController();
        // this.renderController = new RenderController(
        //     this.rangeController
        // );
        // // datamodel 要调用render，所以将render作为data的子组件
        // this.dataModel = new DataModel(
        //     this.renderController, // renderControl里：rangecontroller
        // );
        // // event要修改datamodel的值，event依赖datamodel
        // this.eventController = new EventController(
        //     this.dataModel
        // );
    }
    applyOptions(opt: EngineOption, updateView = true) {
        this._cfg = _merge(this._cfg, opt);
        this.updateEngine();
    }
    // 载入数据
    source(data: Mdata) {
        console.log(data);
        // 根据source判断是否更新
        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        // ？对新的数据进行依赖追踪（代理拦截
    }
    private updateEngine() {
        console.log(this._cfg);
        // 建立元素间逻辑关系 ===> 根据sources 构建当前表格的range关系
        // this.dataModel.constructElements(sources);
        // this.emit('canvas:beforepaint'); // 这个时候可以访问到 data=>view的那个等同于view的viewdata了
        // this.dataModel.render();// 即调用range方法各自进行渲染
        // this.emit('canvas:afterpaint');
    }
    private _get(keystr = '') {
        const keys = keystr.split('.');
        const resval = keys.reduce((accur, key) => {
            return accur[key];
        }, this._cfg);
        return resval;
    }
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    // TODO
    // RegisterView 会把新注册的 实例 挂在Engine类上
}