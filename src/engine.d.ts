import { EngineOption, SourceData, GridMdata, Cell, Point, Rect, RectIndexes, Boxsize, TableStatus, Range, Cursor } from './type';
import { CanvasRender, DomRender } from './view';
import { Base } from './abstract/base';
import { Shape } from './abstract/shape-base';
import { DataModel } from './model/mdata';
import { IEngine } from './interface';
export declare class Engine extends Base implements IEngine {
    canvasRender: CanvasRender;
    domRender: DomRender;
    dataModel: DataModel;
    getDefaultCfg(): {
        container: HTMLElement;
        viewOption: import("./type").ViewOption;
        interactOption: import("./type").InteractOption;
    };
    static ViewDomMap: {
        [key: string]: {
            new (...arg: any[]): Shape;
        };
    };
    constructor(engineOpt: EngineOption);
    griddata(grid: GridMdata): this;
    source(data: SourceData): this;
    setRange(properties: Cell): this;
    getIdxByPoint(point: Point): Rect;
    getRange(): Range;
    getCell(point: RectIndexes): Cell;
    getSumHeight(): number;
    getSumWidth(): number;
    getBoxSize(): Boxsize;
    getStatus(): TableStatus;
    changeCursor(type: Cursor): void;
}
export declare function RegisterView(target: {
    new (...arg: any[]): any;
}, shapeName: string): void;
