/**
 * @file sheet类的私有方法
 * 只能由类内部调用 且 类调用时传入类的当前上下文this
 * export: sheetInitEvent、sheetReset
 *
 * sheetInitEvent：用户交互监听
 *      overlayer 框选、双击选中出现editor
 *      resizer：伸缩行列
 *      滚动条
 *      window.resize
 *      keydown
 *
 * sheetReset: sheet表格渲染态就绪
 */

import {mouseMoveUp, bind} from '../event/index';

/**
 * 行列伸缩的辅助视觉效果
 * start：鼠标在索引栏mousemove => 对应的索引栏小方块高亮
 * mousedown：辅助线
 * @param {*} ev
 * @returns
 */
function overlayerMousemove(ev) {
    const [evOffsetX, evOffsetY] = [ev.offsetX, ev.offsetY];
    const {
        table, rowResizer, colResizer, $viewdata,
    } = this;
    // 如果鼠标不是在索引栏，则return;
    if (evOffsetX > $viewdata.fixedColWidth && evOffsetY > $viewdata.row.height) {
        return;
    }
    if (ev.buttons !== 0) {
        return;
    }
    const tRect = table.getRect();
    // 根据鼠标坐标点，获得所在的cell矩形信息
    // (ri, ci, offsetX, offsetY, width, height) false:非selector点击
    const cRect = $viewdata.getCellRectWithIndexes(evOffsetX, evOffsetY, false);
    // 行的辅助线显示:鼠标在第一列move ri>=0 ci==0
    if (cRect.ri >= 0 && cRect.ci === 0) {
        rowResizer.show(cRect, {
            width: tRect.width,
        });
    }
    else {
        rowResizer.hide();
    }

    if (cRect.ci >= 0 && cRect.ri === 0) {
        colResizer.show(cRect, {
            height: tRect.height,
        });
    }
    else {
        colResizer.hide();
    }
}

function rowResizerFinished(cRect, distance) {
    const {ri} = cRect;
    const {
        table, selector, $viewdata, verticalScrollbar,
    } = this;
    $viewdata.setRowHeight(ri - 1, distance);
    table.render();
    selector.render();
    verticalScrollbar.render();
}

function colResizerFinished(cRect, distance) {
    const {ci} = cRect;
    const {
        table, selector, $viewdata, horizontalScrollbar,
    } = this;
    $viewdata.setColWidth(ci - 1, distance);
    table.render();
    selector.render();
    horizontalScrollbar.render();
}

/**
 * 当滚动条滚动的时候 带动selector滚动、table视图滚动
 * @param {*} scrollTop 竖向滚动条滚动距离
 */
function verticalScrollbarMove(scrollTop) {
    const {$viewdata, selector, table} = this;
    // 滚动条 竖向滚动的时候 selector也要跟着那个单元格滚动
    $viewdata.scroll({y: scrollTop});
    selector.render();
    table.render();
}

function horizontalScrollbarMove(scrollLeft) {
    const {$viewdata, selector, table} = this;
    $viewdata.scroll({x: scrollLeft});
    selector.render();
    table.render();
}

/**
 * 选中单元格，根据当前鼠标的物理坐标，计算出选中的单元格逻辑索引
 * @param {*} evt 鼠标当前物理坐标
 */
function overlayerMousedown(evt) {
    if (!evt.shiftKey) {
    // 可能是对单个单元格的单击
    // 可能是单机start单元格 然后mousemove 到另一个单元格mouseup从而形成框选
        selectorSetStart.call(this, evt);
        // mouse move up
        mouseMoveUp(window, e => {
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

function selectorSetStart(evt) {
    const {table, selector, $viewdata} = this;
    const { // 根据鼠标坐标获取单元格位置
        ri, ci,
    } = $viewdata.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    if (ri === 0 && ci === 0) {
        return;
    }
    $viewdata.setSelectRectIndexes([[ri, ci], [ri, ci]]);
    table.render();
    selector.render();
}

function selectorSetEnd(evt) {
    const {table, selector, $viewdata} = this;
    let {ri: eri, ci: eci} = $viewdata.getCellRectWithIndexes(evt.offsetX, evt.offsetY);
    if (eri === 0 && eci === 0) {
        return;
    }
    // 保证选中框的[start单元格， end单元格] 顺序是：左上-右下
    let [[sri, sci]] = $viewdata.selectRectIndexes;
    if (sri >= eri) {
        [sri, eri] = [eri, sri];
    }
    if (sci >= eci) {
        [sci, eci] = [eci, sci];
    }
    $viewdata.setSelectRectIndexes([[sri, sci], [eri, eci]]);
    selector.render();
    table.render();
}

function selectorMove(keycode) {
    const {
        table, selector, $viewdata,
    } = this;
    if ($viewdata.status.editing) {
        return;
    };
    const {col, row} = $viewdata;
    let [[sri, sci], [eri, eci]] = $viewdata.selectRectIndexes;
    const moveMap = {
        37: 'left', 38: 'up', 39: 'right', 40: 'down', 9: 'right', 12: 'down',
    };
    const dir = moveMap[keycode];
    if (dir === 'left' && sci > 1) {
        sci -= 1;
        eci -= 1;
    }
    else if (dir === 'right' && eci < col.len) {
        sci += 1;
        eci += 1;
    }
    else if (dir === 'up' && sri > 1) {
        sri -= 1;
        eri -= 1;
    }
    else if (dir === 'down' && eri < row.len) {
        sri += 1;
        eri += 1;
    }
    // render是将选择框对应的索引栏高亮
    $viewdata.setSelectRectIndexes([[sri, sci], [eri, eci]]);
    table.render();
    selector.render();
}

function setCellText(text) {
    const {table, $viewdata} = this;
    const [[ri, ci]] = $viewdata.selectRectIndexes;
    $viewdata.setCellText(ri - 1, ci - 1, text);
    table.render();
}

/**
 * 初始化载入 & window.resize时触发:
 * sheet表格初始化渲染：
 *      overlayer位置
 *      滚动条位置
 */
export function sheetReset() {
    const {
        table, overlayer, verticalScrollbar, horizontalScrollbar,
    } = this;
    table.render();
    overlayer.render();
    verticalScrollbar.render();
    horizontalScrollbar.render();
}

export function sheetInitEvent() {
    this.overlayer
        // 索引栏上的resizer
        .on('mousemove', evt => {
            overlayerMousemove.call(this, evt);
        })
        .on('mousedown', evt => {
            // TODO: 回车完成编辑
            if (evt.detail !== 2) {
                // 退出编辑状态，editor将输入框的信息itext返回给sheet
                this.editor.clear(itext => {
                    this.$viewdata.status.editing = false;
                    // 将itext绘制在表格里
                    setCellText.call(this, itext);
                });
                // 退出编辑之后 再 发生 mousedown，高亮下一个selector
                // 选中单元格
                overlayerMousedown.call(this, evt);
            }
            // evt.detail == 2 双击进入编辑
            else {
                // 获取当前选中框位置信息，将input附着在selector上
                // 提取单元格信息到input上
                // 双击一定在mousedown之后，so此时一定有selector了
                this.$viewdata.status.editing = true;
                this.editor.render();
            }
        });
    // resizer类在resize动作结束之后 将收集到的相关数据通过回调函数返回
    // table使用数据改变行高列宽
    this.rowResizer.finishedFn = (cRect, distance) => {
        rowResizerFinished.call(this, cRect, distance);
    };
    this.colResizer.finishedFn = (cRect, distance) => {
        colResizerFinished.call(this, cRect, distance);
    };
    // 滚动条滚动cb
    this.verticalScrollbar.moveFn = (scrollTop, evt) => {
        verticalScrollbarMove.call(this, scrollTop, evt);
    };
    this.horizontalScrollbar.moveFn = (scrollLeft, evt) => {
        horizontalScrollbarMove.call(this, scrollLeft, evt);
    };

    bind(window, 'resize', () => {
        this.sheetReload();
    });
    bind(window, 'click', ev => {
        this.$viewdata.status.focusing = !!this.overlayer.checkFocusing(ev);
    });
    bind(window, 'keydown', ev => {
        if (ev.ctrlKey) {
            // todo:复制粘贴剪切
        }
        else {
            // 上下左右 tab enter
            const directionCode = [37, 38, 39, 40, 9, 13];
            if (directionCode.includes(ev.keyCode)) {
                selectorMove.call(this, ev.keyCode);
                ev.preventDefault();
            }
        }
    });
    // 滚动两种方式
    // 1. 将鼠标放在滚动条上，移动scrollbar滚动 or 鼠标hover在滚动条上，鼠标滚轮滚动
    //  ===> 都是触发 滚动条的滚动事件 由scrollbar类内部 监听scroll事件控制
    // 2. 鼠标滚轮滚动
    //  ===> 计算出鼠标滚动的距离，滚一点计算成一格，让scrollbar滚动，从而归一到moveFn事件
    bind(window, 'mousewheel', evt => {
        if (!this.$viewdata.status.focusing) {
            return;
        }
        const {$viewdata} = this;
        const {row} = $viewdata;
        const {top} = this.verticalScrollbar.scroll();
        if (evt.deltaY > 0) {
            // up
            const ri = $viewdata.scrollIndexes[0];
            if (ri < row.len) {
                this.verticalScrollbar.move({top: top + $viewdata.getRowHeight(ri)});
            }
        }
        else {
            // down
            const ri = $viewdata.scrollIndexes[0];
            if (ri >= 0) {
                this.verticalScrollbar.move({top: ri === 0 ? 0 : top - $viewdata.getRowHeight(ri)});
            }
        }
    });
}
