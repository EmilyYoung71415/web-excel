type ColorType = string | null;
export type StyleRange = {
    // range: [[], []];
    /** 描边颜色 */
    stroke?: ColorType;
    /** 描边透明度 */
    strokeOpacity?: number;
    /** 填充颜色 */
    fill?: ColorType;
    /** 填充透明度 */
    fillOpacity?: number;
    /** 整体透明度 */
    opacity?: number;
}

export type TextRange = {
    /** 设置文本内容的当前对齐方式 */
    textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
    /** 设置在绘制文本时使用的当前文本基线 */
    textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
    /** 字体样式 */
    fontStyle?: 'normal' | 'italic' | 'oblique';
    /** 文本字体大小 */
    fontSize?: number;
    /** 文本字体 */
    fontFamily?: string;
    /** 文本粗细 */
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
    /** 字体变体 */
    fontVariant?: 'normal' | 'small-caps' | string;
    /** 文本行高 */
    lineHeight?: number;
}

// 表格渲染生命周期
export enum lifeCycle {
    BeforeMount,
    Mounted,
    BeforeUpdate,
    Updated,
}