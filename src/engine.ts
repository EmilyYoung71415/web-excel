import { EngineOption, FontStyle } from '@config/engineoption';
import { Mdata } from '@model/mdata';

export class Engine {
    // 默认配置项
    private _cfg: EngineOption = {
        // 外观配置项
        viewOption: {
            showToolbar: true,
            showCtxMenu: true,
            viewHeight: document.documentElement.clientHeight,
            viewWidth: document.documentElement.clientWidth,
            tableStyle: {
                bgcolor: '#ffffff',
                lineSize: .5,   // 网格线粗细, 具体单元格可用border对其覆写
                lineColor: '#333333',
                cellpadding: 10, // 网格内间距
                fixedHeaderStyle: {
                    bgcolor: '#f4f5f8',
                    lineSize: .5,
                },
            },
        },
        interactOption: {
            // 允许编辑
            canEdit: true,
            // 框选功能
            selectView: {
                border: '1px solid blue',
                background: '#fff',
                opacity: .6,
            },
        },
    };
    // 数据
    // private _sources: Sources = null;

    constructor(container: HTMLElement, engineOpt?: EngineOption) {
        this.applyOptions(engineOpt);
        // TODO: controller
        // ：mdata、render、rangecontroller、InteractionModel、source
    }
    applyOptions(opt: EngineOption, updateView = true) {
        this._cfg = Object.assign(this._cfg, opt); // FIXME:  对象深合并
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
}

/**
 * 注册view在表格上
 */
export function RegisterView(target: { new(...arg): any }, shapeName: string) {
    // TODO
    // RegisterView 会把新注册的 实例 挂在Engine类上
}