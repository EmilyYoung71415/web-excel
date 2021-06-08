import {
    GridMdata,
    SourceData,
    Cell,
    Point,
    Rect,
    RectIndexes,
    Boxsize,
    TableStatus,
    Cursor,
<<<<<<< HEAD
    Range
=======
>>>>>>> aa34184 (style: 代码整洁)
} from '../type';

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
<<<<<<< HEAD
    getBoxSize: () => Boxsize;
    getRange: () => Range;
=======
    getBoxSize(): Boxsize;
    getRange(): Range;
>>>>>>> aa34184 (style: 代码整洁)
    getCell: (point: RectIndexes) => Cell;
    getSumHeight: () => number;
    getSumWidth: () => number;
    getStatus: () => TableStatus;
    changeCursor: (type: Cursor) => void;
    // destroy: () => void;
    // onChange: (eventName: string, callback: (state: T, next: T) => void);
}