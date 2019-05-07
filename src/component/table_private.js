import alphabet from '../config/alphabet';
import {DrawBox} from '../draw/canvas';
import help from '../utils/help';
const gLeftFixedCellWidth = 60;
const gCellPaddingWidth = 5;

function renderContentGrid(){
    const {draw, row, col,scrollOffset} = this;
    draw.save();
    draw.attr({
        lineWidth: 0.5,
        strokeStyle: '#d0d0d0',
    });
    draw.translate(gLeftFixedCellWidth, row.height);
    //  移动canvas
    draw.translate(-scrollOffset.x, -scrollOffset.y);// 画笔向上移动
    const colSumWidth = this.colTotalWidth();// 全部列总宽
    const rowSumHeight = this.rowTotalHeight();// 全部行总高
    // 在table里的画横、竖
    // 每一行的横线起始两点坐标为(0,y),(colSumWidth, y)
    this.rowEach(row.len, (i, y) => {
        draw.line([0, y], [colSumWidth, y]);
    });
    this.colEach(col.len, (i, x) => {
        draw.line([x, 0], [x, rowSumHeight]);
    });
    draw.restore();
}

function renderFixedHeaders(){// 表格的索引栏 有浅灰色的背景颜色
    const {draw, row, col,scrollOffset} = this;
    draw.save();
    // 背景颜色   
    draw.attr({ fillStyle: '#f4f5f8' })
        // 填充背景
        .fillRect(0, 0, gLeftFixedCellWidth, this.rowTotalHeight() + row.height)
        .fillRect(0, 0, this.colTotalWidth() + gLeftFixedCellWidth, row.height);
    draw.attr({
        textAlign: 'center',
        textBaseline: 'middle',
        font: '500 12px sans-serif',
        fillStyle: '#585757',
        lineWidth: 0.5,
        strokeStyle: '#d0d0d0',
    });
    // 第一列 生成行索引
    this.rowEach(row.len, (i, y1, rowHeight) => {
        const y = y1 + row.height-scrollOffset.y;
        const [tx, ty] = [0 + (gLeftFixedCellWidth / 2), y + (rowHeight / 2)];
        if (i !== row.len) draw.fillText(i + 1, tx, ty);
        // 分割线
        draw.line([0, y], [gLeftFixedCellWidth, y]);
    });
    draw.line([gLeftFixedCellWidth, 0], [gLeftFixedCellWidth, this.rowTotalHeight() + row.height]);
    // 第一行 生成列索引
    this.colEach(col.len, (i, x1, colWidth) => {
        const x = x1 + gLeftFixedCellWidth- scrollOffset.x;
        const [tx, ty] = [x + (colWidth / 2), 0 + (row.height / 2)];
        if (i !== col.len) draw.fillText(alphabet.stringAt(i), tx, ty);
        draw.line([x, 0], [x, row.height]);
    });
    draw.line([0, row.height], [this.colTotalWidth() + gLeftFixedCellWidth, row.height]);
    renderSelectRect.call(this);// 高亮selector所在行&列的索引格
    // left-top-cell
    draw.attr({ fillStyle: '#fff' })
        .fillRect(0, 0, gLeftFixedCellWidth, row.height);
    draw.restore();
}

function renderContent(){
    const { cellmm } = this;
    Object.keys(cellmm).forEach((rindex) => {
        Object.keys(cellmm[rindex]).forEach((cindex) => {
            renderCell.call(this,rindex, cindex, cellmm[rindex][rindex]);
        });
    });
}

function renderCell(rindex,cindex,cell){
    const {
        styles, cellmm, draw, row,scrollOffset
    } = this;

    const style = styles[cell.si];
    //传入逻辑索引返回得到单元格坐标、长宽,以此来生成drawbox
    const dbox = getDrawBox.call(this,rindex, cindex);
    const {
        bgcolor, bi, bti, bri, bbi, bli
    } = style;
    dbox.bgcolor = bgcolor;
    dbox.setBorders(
        this.borders[bi],
        this.borders[bti],
        this.borders[bri],
        this.borders[bbi],
        this.borders[bli],
    );
    draw.save().translate(gLeftFixedCellWidth, row.height)
                .translate(-scrollOffset.x, -scrollOffset.y);
    draw.rect(dbox);
    // render cell数据
    const cellText = cell.text;// TODO:格式化
    const wrapText = (style && style.wrapText) || this.style.wrapText;
    const font = Object.assign({}, this.style.font, style.font);
    draw.text(cellText, dbox, {
        align: (style && style.align) || this.style.align,
        valign: (style && style.align) || this.style.valign,
        font,
        color: (style && style.color) || this.style.color,
    }, wrapText);
    draw.restore();
}

    
function getDrawBox(rindex, cindex){
    let x,y,width,height;//x.y 坐标值
    this.rowEach(rindex, (i, y1, rowHeight) => {
        y = y1;
        height = rowHeight;
    });
    this.colEach(cindex, (i, x1, colWidth) => {
        x = x1;
        width = colWidth;
    });
    return new DrawBox(x, y, width, height, gCellPaddingWidth);
}
    
function getCellRowByY(y){// 根据y坐标获得所在行号
    const { row,scrollOffset } = this;
    const [ri, top, height] = help.rangeReduceIf(
        0,
        row.len,
        row.height - scrollOffset.y,// top
        row.height,// 行高
        y,
        i => this.getRowHeight(i)//传入获取第i行行高的cb函数
    );
    if (top <= 0) {
        return { ri: 0, top: 0, height };
    }
    return { ri, top, height };
}
function getCellColByX(x){
    const { col, scrollOffset } = this;
    const [ci, left, width] = help.rangeReduceIf(
        0,
        col.len,
        col.indexWidth - scrollOffset.x,
        col.indexWidth,
        x,
        i => this.getColWidth(i),
    );
    if (left <= 0) {
        return { ci: 0, left: 0, width: col.indexWidth };
    }
    return { ci, left, width };
}
//  高亮selector所在行&列的索引格
function renderSelectRect() {
    const {
      draw, selectRectIndexes, row, col,
    } = this;
    if (selectRectIndexes) {
        const {
            left, top, height, width,
        } = this.getSelectRect();
        draw.save();
        draw.attr({ fillStyle: 'rgba(44, 103, 212, 0.1)' })
            // 行索引栏高亮 
            .fillRect(left + col.indexWidth, 0, width, row.height)
            // 列索引栏高亮
            .fillRect(0, top + row.height, col.indexWidth, height);
        draw.restore();
    }
}

export default {
    renderContentGrid,
    renderFixedHeaders,
    renderContent,
    renderCell,
    getDrawBox,
    getCellRowByY,
    getCellColByX,
    renderSelectRect,
}