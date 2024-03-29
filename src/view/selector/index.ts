/**
 * @file 选区
 * - 响应用户从event传上来的：单元格单选cellclick、单元格框选select，实现selector的位置布局
 * - 响应gridmap上的变化：scroll、resize，动态调整位置布局
 * - editor编辑框的控制能力，editor与selector共享位置区域
 */
import { modifyCSS } from '../../utils';
import { Shape } from '../../abstract/shape-base';
import { Range, Rect, RectOffset } from '../../type';
import { Editor } from '../editor';
import { Engine } from '../../engine';
import { LooseObject } from '../../interface';

export class Selector extends Shape {
    private _cellOffset;
    private _editorText: string;
    private $selector: HTMLElement;
    protected editor: Editor;
    protected isEditing = false;
    protected isSelectWhole = false; // 行选 or  列选
    constructor(Engine: Engine, cfg?: LooseObject) {
        super(Engine, cfg);
        this.editor = new Editor();
        this.editor.onEdit = this.handleEdit.bind(this);
    }
    initEvent() {
        const $selector = document.querySelector('.xexcel-selector .xexcel-selector-area') as HTMLElement;
        this.$selector = $selector;
        this.engine
            .on('canvas:cellclick', (rect: Rect) => {
                if (this.isEditing) {
                    this.isEditing = false;
                    this.editor.hide();
                    this.engine.dataModel.command({
                        type: 'setRange',
                        properties: { text: this._editorText }
                    });
                    this._editorText = '';
                }
                this.handleSelect({
                    sri: rect.ri,
                    sci: rect.ci,
                    eri: rect.ri,
                    eci: rect.ci,
                    ...rect,
                });
            })
            .on('canvas:select', (rect: Range) => {
                this.isEditing = false;
                this.editor.hide();
                // this.engine.changeCursor('crosshair');
                this.handleSelect(rect);
            })
            .on('canvas:dblclick', (rect: Rect) => {
                if (this.isSelectWhole) return;
                const cellmm = this.engine.getCell({ ri: rect.ri, ci: rect.ci }) || {};
                this._editorText = cellmm.text || '';
                this.isEditing = true;
                this.editor.show({
                    ...this._cellOffset,
                    text: this._editorText
                });
            })
            .on('canvas:scroll', scroll => {
                if (!this._cellOffset) return;
                this._cellOffset.top += scroll.y;
                this._cellOffset.left += scroll.x;
                modifyCSS(this.$selector, {
                    transform: `translate3d(-${scroll.x}px, -${scroll.y}px, 0)`
                });
                this.editor.move(scroll.x, scroll.y);
            })
            .on('canvas:resize', resize => {
                if (!this._cellOffset) return;
                const range = this.engine.getRange();
                this.changeSelectOffset(range);
            });
        this.editor.initEvent();
    }
    createRender() {
        return `
            <div class="xexcel-selector">
                <div class="xexcel-selector-area" contenteditable="true" style="display:none">
                    <div class="xexcel-selector-corner"></div>
                </div>
                ${this.editor.createRender()}
            </div>
        `;
    }
    handleSelect(rect: Range) {
        this.editor.move(0, 0);
        modifyCSS(this.$selector, {
            transform: `translate3d(0, 0, 0)`
        });
        this.isSelectWhole = false;
        // TODO: 高亮对应的索引栏
        const { sri, sci, eri, eci } = rect;
        if (sri === -1 && sci === -1) {
            modifyCSS(this.$selector, { display: 'none' });
            return;
        }
        // 行选
        if (sci === -1 && eri >= 0) {
            rect.width = this.engine.getSumWidth();
            this.isSelectWhole = true;
        }
        // 列选
        if (sri === -1 && eci >= 0) {
            rect.height = this.engine.getSumHeight();
            this.isSelectWhole = true;
        }
        this.changeSelectOffset(rect);
        this.engine.dataModel.setSelect({
            sri: rect.sri,
            sci: rect.sci,
            eri: rect.eri,
            eci: rect.eci,
        });
    }
    changeSelectOffset(rectOffset: RectOffset) {
        const borderpadding = 2;
        const curOffset = {
            width: rectOffset.width,
            height: rectOffset.height,
            left: rectOffset.left - 2 * borderpadding,
            top: rectOffset.top - borderpadding,
            display: 'block'
        };
        this._cellOffset = curOffset;
        modifyCSS(this.$selector, curOffset);
        if (this.isEditing) {
            this.editor.changeOffset(curOffset);
        }
    }
    handleEdit(cur, prev) {
        this._editorText = cur;
    }
}