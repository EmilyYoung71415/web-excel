import { EngineOption, SourceData, GridMdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasRender, DomRender } from './view';
import { Base } from './abstract/base';
import { DataModel } from './model/mdata';
export class Engine extends Base {
    private _canvasRender: CanvasRender;
    private _domRender: DomRender; // toolbar、scrollbar等
    dataModel: DataModel;
    getDefaultCfg() {
        return {
            ...defaultEngineOption,
        };
    }
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        this._canvasRender = new CanvasRender(engineOpt.container);
        this._domRender = new DomRender(engineOpt);
        // gridmap、srollindex等变量
        // 当这些变量更改的时候 需要让render定义去render
        this.dataModel = new DataModel({
            viewHeight: this.get('viewOption.viewHeight'),
            viewWidth: this.get('viewOption.viewWidth'),
            canvasrender: this._canvasRender
        });
        // event依赖datamodel,
        // event根据datamodel的值计算出关键的action数据后会修改到 datamodel里，进而触发viewdata修改
        // 为了约束event对data的set，event只能通过调用datamodel.command('')进行数据修改
        // this.eventController = new EventController(
        //     this.datamodel
        // );
        // 至此形成的数据链路是：event(aciton) -> datamodel -> viewdata -> render
    }
    griddata(grid: GridMdata) {
        this.dataModel.resetGrid(grid);
        return this;
    }
    // 载入数据
    source(data: SourceData) { // viewdata
        this.dataModel.source(data);
        return this;
    }
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    // TODO
    // RegisterView 会把新注册的 实例 挂在Engine类上
}