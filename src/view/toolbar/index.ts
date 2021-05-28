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
            <div class="xsheet-toolbar">
                <ul class="xsheet-toolbar-content">
                    <li class="xsheet-toolbar-item" id="toolbar-formatPainter" data-event="setrange:formatpainter">
                        <div class="toolbar-tip">格式刷</div>
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-clearStyle" data-event="setrange:clearstyle">
                        <div class="toolbar-tip">清除格式</div>
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-fontsize" data-event="setrange:clearstyle">
                        <select name="toolbar-fontsize">
                            <option value="12">12px</option>
                            <option value="14">14px</option>
                            <option value="18">18px</option>
                            <option value="24">24px</option>
                        </select>
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-bold">
                        <div class="toolbar-tip">B</div>
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-cellmmfontcolor">
                        <label for="toolbar-fontcolor">字体颜色</label>
                        <input type="color" id="toolbar-fontcolor" name="cellmmfontcolor" value="#000">
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-cellmmbgcolor">
                        <label for="toolbar-bgcolor">单元格背景颜色</label>
                        <input type="color" id="toolbar-bgcolor" name="cellmmbgcolor" value="#f6b73c">
                    </li>
                </ul>
            </div>
        `
    }
}