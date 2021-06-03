export * from './canvas';
export * from './engine';

export interface LooseObject {
    [key: string]: any;
}

export interface IExcelEvent {
    type: string;    // 事件类型
    canvasX: number; // (canvasX, canvasY): 相对于 <canvas> 左上角的坐标；
    canvasY: number;
    clientX: number; // (clientX, clientY): 相对于页面的坐标；
    clientY: number;
    wheelDelta: number;
    detail: number;
    key?: string;
    target: LooseObject;
    [key: string]: unknown;
}