import {mouseMoveUp } from '../events/event';
import { bind } from '../events/event';
/***
 * table类的私有方法
 * 只能由类内部调用 且 类调用时传入类的当前上下文this
 */
function sheetReset() {
    const {
      tableEl,overlayerEl, overlayerCEl,verticalScrollbar,horizontalScrollbar
    } = this;
    const tableOffset = this.getTableOffset();
    const viewRect = this.getRect();
    tableEl.attr(viewRect)
    overlayerEl.offset(viewRect);// 包裹层
    overlayerCEl.offset(tableOffset);// table内容层
    verticalScrollbar.render();
    horizontalScrollbar.render();
}

function overlayerMousemove(ev){
    if(ev.buttons!==0) return;
    const {
        table, rowResizer, colResizer, tableEl,$viewdata
    } = this;
    const tRect = tableEl.box();
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height) false:非selector点击
    const cRect = $viewdata.getCellRectWithIndexes(ev.offsetX, ev.offsetY,false);
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
    const { table,selector,$viewdata,verticalScrollbar } = this;
    $viewdata.setRowHeight(ri - 1, distance);
    table.render();
    selector.render()
    verticalScrollbar.render();
}
  
function colResizerFinished(cRect, distance) {
    const { ci,width } = cRect;
    const { table,selector,$viewdata,horizontalScrollbar} = this;
    $viewdata.setColWidth(ci - 1, distance);
    table.render();
    selector.render()
    horizontalScrollbar.render();
}

function verticalScrollbarMove(scrollTop) {
    const { $viewdata,selector,table } = this;
    // 滚动条 竖向滚动的时候 selector也要跟着那个单元格滚动
    $viewdata.scroll({ y: scrollTop })
    selector.render()
    table.render()
}
  
function horizontalScrollbarMove(scrollLeft){
    const { $viewdata,selector,table } = this;
    $viewdata.scroll({ x: scrollLeft })
    selector.render()
    table.render()
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
    const {table,selector,$viewdata } = this;
    const {// 根据鼠标坐标获取单元格位置
        ri, ci
    } = $viewdata.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    if(ri==0&&ci==0) return;
    $viewdata.setSelectRectIndexes([[ri, ci], [ri, ci]])
    table.render();
    selector.render();
}

function selectorSetEnd(evt){
    const { table, selector,$viewdata } = this;
    const {ri:eri, ci:eci} = $viewdata.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    if(eri==0&&eci==0) return;    
    const [[sri,sci]] = $viewdata.selectRectIndexes;
    if (sri >= eri) {
        [sri,eri] = [eri,sri]
    }
    if (sci >= eci) {
        [sci,eci] = [eci,sci];
    }
    $viewdata.setSelectRectIndexes([[sri,sci],[eri,eci]]);
    selector.render()
    table.render();
}

function selectorMove(keycode){
    const {
        table, selector, $viewdata,
    } = this;
    const {col,row} = $viewdata;
    let [[sri,sci],[eri,eci]] = $viewdata.selectRectIndexes;
    const moveMap = {37:'left',38:'up',39:'right',40:'down',9:'right',12:'down'}
    const dir = moveMap[keycode]
    if (dir === 'left') {
        if (sci > 1){
            sci -= 1;
            eci -= 1;
        } 
    } else if (dir === 'right') {
        if (eci < col.len){
            sci += 1;
            eci += 1;
        } 
    } else if (dir === 'up') {
        if (sri > 1){
            sri -= 1;
            eri -= 1;
        } 
    } else if (dir === 'down') {
        if (eri < row.len){
            sri += 1;
            eri += 1;
        } 
    }
    // render是将选择框对应的索引栏高亮
    $viewdata.setSelectRectIndexes([[sri,sci],[eri,eci]])
    table.render();
    selector.render()
}

function setCellText(text){
    const {table,$viewdata } = this;
    const [[ri, ci]] = $viewdata.selectRectIndexes;
    $viewdata.setCellText(ri - 1, ci - 1, text);
    table.render();
}


function sheetInitEvent(){
    this.overlayerEl
        .on('mousemove',evt=>{
            overlayerMousemove.call(this, evt);
        })
        .on('mousedown',(evt)=>{
            if(evt.detail==2){
                this.editor.render()
            }else{
                this.editor.clear((itext) => {
                    //将itext绘制在表格里
                    setCellText.call(this, itext);
                });
                overlayerMousedown.call(this, evt);
            }
        })
    // resizer类在resize动作结束之后 将收集到的相关数据通过回调函数返回
    // table使用数据改变行高列宽
    this.rowResizer.finishedFn = (cRect,distance)=>{
        rowResizerFinished.call(this,cRect,distance);
    }
    this.colResizer.finishedFn = (cRect,distance)=>{
        colResizerFinished.call(this,cRect,distance);
    }
    // 滚动条滚动cb
    this.verticalScrollbar.moveFn = (scrollTop, evt) => {
        verticalScrollbarMove.call(this, scrollTop, evt);
    };
    this.horizontalScrollbar.moveFn = (scrollLeft, evt) => {
        horizontalScrollbarMove.call(this, scrollLeft, evt);
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
                selectorMove.call(this,ev.keyCode);
                ev.preventDefault();
            } 
        }
    })
    // 滚动两种方式
    // 1. 将鼠标放在滚动条上，移动scrollbar滚动 or 鼠标hover在滚动条上，鼠标滚轮滚动
    //  ===> 都是触发 滚动条的滚动事件 由scrollbar类内部 监听scroll事件控制
    // 2. 鼠标在window上 滚动，即触发 mousewheel 
    // 所谓的滚动效果也是将鼠标的滚动距离转移到 滚动条上 手动触发滚动条滚动
    bind(window,'mousewheel',(evt)=>{
        if (!this.focusing) return;
        const { table,$viewdata } = this;
        const {row} = $viewdata;
        const { top } = this.verticalScrollbar.scroll();
        if (evt.deltaY > 0) {
            // up
            const ri = $viewdata.scrollIndexes[0] + 1;
            if (ri < row.len) {
              this.verticalScrollbar.move({ top: top + $viewdata.getRowHeight(ri) });
            }
        } 
        else {
            // down
            const ri = $viewdata.scrollIndexes[0] - 1;
            if (ri >= 0) {
              this.verticalScrollbar.move({ top: ri === 0 ? 0 : top - $viewdata.getRowHeight(ri) });
            }
        }
    })
}

export default {
    sheetReset,
    overlayerMousemove,
    rowResizerFinished,
    colResizerFinished,
    verticalScrollbarMove,
    horizontalScrollbarMove,
    overlayerMousedown,
    selectorSetStart,
    selectorSetEnd,
    selectorMove,
    sheetInitEvent
}