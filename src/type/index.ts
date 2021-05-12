type FontStyle = {
    family: string;
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string; // fillStyle
    align: 'center' | 'left' | 'right',
    baseline: 'middle' | 'top' | 'bottom',
    wrapType: 'ellipsis' | 'clip' | 'auto', // 换行后的最后一行的文字排版控制：超出省略、超出裁剪、直接超出
}

type CellStyle = {
    bgcolor: string;
    border: string; // 1px solid red (lineWidth)
    borderLeft: string;
    borderTop: string;
    borderRight: string;
    borderBottom: string;
}

// 单元格分为很多类型： 文本、下拉框、日期选择器
// 单元格的样式、字号等都是由range来管理聚合来的
type Cell = {
    type: 'text' | 'select' | 'datepicker';
    style: CellStyle;
    font?: {
        style: FontStyle;
        word: string;
    };
}

// 棋盘逻辑索引
export type RectIndexes = {
    ri: number;
    ci: number;
};
// 棋盘 & range 物理位置
export type RectOffset = {
    left: number;
    top: number;
    width: number;
    height: number;
}

export type Rect = RectIndexes & RectOffset;

// range范围
export type RangeIndexes = {
    sri: number;
    sci: number;
    eri: number;
    eci: number;
} | null;

export type Range = RangeIndexes & RectOffset;

/*--------------
    modeldata
-------------*/

type ScrollOffset = {
    scrollLeft: number;
    scrollTop: number;
}

export type ScrollIndexes = {
    ri: number;
    ci: number;
}

type RowOrCol = {
    // style: Style; 收敛到range控制
    size: number;    // 行高 | 列宽
    minsize?: number; // 最小压缩size
    len: number;   // 总数
}

export type GridMdata = {
    row: RowOrCol;
    col: RowOrCol;
    // 特殊行总数、行高
    // {1: {1: {size:xx}}} 二维对象
    rowm?: Record<number, Record<number, RowOrCol>>;
    // 特殊列总数、列宽
    colm?: Record<number, Record<number, RowOrCol>>;
}

export type Mdata = GridMdata & {
    // 表格合并的单元格集合
    merges?: RangeIndexes[]; // [{}, {}]
    // 高于cell单元格的一个概念 range：框选的单元格集合 左上角单元格-右下角单元格
    range?: { [key: string]: Cell }; // key= JSON.stringify(RangeIndexes);
    scrollOffset: ScrollOffset;
    scrollIndexes: ScrollIndexes;
    selectRectIndexes: RangeIndexes;
};


/*--------------
    EngineOption
-------------*/
export type GridStyle = {
    bgcolor: string;
    lineWidth: number;    // 网格线粗细, 具体单元格可用border对其覆写
    lineColor: string;
    cellpadding: number; // 网格内间距
    font?: FontStyle;
    fixedHeaderStyle?: {
        bgcolor: string;
        lineWidth: number;
        font?: FontStyle;
    },
}

export type ViewOption = {
    showToolbar: boolean;
    showCtxMenu: boolean;
    viewHeight: number;
    viewWidth: number;
    tableStyle: GridStyle;
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
    container: HTMLElement | null;
    // 外观配置项
    viewOption: ViewOption;
    // 交互配置项
    interactOption: InteractOption;
}

/*--------------
    canvas
-------------*/
// 笔触的设置
export type CanvasCtxAttrs = {
    globalAlpha?: number;
    fillstyle?: string;
    strokeStyle?: string;
    linewidth?: number;
    font?: string;
    textalign?: string;
    textbaseline?: string;
    // 复合
    bgcolor?: string;
    linecolor?: string;
}

// Cursor style
// See: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
export type Cursor =
    | 'auto'
    | 'default'
    | 'none'
    | 'context-menu'
    | 'help'
    | 'pointer';

// drawall: init, scroll
// range的command： merge、copy paste、 格式刷
// 每次canvas重刷时候的重绘缘由
export type CanvasChangeType =
    | 'select'
    | 'text'
    | 'scroll'
    | 'clear';

export type CanvasCfg = {
    container?: HTMLElement;// 容器 controller传下来的父容器dom
    width: number;         // 画布宽度
    height: number;        // 画布高度
    cursor?: Cursor;       // 画布的cursor样式
    // pixelRatio: number;    // dpr 用于高清屏适配
};

export type Point = {
    x: number;
    y: number;
}

/*--------------
    viewdata
-------------*/
export type GridIdxToOffsetMap = {
    rowsumheight: number,
    colsumwidth: number,
    row: Array<{ ri, top, height }> | [],
    col: Array<{ ci, left, width }> | [],
}