/**
 * @file 单元格上的输入框
 * - 附着于selector框上，纯UI组件，行为由selector控制
 */
import { modifyCSS } from '../../utils';

export class Editor {
    protected text: string;
    protected $editor: HTMLElement;
    onEdit: (acur: string, prev: string) => void;
    createRender() {
        return `
             <div class="xexcel-editor">
                 <textarea class="xexcel-editor-textarea"></textarea>
             </div>
         `;
    }
    show(rect) {
        const $editor = document.querySelector('.xexcel-editor') as HTMLElement;
        this.$editor = $editor;
        this.initVal(rect.text);
        modifyCSS($editor, { visibility: 'visible' });
        modifyCSS($editor, rect);
    }
    hide() {
        const $editor = document.querySelector('.xexcel-editor') as HTMLElement;
        modifyCSS($editor, { visibility: 'hidden' });
    }
    initEvent() {
        const $textarea = document.querySelector('.xexcel-editor textarea') as HTMLElement;
        $textarea.addEventListener('input', (ev: Event) => {
            const curstr = ev.target.value as unknown as string;
            this.onEdit(curstr, this.text);
            this.text = curstr;
        })
    }
    move(scrollx: number, scrolly: number) {
        modifyCSS(this.$editor, {
            transform: `translate3d(-${scrollx}px, -${scrolly}px, 0)`
        });
    }
    initVal(val: string) {
        this.text = val;
        const $textarea = document.querySelector('.xexcel-editor textarea') as HTMLElement;
        $textarea.value = val;
        this._setTextareaRange();
    }
    // 光标聚焦在文字末尾
    private _setTextareaRange() {
        const posi = this.text?.length || 0;
        const $textarea = document.querySelector('.xexcel-editor textarea') as unknown as HTMLTextAreaElement;
        $textarea.setSelectionRange(posi, posi);
        setTimeout(() => {
            $textarea.focus();
        }, 0);
    }
}