/**
 * @file 工具栏
 * - xExcel.toolbar(['redo', 'undo', 'bold', 'font']) 配置显现
 */
import { Shape } from '../../abstract/shape-base';
export class ToolBar extends Shape {
    initEvent() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        // 加粗
        document.getElementById('toolbar-bold').addEventListener('click', function (e) {
            const isActive = this.classList.contains('active');
            self.engine.dataModel.command({
                type: 'setRange',
                properties: {
                    fontWeight: isActive ? 'normal' : 'bold'
                }
            });
            this.classList.toggle('active');
        });
        // 字号
        document.getElementById('toolbar-fontsize').addEventListener('change', function (e) {
            const size = this.value;
            self.engine.dataModel.command({
                type: 'setRange',
                properties: {
                    fontSize: +size
                }
            });
        });
        // 字体颜色
        document.getElementById('toolbar-cellmmfontcolor').addEventListener('change', function (e) {
            const color = this.value;
            self.engine.dataModel.command({
                type: 'setRange',
                properties: {
                    fontColor: color
                }
            });
        });
        // 单元格背景颜色
        document.getElementById('toolbar-cellmmbgcolor').addEventListener('change', function (e) {
            const color = this.value;
            self.engine.dataModel.command({
                type: 'setRange',
                properties: {
                    bgcolor: color
                }
            });
        });
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
                    <li class="xsheet-toolbar-item">
                        <select name="toolbar-fontsize" id="toolbar-fontsize" data-event="setrange:fontsize">
                            <option value="12">12px</option>
                            <option value="14">14px</option>
                            <option value="18">18px</option>
                            <option value="24">24px</option>
                        </select>
                    </li>
                    <li class="xsheet-toolbar-item" id="toolbar-bold" data-event="setrange:bold">
                        <div class="toolbar-tip">B</div>
                    </li>
                    <li class="xsheet-toolbar-item">
                        字体颜色
                        <input type="color" name="cellmmfontcolor" value="#000" id="toolbar-cellmmfontcolor" data-event="setrange:color">
                    </li>
                    <li class="xsheet-toolbar-item">
                        单元格背景颜色
                        <input type="color" name="cellmmbgcolor" value="#f6b73c" id="toolbar-cellmmbgcolor" data-event="setrange:bgcolor">
                    </li>
                </ul>
            </div>
        `
    }
}