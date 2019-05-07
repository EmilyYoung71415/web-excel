import {mouseMoveUp } from '../events/event';
/***
 * table类的私有方法
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

function selectorMove(keycode){
    const {
        table, selector, col, row,
    } = this;
    let [ri, ci] = selector.indexes;
    const moveMap = {37:'left',38:'up',39:'right',40:'down',9:'right',12:'down'}
    const dir = moveMap[keycode]
    if (dir === 'left') {
        if (ci > 1) ci -= 1;
    } else if (dir === 'right') {
        if (ci < col.len) ci += 1;
    } else if (dir === 'up') {
        if (ri > 1) ri -= 1;
    } else if (dir === 'down') {
        if (ri < row.len) ri += 1;
    }
    table.setSelectRectIndexes([[ri, ci], [ri, ci]]).render();
    selector.set([ri, ci], table.getSelectRect());
}


export default {
    sheetReset,
    overlayerMousemove,
    rowResizerFinished,
    colResizerFinished,
    verticalScrollbarSet,
    horizontalScrollbarSet,
    verticalScrollbarMove,
    horizontalScrollbarMove,
    overlayerMousedown,
    selectorSetStart,
    selectorSetEnd,
    selectorMove
}