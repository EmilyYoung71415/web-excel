import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Selector from './selector';
import Table from './table';
import { h } from './element';
import { bind,mouseMoveUp } from '../events/event';
/***
 * 独立于类的私有方法
 * 只能由类内部调用 且 类调用时传入类的当前上下文this
 */
function sheetReset() {
    const {
      tableEl,overlayerEl, overlayerCEl,
    } = this;
    const tableOffset = this.getTableOffset();
    const viewRect = this.getRect();
    tableEl.attr(viewRect)
    // tableEl.attr({
    //   width: el.box().width,
    //   height: view.height(),
    // });
    overlayerEl.offset(viewRect);// 包裹层
    overlayerCEl.offset(tableOffset);// table内容层
    verticalScrollbarSet.call(this);
    horizontalScrollbarSet.call(this);
}

function overlayerMousemove(ev){
    if(ev.buttons!==0) return;
    const {
        table, rowResizer, colResizer, tableEl
    } = this;
    const tRect = tableEl.box();
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height) false:非selector点击
    const cRect = table.getCellRectWithIndexes(ev.offsetX, ev.offsetY,false);
    // 行的辅助线显示:鼠标在第一列move ri>=0 ci==0
    if(cRect.ri>=0&&cRect.ci==0){
        rowResizer.show(cRect,{
            width:tRect.width
        })
    }else{
        rowResizer.hide()
    }

    if(cRect.ci>=0&&cRect.ri==0){
        colResizer.show(cRect,{
            height:tRect.height
        })
    }else{
        colResizer.hide()
    }
}

function rowResizerFinished(cRect, distance) {
    const { ri,height } = cRect;
    const { table,selector } = this;
    table.setRowHeight(ri - 1, distance);
    selector.addTopOrHeight(ri, distance - height);
    verticalScrollbarSet.call(this);
}
  
function colResizerFinished(cRect, distance) {
    const { ci,width } = cRect;
    const { table,selector } = this;
    table.setColWidth(ci - 1, distance);
    //当列收缩的时候 selector也会改变位置\大小
    selector.addLeftOrWidth(ci, distance - width);
    horizontalScrollbarSet.call(this);
}
function verticalScrollbarSet() {
    const {
      table, verticalScrollbar, view, row,
    } = this;
    verticalScrollbar.set(view.height() - row.height, table.rowTotalHeight());
}
function horizontalScrollbarSet() {
    const {
      table, horizontalScrollbar, el, col,
    } = this;
    horizontalScrollbar.set(el.box().width - col.indexWidth, table.colTotalWidth());
}

function verticalScrollbarMove(distance) {
    const { table,selector } = this;
    // 滚动条 竖向滚动的时候 selector也要跟着那个单元格滚动
    table.scroll({ y: distance },d=>{
        selector.addTop(-d);
    });
}
  
function horizontalScrollbarMove(distance) {
    const { table,selector } = this;
    table.scroll({ x: distance },d=>{
        selector.addLeft(-d);
    });
}
function overlayerMousedown(evt){
    if (!evt.shiftKey) {
        // 可能是对单个单元格的单击 
        // 可能是单机start单元格 然后mousemove 到另一个单元格mouseup从而形成框选
        selectorSetStart.call(this, evt);
        // mouse move up
        mouseMoveUp(window, (e) => {
            if (e.buttons === 1 && !e.shiftKey) {
                selectorSetEnd.call(this, e);
            }
        }, () => {
            // ...
        });
    }
    // 当shift+单击:前一次动作是点击单元格,(一个个的单击 连成框)
    if (evt.buttons === 1) {
        if (evt.shiftKey) {
          selectorSetEnd.call(this, evt);
        }
    }
}

function selectorSetStart(evt){
    const { table, selector } = this;
    const {// 根据鼠标坐标获取单元格位置
        ri, ci, left, top, width, height,
    } = table.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    // const tOffset = this.getTableOffset();
    // if (ri > 0 && ci > 0) {
    //     // 设置绝对位置将selector附着在逻辑索引的第ri,ci单元格上 
    //     selector.set([ri, ci], {
    //         left: left - tOffset.left, top: top - tOffset.top, width, height,
    //     });
    // }
    if(ri==0&&ci==0) return;
    selector.set([ri,ci],{left,top,width,height});
    // 传入[sIndexes,eIndexes]
    table.setSelectRectIndexes([[ri, ci], [ri, ci]]).render();
}

function selectorSetEnd(evt){
    const { table, selector } = this;
    const {ri, ci} = table.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    // if(ri>0&&ci>0){
    //     selector.setEnd([ri,ci],(startIndexes,endIndexes)=>{
    //         const [srmin, scmin] = startIndexes;
    //         const [ermax, ecmax] = endIndexes;
    //         const left = table.colSumWidth(0, scmin - 1);
    //         const top = table.rowSumHeight(0, srmin - 1);
    //         const height = table.rowSumHeight(srmin - 1, ermax);
    //         const width = table.colSumWidth(scmin - 1, ecmax);
    //         return {
    //             left, top, height, width,
    //         };
    //     })
    // }
    if(ri==0&&ci==0) return;
    selector.setEnd([ri,ci],(startIndexes,endIndexes)=>{
        table.setSelectRectIndexes([startIndexes, endIndexes]).render();
        return table.getSelectRect();
    })
}

export default class Sheet {
    constructor(targetEl, options = {}){
        this.el = h('div', 'web-excel');//创建div标签
        const {
            row, col, style, view,
        } = options;
        this.col = col;
        this.row = row;
        this.view = view;
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
                overlayerMousemove.call(this, evt);
            })
            .on('mousedown',(evt)=>{
                overlayerMousedown.call(this, evt);
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
            rowResizerFinished.call(this,cRect,distance);
        }
        this.colResizer.finishedFn = (cRect,distance)=>{
            colResizerFinished.call(this,cRect,distance);
        }
        // 滚动条滚动cb
        this.verticalScrollbar.moveFn = (distance, evt) => {
            verticalScrollbarMove.call(this, distance, evt);
        };
        this.horizontalScrollbar.moveFn = (distance, evt) => {
            horizontalScrollbarMove.call(this, distance, evt);
        };
        bind(window, 'resize', () => {
            this.reload();
        });
        sheetReset.call(this);
    }
    loadData(data){
        const { table } = this;
        table.loadData(data);
        table.render();
    }
    reload(){
        sheetReset.call(this);
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