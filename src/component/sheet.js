import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import { h } from './element';
import { bind } from '../events/event';
import _ from './sheet_private';
export default class Sheet {
    constructor(targetEl, options = {}){
        this.el = h('div', 'web-excel');//创建div标签
        const {
            row, col, style, view,
        } = options;
        this.col = col;
        this.row = row;
        this.view = view;
        this.focusing = false;// table当前是否为focus状态
        this.tableEl = h('canvas', 'excel-table')
            // .on('mousemove', (evt) => {//===> overlay包裹层捕捉事件
            //     tableMousemove.call(this, evt);
            // });
        this.table = new Table(this.tableEl.el, row, col, style);
        // resizer
        this.rowResizer = new Resizer(false, row.height);
        this.colResizer = new Resizer(true, col.minWidth);
        // scrollbar
        this.verticalScrollbar = new Scrollbar(true);
        this.horizontalScrollbar = new Scrollbar(false);
        // selector
        this.selector = new Selector();
        this.overlayerEl = h('div', 'excel-overlayer').children(
                this.overlayerCEl = h('div', 'excel-overlayer-content').children(
                    this.selector.el,
                ),
            )
            .on('mousemove',evt=>{
                _.overlayerMousemove.call(this, evt);
            })
            .on('mousedown',(evt)=>{
                _.overlayerMousedown.call(this, evt);
            })
        // web-excel里push节点canvas、resizer
        this.el.children(
            this.tableEl,
            this.overlayerEl.el,// z-index:10
            this.rowResizer.el,
            this.colResizer.el,// z-index:11
            this.verticalScrollbar.el,// z-index:12
            this.horizontalScrollbar.el,
        );
        // 根节点载入组件节点
        targetEl.appendChild(this.el.el);
        // resizer类在resize动作结束之后 将收集到的相关数据通过回调函数返回
        // table使用数据改变行高列宽
        this.rowResizer.finishedFn = (cRect,distance)=>{
            _.rowResizerFinished.call(this,cRect,distance);
        }
        this.colResizer.finishedFn = (cRect,distance)=>{
            _.colResizerFinished.call(this,cRect,distance);
        }
        // 滚动条滚动cb
        this.verticalScrollbar.moveFn = (distance, evt) => {
            _.verticalScrollbarMove.call(this, distance, evt);
        };
        this.horizontalScrollbar.moveFn = (distance, evt) => {
            _.horizontalScrollbarMove.call(this, distance, evt);
        };
        bind(window, 'resize', () => {
            this.reload();
        });
        bind(window,'click',(ev)=>{
            this.focusing = this.overlayerEl.el.contains(ev.target);
        })
        bind(window,'keydown',(ev)=>{
            if (ev.ctrlKey){
               // todo:复制粘贴剪切 
            }
            else{
                // 上下左右 tab enter
                const directionCode = [37,38,39,40,9,13];
                if(directionCode.includes(ev.keyCode)){
                    _.selectorMove.call(this,ev.keyCode);
                    ev.preventDefault();
                } 
            }
        })
        _.sheetReset.call(this);
    }
    loadData(data){
        const { table } = this;
        table.loadData(data);
        table.render();
    }
    reload(){
        _.sheetReset.call(this);
        this.table.render();
    }
    getRect() {
        const { width } = this.el.box();
        const height = this.view.height();
        return { width, height };
      }
    
    getTableOffset() {
        const { row, col } = this;
        const { width, height } = this.getRect();
        return {
            width: width - col.indexWidth,
            height: height - row.height,
            left: col.indexWidth,
            top: row.height,
        };
    }
}