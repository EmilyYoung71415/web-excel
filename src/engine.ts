import { EngineOption, SourceData, GridMdata, Cell, Point, Rect, RectIndexes } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasRender, DomRender } from './view';
import { Base } from './abstract/base';
import { Shape } from './abstract/shape-base';
import { EventController } from './event';
import { DataModel } from './model/mdata';
import { ViewModel } from './model/vdata';
import { IEngine } from './interface';

export class Engine extends Base implements IEngine {
    canvasRender: CanvasRender;
    _domRender: DomRender; // toolbar、scrollbar等
    dataModel: DataModel;
    getDefaultCfg() {
        return {
            ...defaultEngineOption,
        };
    }
    // 使用RegisterView函数注册的图形将被存放在此处，由初始化时注入进来，DomRender进行具体渲染控制
    static ViewDomMap: {
        [key: string]: { new(...arg): Shape }
    } = {};
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        const viewRect = {
            viewHeight: this.get('viewOption.viewHeight'),
            viewWidth: this.get('viewOption.viewWidth')
        }
        this.canvasRender = new CanvasRender(engineOpt.container, viewRect);
        // 依赖关系：data -> viewmodel -> render
        const viewModel = new ViewModel(this.canvasRender);
        this.dataModel = new DataModel(viewModel, viewRect);
        this._domRender = new DomRender(this, engineOpt);
        // 至此形成的数据链路是：event(aciton) -> datamodel -> viewdata -> render

        // 这个事件管理器里面：处理canvas的事件，并且将canvas上的事派发到engine层面
        // 给canvas上挂载上事件
        const eventcontroller = new EventController(this);
        this._setObj({ eventcontroller });
        // xexcel.on('cellclick', (rect) => {ri,ci,left,top,width,height});
        // xexcel.on('select', );
        // xexcel.on('scroll', );
        // xexcel.on('resize', );
        // xexcel.on('datachange', (cur, prev));
        // toolbar的
        // xexcel.on('toolbar:bold', );
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
    setRange(properties: Cell) {
        this.dataModel.command({
            type: 'setRange',
            properties: properties
        });
        return this;
    }
    // 根据画布坐标，获取当前cell：cell逻辑索引、cell物理坐标
    getIdxByPoint(point: Point): Rect {
        return this.dataModel.getIdxByPoint(point);
    }
    getCell(point: RectIndexes) {
        return this.dataModel.getCell(point);
    }
    getSumHeight(): number {
        return this.dataModel.getSumHeight();
    }
    getSumWidth(): number {
        return this.dataModel.getSumWidth();
    }
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    Engine.ViewDomMap[shapeName] = target;
    target.prototype.name = shapeName;
}