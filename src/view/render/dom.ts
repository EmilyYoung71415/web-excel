// 以为dom为class，创建dom、修改dom
import { EngineOption } from '../../type';
import { Base } from '../../abstract/base';
import { modifyCSS } from '../../utils';
export class DomRender extends Base {
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        // 先把container 设置为viewopt大小
        const el = engineOpt.container;
        const vw = this.get('viewOption.viewWidth') + 'px';
        const vh = this.get('viewOption.viewHeight') + 'px';
        modifyCSS(el, { width: vw, height: vh, overflow: 'hidden' });
    }
}