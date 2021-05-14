import { EngineOption, Mdata, GridMdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasRender } from './view';
import { _merge } from './utils';
import { Base } from './abstract/base';
import { DataModel } from './model/mdata';
export class Engine extends Base {
    // 数据
    private _sources: Mdata = null;
    private _canvasRender: CanvasRender;
    dataModel: DataModel;
    getDefaultCfg() {
        return {
            ...defaultEngineOption,
        };
    }
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        this._canvasRender = new CanvasRender(engineOpt.container);
        // gridmap、srollindex等变量
        // 当这些变量更改的时候 需要让render定义去render
        this.dataModel = new DataModel({
            viewHeight: this.get('viewOption.viewHeight'),
            viewWidth: this.get('viewOption.viewWidth'),
            canvasrender: this._canvasRender
        });
        // // event要修改datamodel的值，event依赖datamodel
        // this.eventController = new EventController(
        //     this.dataModel
        // );
        // this.updateEngine();
    }
    getCommand() {
        // 第一阶段：各个range的单独render独立开来
        // 需要把每个range的依赖属性列出来，才能知道 外界设置什么可触发他render
        // grid: 
        // 第二阶段：将各个range的渲染挂在controller上调度
        //         controller根据外界设置是x属性来判断如何调用(zindex)
        // setRange().bgcolor = xxx;
        // setRange().gridmap = xxx; // 如改动行高列宽
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