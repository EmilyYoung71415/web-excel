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

export default class Editor {
    constructor(viewdata) {
        this.el = h('div', 'excel-editor').children(
            this.textEl = h('textarea', '')
            .on('input', evt => editorInputEventHandler.call(this, evt)),
            this.textlineEl = h('div', 'textline'),
        );
        this.$viewdata = viewdata;
        this.inputText = '';
    }

    clear(change) {
        if (!/^\s*$/.test(this.inputText)) {
            change(this.inputText);
        }
        this.inputText = '';
        this.el.hide();
        this.textEl.val('');
    }
    render(){
        const {textEl,el,$viewdata} = this;
        const [[ri, ci]] = $viewdata.selectRectIndexes;
        const cell = $viewdata.getCell(ri-1,ci-1)
        const {left, top, width, height} = $viewdata.getSelectRect();
        
        if (cell) {
            textEl.val(cell.text || '');
        }

        el.offset({
            left:left+$viewdata.col.indexWidth,
            top:top+$viewdata.row.height
        }).show();
        textEl.offset({
            width: width - 9,
            height: height - 3
        });
        editorSetTextareaRange.call(this, text.length);
    }
}