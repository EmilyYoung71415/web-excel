/**
 * @file 选区
 */
import { modifyCSS } from '../../utils';
import { Shape } from '../../abstract/shape-base';
import { Range, Rect } from '../../type';
import { Editor } from '../editor';
import { Engine } from '../../engine';
import { LooseObject } from '../../interface';

export class Selector extends Shape {
    private _cellOffset;
    private _editorText: string;
    protected editor: Editor;
    protected isEditing = false;
    constructor(Engine: Engine, cfg?: LooseObject) {
        super(Engine, cfg);
        this.editor = new Editor();
        this.editor.onEdit = this.handleEdit.bind(this);
    }
    initEvent() {
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
                this.handleSelect(rect);
            })
            .on('canvas:dblclick', (rect: Rect) => {
                const cellmm = this.engine.getCell({ ri: rect.ri, ci: rect.ci }) || {};
                this._editorText = cellmm.text || '';
                this.isEditing = true;
                this.editor.show({
                    ...this._cellOffset,
                    text: this._editorText
                });
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
        const $selector = document.querySelector('.xexcel-selector .xexcel-selector-area') as HTMLElement;
        const { sri, sci, eri, eci } = rect;
        if (sri === -1 && sci === -1) {
            modifyCSS($selector, { display: 'none' });
            return;
        }
        // 行选
        if (sci === -1 && eri >= 0) {
            rect.width = this.engine.getSumWidth();
        }
        // 列选
        if (sri === -1 && eci >= 0) {
            rect.height = this.engine.getSumHeight();
        }
        const borderpadding = 2;
        const rectOffset = {
            width: rect.width + 'px',
            height: rect.height + 'px',
            left: (rect.left - 2 * borderpadding) + 'px',
            top: rect.top + 'px',
            display: 'block'
        };
        this._cellOffset = rectOffset;
        modifyCSS($selector, rectOffset);
        this.engine.dataModel.setSelect(rect);
    }
    handleEdit(cur, prev) {
        this._editorText = cur;
    }
}