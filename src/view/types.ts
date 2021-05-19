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

// 表格渲染生命周期
export enum lifeCycle {
    BeforeMount,
    Mounted,
    BeforeUpdate,
    Updated,
}