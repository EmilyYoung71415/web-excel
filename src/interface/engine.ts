import { GridMdata, SourceData, Cell, Point, Rect, RectIndexes } from '../type';
export interface IEngine {
    // getDefaultCfg: () => Partial<GraphOptions>;
    get: <T = any>(key: string) => T;
    set: <T = any>(key: string | Record<string, unknown>, value?: T) => void;
    /**
     * 载入基础网格数据配置
     * @param grid 
     */
    griddata(grid: GridMdata): this;
    /**
     * 载入单元格数据
     * @param data 
     */
    source(data: SourceData): this;
    /**
     * 设置选区数据，用于toolbar响应用户操作后给选中的单元格设置对应属性
     * @param properties 
     */
    setRange(properties: Cell): this;
    /**
     * 根据画布坐标，获取当前cell：cell逻辑索引、cell物理坐标
     * @param point 
     */
    getIdxByPoint(point: Point): Rect;
    getCell(cellidx: RectIndexes): Cell;
    /**
     * 监听函数，继承自eventemitter
     */
    // on: <T = IExcelEvent>(eventName: string, callback: (e: T) => void, once?: boolean) => this;
    /**
     * 销毁
     */
    // destroy: () => void;
    // onChange: (eventName: string, callback: (state: T, next: T) => void);
}