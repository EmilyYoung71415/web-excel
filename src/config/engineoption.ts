import { EngineOption, CanvasCfg } from '@type/index';

export const defaultEngineOption: EngineOption = {
    container: null,
    // 外观配置项
    viewOption: {
        showToolbar: true,
        showCtxMenu: true,
        viewHeight: document.documentElement.clientHeight,
        viewWidth: document.documentElement.clientWidth,
        // tableStyle: {
        //     bgcolor: '#ffffff',
        //     lineWidth: .5,   // 网格线粗细, 具体单元格可用border对其覆写
        //     lineColor: '#333333',
        //     cellpadding: 10, // 网格内间距
        //     fixedHeaderStyle: {
        //         bgcolor: '#f4f5f8',
        //         lineWidth: .5,
        //     },
        // },
    },
    interactOption: {
        // 允许编辑
        canEdit: true,
        // 框选功能
        // selectView: {
        //     border: '1px solid blue',
        //     background: '#fff',
        //     opacity: .6,
        // },
    },
};

export const defaultCanvasOption: CanvasCfg = {
    width: defaultEngineOption.viewOption.viewWidth,
    height: defaultEngineOption.viewOption.viewHeight,
    cursor: 'default',
};