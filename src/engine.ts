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
        this._canvasRender = new CanvasRender(engineOpt.container);
        this._domRender = new DomRender(engineOpt);
        const viewModel = new ViewModel(
            this._canvasRender,
        );
        // gridmap、srollindex等变量
        // 当这些变量更改的时候 需要让render定义去render
        this.dataModel = new DataModel(viewModel, {
            viewHeight: this.get('viewOption.viewHeight'),
            viewWidth: this.get('viewOption.viewWidth'),
        });

        // event依赖datamodel,
        // event根据datamodel的值计算出关键的action数据后会修改到 datamodel里，进而触发viewdata修改
        // 为了约束event对data的set，event只能通过调用datamodel.command('')进行数据修改
        // this.eventController = new EventController(
        //     this.datamodel
        // );
        // 至此形成的数据链路是：event(aciton) -> datamodel -> viewdata -> render
        setTimeout(() => {
            // 模拟用户action给的command

            // this.dataModel.command({
            //     type: 'setRange',
            //     rangeidxes: JSON.stringify({ sri: 2, sci: 2, eri: 2, eci: 2 }),
            //     properties: {
            //         text: 'hello大家好'
            //     }
            // })
            // for (let i = 0; i < 5; i++) {
            //     for (let j = 0; j < 5; j++) {
            //         // 单元格：ij => ranges
            //         const rangeidxes = JSON.stringify({ sri: i, sci: j, eri: i, eci: j });
            //         this.dataModel.command({
            //             type: 'setRange',
            //             rangeidxes: rangeidxes,
            //             properties: {
            //                 text: `文字_${i}_${j}`
            //             }
            //         })
            //     }
            // }
            // // 某区域内设置 fontcolor：
            // this.dataModel.command({
            //     type: 'setRange',
            //     rangeidxes: JSON.stringify({ sri: 1, sci: 1, eri: 3, eci: 3 }),
            //     properties: {
            //         fontColor: 'red'
            //     }
            // });
            // console.log(this.dataModel.cellmm)
            // 现在只要cell里维护的属性是最终的 全局的cell属性（不含base的），那么渲染就会其效果
            // 不过新的问题在于：每改了一个cellmm就手动调用了一次渲染
            // 理想情况是 range2cellmm 遍历完之后，再进行render
            // or 维护一个队列，一次性render 当前几个range计算后的render

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