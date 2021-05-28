// 以为dom为class，创建dom、修改dom
import { EngineOption } from '../../type';
import { Base } from '../../abstract/base';
import { modifyCSS, createDom } from '../../utils';
import { Engine } from '../../engine';

const PREFIX_DOM_NAME = 'xexcel-';
export class DomRender extends Base {
    private _domroot = null;
    // 当前视图里有的dom
    constructor(engineOpt: EngineOption) {
        super(engineOpt);
        // 先把container 设置为viewopt大小
        const el = engineOpt.container;
        const vw = this.get('viewOption.viewWidth') + 'px';
        const vh = this.get('viewOption.viewHeight') + 'px';
        modifyCSS(el, { width: vw, height: vh, overflow: 'hidden' });
        this._domroot = document.createElement('div');
        // 视配置决定渲染某些自定义view
        this.createShape('toolbar');
        // this.createShape('scrollbar');
        // this.createShape('selector');
        this.initContainer();
    }
    createShape(shapeValue: string) {
        let shapeConstruct = null;
        let shapeName: string = null;
        if (typeof shapeValue === 'string') {
            shapeConstruct = Engine.ViewDomMap[shapeValue];
            shapeName = shapeValue;
        }
        if (!shapeConstruct) return;
        // 创建图形
        const shape = new shapeConstruct();
        const domstr = shape.createRender();
        const $dom = createDom(domstr);
        if (shapeValue === 'toolbar') {
            this.get('container').append($dom);
        } else {
            this._domroot.append($dom);
        }
    }
    initContainer() {
        this._domroot.className = PREFIX_DOM_NAME + 'main-table';
        this.get('container').append(this._domroot);
    }
}