import { Engine, RegisterView } from './engine';
import { EngineOption } from '@config/engineoption';

// RegisterView(ToolBar, 'toolbar');
// RegisterView(ContextMenu, 'ctxmenu');
// RegisterView(ScrollBarX, 'scrollbarx');
// RegisterView(ScrollBarY, 'scrollbary');
// RegisterView(Editor, 'editor');

const XWebExcel = {
    /**
     *  创建表格
     *  载入数据: return engine; engine.source()
     *  @param container
     *  @param opt
     */
    create(
        container: HTMLElement,
        opt?: EngineOption
    ) {
        const engine = new Engine(container, opt);
        return engine;
    },
};



if (window) {
    window.XWebExcel = XWebExcel;
}

export default XWebExcel;
export {
    XWebExcel,
};