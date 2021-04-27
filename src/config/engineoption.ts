/**
 * 默认配置
 */
export type FontStyle = {
    family: string;
    size: number;
    wrapType: 'ellipsis' | 'clip' | 'auto', // 换行后的最后一行的文字排版控制：超出省略、超出裁剪、直接超出
    color: string; // fillStyle
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'center' | 'left' | 'right',
    baseline?: 'middle' | 'top' | 'bottom',
}

type TableStyle = {
    bgcolor: string;
    lineSize: number;    // 网格线粗细, 具体单元格可用border对其覆写
    lineColor: string;
    cellpadding: number; // 网格内间距
    font?: FontStyle;
    fixedHeaderStyle: {
        bgcolor: string;
        lineSize: number;
        font?: FontStyle;
    },
};

export type ViewOption = {
    showToolbar: boolean;
    showCtxMenu: boolean;
    viewHeight: number;
    viewWidth: number;
    tableStyle: TableStyle;
}

export type InteractOption = {
    // 允许编辑
    canEdit: boolean;
    // 框选功能
    selectView: {
        border: string; // 1px solid blue
        background: string;
        opacity: number;
    } | false;
}

export type EngineOption = {
    // 外观配置项
    viewOption: ViewOption;
    // 交互配置项
    interactOption: InteractOption;
}