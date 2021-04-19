/**
 * @file table canvas类的私有方法
 * 只能由类内部调用 且 类调用时传入类的当前上下文this
 * export:
 *  renderContentGrid： 画出画布需要的每行每列的单元格-列总宽 & 行总高
 *  renderFixedHeaders：表格的索引栏， 行列
 *  renderContent：     给每个单元格赋值上：样式、数据
 */
import alphabet from '../config/alphabet';
import {DrawBox} from '../baserender/canvas';
import {deepClone} from '../utils';

const gCellPaddingWidth = 5;
let gPixelRatio = 1;
function fitWithPixelRatio(data, flag) {
    let newdata = deepClone(data.data);
    // 与canvas有关的尺寸，都乘以pixelRatio
    gPixelRatio = data.pixelRatio;
    const targetKeys = [
        'viewRect.height',
        'viewRect.width',
        'fixedColWidth',
        'row.height',
        'col.width',
        'col.indexWidth',
        'col.minWidth',
        'style.font.size',
        'style.contentLineSize',
        'style.fixedheaderstyle.font.size',
    ];
    targetKeys.forEach(keystr => {
        const keys = keystr.split('.');
        keys.reduce((accur, key) => {
            if (typeof accur[key] === 'number') {
                accur[key] = accur[key] * gPixelRatio;
            }
            return accur[key];
        }, newdata);
    });
    return newdata;
}

/**
 * 画出画布需要的每行每列的单元格-列总宽 & 行总高
 */

export function renderContentGrid() {
    const {draw, $viewdata} = this;
    const {
        row, col, scrollOffset, fixedColWidth,
        contentLineColor, contentLineSize,
    } = fitWithPixelRatio($viewdata);
    draw.save();
    draw.attr({
        lineWidth: contentLineSize,
        strokeStyle: contentLineColor,
    });
    draw.translate(fixedColWidth, row.height);
    //  移动canvas
    // TODO: 把移动笔触 改为 定位数据改变
    draw.translate(-scrollOffset.x, -scrollOffset.y);// 画笔向上移动
    const colSumWidth = $viewdata.colTotalWidth() * gPixelRatio;// 全部列总宽
    const rowSumHeight = $viewdata.rowTotalHeight() * gPixelRatio;// 全部行总高
    // 在table里的画横、竖
    // 每一行的横线起始两点坐标为(0,y),(colSumWidth, y)
    $viewdata.rowEach(row.len, (i, y) => {
        y = y * gPixelRatio;
        draw.line([0, y], [colSumWidth, y]);
    });
    $viewdata.colEach(col.len, (i, x) => {
        x = x * gPixelRatio;
        draw.line([x, 0], [x, rowSumHeight]);
    });
    draw.restore();
}

/**
 * 表格的索引栏 有浅灰色的背景颜色
 */

export function renderFixedHeaders() {
    const {draw, $viewdata} = this;
    const {
        row, col, scrollOffset, fixedColWidth, style,
    } = fitWithPixelRatio($viewdata);
    draw.save();
    // 背景颜色
    // TODO: fixedheader 背景rect应该是当前视图内的 表格列的列总宽
    draw.attr({fillStyle: style.fixedheaderstyle.bgcolor})
    // 填充背景
        .fillRect(0, 0, fixedColWidth, $viewdata.viewRect.height * gPixelRatio)
        .fillRect(0, 0, $viewdata.viewRect.width * gPixelRatio, row.height);
    // 字体
    draw.attr(style.fixedheaderstyle);
    // 第一列 生成行索引
    $viewdata.rowEach(row.len, (i, y1, rowHeight) => {
        y1 = y1 * gPixelRatio;
        rowHeight = rowHeight * gPixelRatio;
        const y = y1 + row.height - scrollOffset.y;
        const [tx, ty] = [0 + (fixedColWidth / 2), y + (rowHeight / 2)];
        if (i !== row.len) {
            draw.fillText(i + 1, tx, ty);
        }
        // 分割线
        draw.line([0, y], [fixedColWidth, y]);
    });
    // draw.line([fixedColWidth, 0], [fixedColWidth, $viewdata.rowTotalHeight() * gPixelRatio + row.height]);
    // 第一行 生成列索引
    $viewdata.colEach(col.len, (i, x1, colWidth) => {
        x1 = x1 * gPixelRatio;
        colWidth = colWidth * gPixelRatio;
        const x = x1 + fixedColWidth - scrollOffset.x;
        const [tx, ty] = [x + (colWidth / 2), 0 + (row.height / 2)];
        if (i !== col.len) {
            draw.fillText(alphabet.stringAt(i), tx, ty);
        }
        draw.line([x, 0], [x, row.height]);
    });
    // draw.line([0, row.height], [$viewdata.colTotalWidth() * gPixelRatio + fixedColWidth, row.height]);
    renderSelectRect.call(this);// 高亮selector所在行&列的索引格
    // left-top-cell
    draw.attr({fillStyle: '#fff'})
        .fillRect(0, 0, fixedColWidth, row.height);
    draw.restore();
}

/**
 * 给每个单元格赋值数据上：样式、文本
 */

export function renderContent() {
    const {cellmm} = this.$viewdata;
    Object.keys(cellmm).forEach(rindex => {
        Object.keys(cellmm[rindex]).forEach(cindex => {
            renderCell.call(this, rindex, cindex, cellmm[rindex][cindex]);
        });
    });
}

/**
 * 绘制具体每个的单元格
 * @param rindex 逻辑行索引
 * @param cindex 逻辑列索引
 * @param cell 业务层传递进来的表格数据
 *
 * 根据传入逻辑索引返回得到单元格坐标、长宽
 * 将画笔移动到物理坐标上进行绘制
 */

function renderCell(rindex, cindex, cell) {
    const {draw, $viewdata} = this;
    const {
        styles, row, scrollOffset, fixedColWidth, style: $viewDataStyle,
    } = fitWithPixelRatio($viewdata);
    const {x: scrollOffsetX, y: scrollOffsetY} = scrollOffset;
    const style = styles[cell.si];
    // 传入逻辑索引返回得到单元格坐标、长宽,以此来生成drawbox
    const dbox = getDrawBox.call(this, rindex, cindex);
    if (style) {
        dbox.bgcolor = style.bgcolor;
    }
    draw.save()
        .translate(fixedColWidth, row.height)
        .translate(-scrollOffsetX, -scrollOffsetY);
    draw.rect(dbox);
    // render cell数据
    const cellText = cell.text;// TODO:格式化
    if (cellText) {
        const isWrapText = (style && style.wrapText) || $viewDataStyle.wrapText;
        const font = (style && style.font) || $viewDataStyle.font;
        draw.text(cellText, dbox, {
            align: (style && style.align) || $viewDataStyle.align,
            valign: (style && style.align) || $viewDataStyle.valign,
            font,
            color: (style && style.color) || $viewDataStyle.color,
        }, isWrapText);
    }
    draw.restore();
}

/**
 * 传入逻辑索引返回得到物理坐标：单元格坐标、长宽, 以此来生成drawbox
 * @param {*} rindex
 * @param {*} cindex
 * @returns DrawBox 专门负责单元格的 样式、border，文字还是交给draw负责
 */

function getDrawBox(rindex, cindex) {
    // x.y 坐标值
    let [x, y, width, height] = [0, 0, 0, 0];
    this.$viewdata.rowEach(rindex, (i, y1, rowHeight) => {
        y = y1 * gPixelRatio;
        height = rowHeight * gPixelRatio;
    });
    this.$viewdata.colEach(cindex, (i, x1, colWidth) => {
        x = x1 * gPixelRatio;
        width = colWidth * gPixelRatio;
    });
    return new DrawBox(x, y, width, height, gCellPaddingWidth * gPixelRatio);
}

/**
 * 高亮selector所在行 & 列的索引格
 */

function renderSelectRect() {
    const {
        draw, $viewdata,
    } = this;
    const {selectRectIndexes, row, col} = $viewdata;
    if (selectRectIndexes) {
        const {left, top, height, width} = $viewdata.getSelectRect();
        draw.save();
        draw.attr({fillStyle: 'rgba(44, 103, 212, 0.1)'})
            .fillRect((left + col.indexWidth) * gPixelRatio, 0, width * gPixelRatio, row.height * gPixelRatio) // 行索引栏高亮
            .fillRect(0, (top + row.height) * gPixelRatio, col.indexWidth * gPixelRatio, height * gPixelRatio);// 列索引栏高亮
        draw.restore();
    }
}
