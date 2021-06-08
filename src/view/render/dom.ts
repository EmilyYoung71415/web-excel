/**
 * @file 除了canvas元素以外的dom管理器
 * - 入口文件的index.ts注入dom，RegisterView(ToolBar, 'toolbar');
 * - 对注入的dom进行实例化控制，以及具体插入到哪个dom里的控制 
 */
import { EngineOption, Point, Cursor } from '../../type';
import { Base } from '../../abstract/base';
import { modifyCSS, createDom } from '../../utils';
import { Engine } from '../../engine';
import { FIXEDHEADERMARGIN, BUFFERPADDING } from '../../model/mdata';

const PREFIX_DOM_NAME = 'xexcel';
export class DomRender extends Base {
    private _domroot = null;
    private _domrootInner = null;
    private _engine: Engine;
    shapeList: any[];
    // 当前视图里有的dom
    constructor(
        Engine: Engine,
        engineOpt: EngineOption
    ) {
        super(engineOpt);
        this._engine = Engine;
        this.shapeList = [];
        // 先把container 设置为viewopt大小
        const el = engineOpt.container;
        this.set('el', el);
        const vw = this.get('viewOption.viewWidth') + 'px';
        const vh = this.get('viewOption.viewHeight') + 'px';
        modifyCSS(el, { width: vw, height: vh, overflow: 'hidden' });
        this._domrootInner = createDom(`<div class="${PREFIX_DOM_NAME}-main-table-inner"></div>`);
        // 视配置决定渲染某些自定义view
        this.createShape('toolbar');
        this.createShape('selector');
        this.createShape('scrollbar');
        this.initContainer();
        Promise.resolve().then(this.initEvent.bind(this));
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
        const shape = new shapeConstruct(this._engine);
        this.shapeList.push(shape);
        const domstr = shape.createRender();
        const $dom = createDom(domstr);
        if (shapeName === 'toolbar') {
            this.get('container').append($dom);
        } else {
            this._domrootInner.append($dom);
        }
    }
    initContainer() {
        this._domroot = createDom(`<div class="${PREFIX_DOM_NAME}-main-table"></div>`);
        this._domroot.append(this._domrootInner);
        const innerLeft = (FIXEDHEADERMARGIN.left - BUFFERPADDING) + 'px';
        const innerTop = (FIXEDHEADERMARGIN.top - BUFFERPADDING) + 'px';
        modifyCSS(this._domrootInner, {
            left: innerLeft,
            top: innerTop,
            width: `calc(100% - ${innerLeft}`,
            height: `calc(100% - ${innerTop}`
        });
        this.get('container').append(this._domroot);
        this.set('el', this._domroot);
    }
    initEvent() {
        for (const shape of this.shapeList) {
            shape.initEvent();
        }
    }
    getPointByClient(clientX: number, clientY: number): Point {
        const el = this.get('el');
        const bbox = el.getBoundingClientRect();
        return {
            x: clientX - bbox.left,
            y: clientY - bbox.top,
        };
    }
    changeCursor(type: Cursor) {
        type = type || 'auto';
        modifyCSS(this.get('el'), { cursor: type });
    }
}