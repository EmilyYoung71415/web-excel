/**
 * @file 主函数
 * 数据链路是：event(aciton) -> datamodel -> viewdata -> render
 * 
 */
import { EngineOption, SourceData, GridMdata, Cell, Point, Rect, RectIndexes, Boxsize, TableStatus, Range, Cursor } from './type';
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
    domRender: DomRender; // toolbar、scrollbar等
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
        /**
         * initUI = canvasRender(viewmodel = datamodel(cfg))
         * 数据流：datamodel -> viewdata -> render
         */
        this.canvasRender = new CanvasRender(engineOpt.container, viewRect);
        const viewModel = new ViewModel(this.canvasRender);
        this.dataModel = new DataModel(viewModel, viewRect);
        this.dataModel.emit = this.emit.bind(this); // 赋予datamodel派发事件的能力
        this.domRender = new DomRender(this, engineOpt);

        /**
         * interactionUI = render (viewmodel = (datamodel.command(action = eventController.emit)))
         * 数据流：event(aciton) -> datamodel -> viewdata -> render
         */
        // 有两个事件处理入口：1.event 将用户交互事件派发到engine.on上 2.registerview里的initevent
        const eventcontroller = new EventController(this);
        this._setObj({ eventcontroller });
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
    getIdxByPoint(point: Point): Rect {
        return this.dataModel.getIdxByPoint(point);
    }
    getRange(): Range {
        return this.dataModel.getRange();
    }
    getCell(point: RectIndexes): Cell {
        return this.dataModel.getCell(point);
    }
    getSumHeight(): number {
        return this.dataModel.getSumHeight();
    }
    getSumWidth(): number {
        return this.dataModel.getSumWidth();
    }
    // 获取当前表格的宽高数据：画布大小、实际content大小
    getBoxSize(): Boxsize {
        const [contentH, contentW] = this.dataModel.getRealContentSize();
        return {
            viewH: this.get('viewOption.viewHeight'),
            viewW: this.get('viewOption.viewWidth'),
            contentH: contentH,
            contentW: contentW
        }
    }
    getStatus(): TableStatus {
        return this.dataModel.getStatus();
    }
    changeCursor(type: Cursor) {
        this.domRender.changeCursor(type);
    }
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    Engine.ViewDomMap[shapeName] = target;
    target.prototype.name = shapeName;
}