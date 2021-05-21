// style-range
export type CellStyle = {
    bordersize?: number,// grid：1，fixedheader：0.5
    bordercolor?: string;
    borderstyle?: 'solid' | 'dash',
    bgcolor?: string;
}

// 单元格分为很多类型： 文本、下拉框、日期选择器
// 单元格的样式、字号等都是由range来管理聚合来的
// stylerange、textrange
export type Cell = CellStyle & CellText & {
    // type: 'text' | 'select' | 'datepicker';
    text?: string;
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

// range 物理位置
export type RangeOffset = {
    left: number;
    top: number;
    right: number;
    bottom: number;
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

// 表格数据
export type ViewDataRange = {
    // 表格合并的单元格集合
    // merges?: RangeIndexes[]; // [{}, {}]
    // key:range: '[[1,1],[2,2]]'
    // cell里的每个属性对应单独的range
    [key: string]: Cell;
}

export type SourceData = {
    cellmm?: Record<number, Record<number, Cell>>;
    // merges
}

export type Mdata =
    & ViewTableSize
    & GridMdata
    & SourceData
    & {
        // 交互中的数据
        scrollOffset: Point;
        scrollIndexes: ScrollIndexes;
    }

/*--------------
    EngineOption
-------------*/
export type ViewTableSize = {
    viewHeight: number;
    viewWidth: number;
}

export type ViewOption = ViewTableSize & {
    showToolbar: boolean;
    showCtxMenu: boolean;
    // tableStyle: GridStyle;
}

export type InteractOption = {
    // 允许编辑
    canEdit: boolean;
    // 框选功能
    // selectView: {
    //     border: string; // 1px solid blue
    //     background: string;
    //     opacity: number;
    // } | false;
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
    // 复合
    bgcolor?: string;
    linecolor?: string;
} & CellText;

export type CellText = {
    font?: string,
    // 文字渲染规则：超出则换行且 若最后一行仍超出则省略
    // textWrap: 'wrap' | 'nowrap' | 'ellipsis';
    /** 文本字体 */
    fontFamily?: string;
    /** 文本字体大小 */
    fontSize?: number;
    /** 文本粗细 */
    fontWeight?: 'normal' | 'bold' | number;
    /** 字体样式: 斜体 */
    fontStyle?: 'normal' | 'italic';
    /** 设置在绘制文本时使用的当前文本基线 */
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
    textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    /** 字体装饰: 下划线、删除线 */
    textDecoration?: 'underline' | 'line-through';
    /** 文本颜色 */
    fontColor?: string;
    /** 文本行高 */
    lineHeight?: number;
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
    fixedpadding: { left: number, top: number },
    rowsumheight: number,
    colsumwidth: number,
    row: Array<{ ri: number, top: number, height: number }> | [],
    col: Array<{ ci: number, left: number, width: number }> | [],
};

// 表格渲染生命周期
// export enum LifeCycle {
//     BeforeMount,
//     Mounted,
//     BeforeUpdate,
//     Updated,
// }