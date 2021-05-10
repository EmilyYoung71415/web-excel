import { EngineOption, Mdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasView } from './core/view';
import { _merge } from './utils';
import { Base } from './core/abstract/base';
export class Engine extends Base {
    // 数据
    private _sources: Mdata = null;
    private canvasView: CanvasView;
    getDefaultCfg() {
        return {
            ...defaultEngineOption,
        };
    }
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        this.canvasView = new CanvasView({
            container: engineOpt.container,
            width: this.get('viewOption.viewWidth'),
            height: this.get('viewOption.viewHeight'),
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
        this.updateEngine();
    }
    // 载入数据
    source(data: Mdata) {
        // console.log('source', data);
        const viewdata = {
            selectRectIndexes: null,
            scrollIndexes: {
                ri: 1,
                ci: 2,
            },
            // 数据有了
            grid: {
                style: this.get('viewOption.tableStyle'),
                data: {
                    col: data.col,
                    colm: data.colm,
                    row: data.row,
                    rowm: data.rowm,
                },
            },
            // 还差绘制的矩形范围
        };
        this.canvasView.draw(viewdata);
        return this; // source可连续调用
        // 根据source判断是否更新
        // 若前后数据没有发生变化，什么也不干（将json字符串化后比较）
        // ？对新的数据进行依赖追踪（代理拦截
    }
    private updateEngine() {
        // console.log(this._cfg);
        // 建立元素间逻辑关系 ===> 根据sources 构建当前表格的range关系
        // this.dataModel.constructElements(sources);
        // this.emit('canvas:beforepaint'); // 这个时候可以访问到 data=>view的那个等同于view的viewdata了
        // this.dataModel.render();// 即调用range方法各自进行渲染
        // this.emit('canvas:afterpaint');
    }
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    // TODO
    // RegisterView 会把新注册的 实例 挂在Engine类上
}