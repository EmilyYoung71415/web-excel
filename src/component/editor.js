import { h } from './element';
function editorInputEventHandler(evt) {
    const v = evt.target.value;
    this.inputText = v;
}

function editorSetTextareaRange(position) {
    const {textEl} = this;
    textEl.el.setSelectionRange(position, position);
    setTimeout(() => {
        textEl.el.focus();
    }, 0);
}

function editorReset() {
    const {offset,textEl,el,} = this;
    if (offset) {
        const {left,top,width,height} = offset;
        el.offset({left, top}).show();
        textEl.offset({
            width: width - 9,
            height: height - 3
        });
    }
}

export default class Editor {
    constructor() {
        this.el = h('div', 'excel-editor').children(
            this.textEl = h('textarea', '')
            .on('input', evt => editorInputEventHandler.call(this, evt)),
            this.textlineEl = h('div', 'textline'),
        );

        this.offset = null;
        this.cell = null;
        this.inputText = '';
    }

    clear(change) {
        if (!/^\s*$/.test(this.inputText)) {
            change(this.inputText);
        }
        this.cell = null;
        this.inputText = '';
        this.el.hide();
        this.textEl.val('');
    }

    set(offset, cell) {
        this.offset = offset;
        let text = '';
        const {
            textEl,
            textlineEl
        } = this;
        if (cell) {
            text = cell.text || '';
            this.cell = cell;
            textEl.val(text);
        }
        editorReset.call(this);
        editorSetTextareaRange.call(this, text.length);
    }
}