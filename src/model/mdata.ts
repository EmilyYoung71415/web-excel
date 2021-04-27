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

type RowOrCol = {
    // style: Style; 收敛到range控制
    size: number;    // 行高 | 列宽
    minsize?: number; // 最小压缩size
    len: number;   // 总数
}

type ScrollIndexes = {
    x: number;
    y: number;
}

type ScrollOffset = {
    x: number;
    y: number;
}

type RangeIndexes = {
    sri: number;
    sci: number;
    eri: number;
    eci: number;
};

type RangeOffset = {
    left: number;
    top: number;
    width: number;
    height: number;
}

type Range = RangeIndexes & RangeOffset;

export type Mdata = {
    row: RowOrCol;
    col: RowOrCol;
    // 特殊行总数、行高
    rowm?: { [key: number]: RowOrCol };
    // 特殊列总数、列宽
    colm?: { [key: number]: RowOrCol };
    // 表格合并的单元格集合
    merges?: RangeIndexes[]; // [{}, {}]
    // 高于cell单元格的一个概念 range：框选的单元格集合 左上角单元格-右下角单元格
    range?: { [key: string]: Cell }; // key= JSON.stringify(RangeIndexes);
    scrollOffset: ScrollOffset;
    scrollIndexes: ScrollIndexes;
    selectRectIndexes: RangeIndexes;
};