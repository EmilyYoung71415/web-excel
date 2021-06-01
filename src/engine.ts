import { EngineOption, SourceData, GridMdata } from './type';
import { defaultEngineOption } from './config/engineoption';
import { CanvasRender, DomRender } from './view';
import { Base } from './abstract/base';
import { Shape } from './abstract/shape-base';
import { DataModel } from './model/mdata';
import { ViewModel } from './model/vdata';

export class Engine extends Base {
    private _canvasRender: CanvasRender;
    private _domRender: DomRender; // toolbar、scrollbar等
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
        this._canvasRender = new CanvasRender(engineOpt.container, viewRect);
        this._domRender = new DomRender(this, engineOpt);
        // 依赖关系：data -> viewmodel -> render
        const viewModel = new ViewModel(
            this._canvasRender,
        );
        this.dataModel = new DataModel(viewModel, viewRect);

        // event依赖datamodel,
        // event根据datamodel的值计算出关键的action数据后会修改到 datamodel里，进而触发viewdata修改
        // 为了约束event对data的set，event只能通过调用datamodel.command('')进行数据修改

        // dom -> action 
        // action -> datamodel
        // dom与action之间的通信，属于跨层级的兄弟通信，所以引入eventemitter作为信息中转站

        // 给canvas加上系统级别的event管理
        // 给domrender直接传engine实例，管理从头到尾的扩展
        this.eventController = new EventController(
            this._canvasRender,
        );

        // dom: this.emit('', xxx);
        // datamodel: this.on();

        // 而behavior的好处： 抽离了单独的一层，将监听者的监听由静态实现，变为了动态注入

        // datamodel层，现在自带的监听事件： setRange，scroll
        // 以后扩展的话：考虑复合动作
        // 暂时没想到以后的复杂的复合动作，能体现出抽离behavior带来的灵活性的好处。。。
        // 即得想个很好的理由，来说服，抽离behavior层 与 就在domrender上写事件监听有什么区别好处
        // 是behavior作为外界的沟通，还是behavior在写自己基础能力的时候也这样写？

        // structv是以交互为单独模块
        // zone，然后给事件绑定上 mousemove，是通过this.getRender()在渲染器上绑定这个操作
        // 




        // 至此形成的数据链路是：event(aciton) -> datamodel -> viewdata -> render
        setTimeout(() => {
            // 模拟用户action给的command
            this.dataModel.command({
                type: 'setRange',
                rangeidxes: JSON.stringify({ sri: 1, sci: 1, eri: 2, eci: 2 }),
                properties: {
                    text: 'helloworldtesttest',
                    fontColor: 'red'
                }
            })

            this.dataModel.command({
                type: 'setRange',
                rangeidxes: JSON.stringify({ sri: 1, sci: 1, eri: 1, eci: 1 }),
                properties: {
                    fontColor: 'green'
                }
            })
        }, 1000);
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
    Engine.ViewDomMap[shapeName] = target;
    target.prototype.name = shapeName;
}