/**
 * @file 工具栏
 * - xExcel.toolbar(['redo', 'undo', 'bold', 'font']) 配置显现
 */
import { Shape } from '../../abstract/shape-base';
export class ToolBar extends Shape {
    constructor() {
        super();
    }
    createRender() {
        return `
            <h1>工具栏</h1>
        `
    }
}