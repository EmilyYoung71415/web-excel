import { EngineOption, Mdata, GridMdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasRender } from './view/render';
import { _merge } from './utils';
import { Base } from './abstract/base';
import { DataModel } from './model/mdata';
export class Engine extends Base {
    // 数据
    private _sources: Mdata = null;
    private canvasRender: CanvasRender;
    dataModel: DataModel;
    getDefaultCfg() {
        return {
            ...defaultEngineOption,
        };
    }
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        this.dataModel = new DataModel({
            viewHeight: this.get('viewOption.viewHeight'),
            viewWidth: this.get('viewOption.viewWidth'),
        });
        // this.canvasRender = new CanvasRender({
        //     container: engineOpt.container,
        //     width: this.get('viewOption.viewWidth'),
        //     height: this.get('viewOption.viewHeight'),
        // });
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
        // this.updateEngine();
    }
    griddata(grid: GridMdata) {
        this.dataModel.resetGrid(grid);
        return this;
    }
    // 载入数据
    source() { // viewdata
        // 暂时先以command: setRange(xx).bgcolor 来维护表格数据
        // 之后会考虑开放更友好的api来载入数据
        // 类似cellmm:{1:1{xxx}}
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