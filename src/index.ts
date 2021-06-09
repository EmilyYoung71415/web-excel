import { Engine, RegisterView } from './engine';
import { EngineOption } from '@type/index';
import { ToolBar } from './view/toolbar';
import { ScrollBar } from './view/scrollbar';
import { Selector } from './view/selector';
import './index.less';

RegisterView(ToolBar, 'toolbar');
RegisterView(ScrollBar, 'scrollbar');
RegisterView(Selector, 'selector');

const XWebExcel = {
    /**
     *  创建表格
     *  载入数据: return engine; engine.source()
     *  @param container
     *  @param opt
     */
    create(
        container: HTMLElement,
        opt?: EngineOption,
    ): Engine {
        const engine = new Engine({
            container,
            ...opt,
        });
        return engine;
    },
};

if (window) {
    (window as any).XWebExcel = XWebExcel;
}

export default XWebExcel;
export {
    XWebExcel,
};