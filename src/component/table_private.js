import alphabet from '../config/alphabet';
import {DrawBox} from '../draw/canvas';
const gLeftFixedCellWidth = 60;
const gCellPaddingWidth = 5;

function renderContentGrid(){
    const {draw,$viewdata} = this;
    const {row, col,scrollOffset} = $viewdata;
    draw.save();
    draw.attr({
        lineWidth: 0.5,
        strokeStyle: '#d0d0d0',
    });
    draw.translate(gLeftFixedCellWidth, row.height);
    //  移动canvas
    draw.translate(-scrollOffset.x, -scrollOffset.y);// 画笔向上移动
    const colSumWidth = $viewdata.colTotalWidth();// 全部列总宽
    const rowSumHeight = $viewdata.rowTotalHeight();// 全部行总高
    // 在table里的画横、竖
    // 每一行的横线起始两点坐标为(0,y),(colSumWidth, y)
    $viewdata.rowEach(row.len, (i, y) => {
        draw.line([0, y], [colSumWidth, y]);
    });
    $viewdata.colEach(col.len, (i, x) => {
        draw.line([x, 0], [x, rowSumHeight]);
    });
    draw.restore();
}

function renderFixedHeaders(){// 表格的索引栏 有浅灰色的背景颜色
    const {draw,$viewdata} = this;
    const {row, col,scrollOffset} = $viewdata;
    draw.save();
    // 背景颜色   
    draw.attr({ fillStyle: '#f4f5f8' })
        // 填充背景
        .fillRect(0, 0, gLeftFixedCellWidth, $viewdata.rowTotalHeight() + row.height)
        .fillRect(0, 0, $viewdata.colTotalWidth() + gLeftFixedCellWidth, row.height);
    draw.attr({
        textAlign: 'center',
        textBaseline: 'middle',
        font: '500 12px sans-serif',
        fillStyle: '#585757',
        lineWidth: 0.5,
        strokeStyle: '#d0d0d0',
    });
    // 第一列 生成行索引
    $viewdata.rowEach(row.len, (i, y1, rowHeight) => {
        const y = y1 + row.height-scrollOffset.y;
        const [tx, ty] = [0 + (gLeftFixedCellWidth / 2), y + (rowHeight / 2)];
        if (i !== row.len) draw.fillText(i + 1, tx, ty);
        // 分割线
        draw.line([0, y], [gLeftFixedCellWidth, y]);
    });
    draw.line([gLeftFixedCellWidth, 0], [gLeftFixedCellWidth, $viewdata.rowTotalHeight() + row.height]);
    // 第一行 生成列索引
    $viewdata.colEach(col.len, (i, x1, colWidth) => {
        const x = x1 + gLeftFixedCellWidth- scrollOffset.x;
        const [tx, ty] = [x + (colWidth / 2), 0 + (row.height / 2)];
        if (i !== col.len) draw.fillText(alphabet.stringAt(i), tx, ty);
        draw.line([x, 0], [x, row.height]);
    });
    draw.line([0, row.height], [$viewdata.colTotalWidth() + gLeftFixedCellWidth, row.height]);
    renderSelectRect.call(this);// 高亮selector所在行&列的索引格
    // left-top-cell
    draw.attr({ fillStyle: '#fff' })
        .fillRect(0, 0, gLeftFixedCellWidth, row.height);
    draw.restore();
}

function renderContent(){
    const { cellmm } = this.$viewdata;
    Object.keys(cellmm).forEach((rindex) => {
        Object.keys(cellmm[rindex]).forEach((cindex) => {
            renderCell.call(this,rindex, cindex, cellmm[rindex][cindex]);
        });
    });
}

function renderCell(rindex,cindex,cell){
    const {draw,$viewdata} = this;
    const {
        styles, row,scrollOffset
    } = $viewdata;

    const style = styles[cell.si];
    //传入逻辑索引返回得到单元格坐标、长宽,以此来生成drawbox
    const dbox = getDrawBox.call(this,rindex, cindex);
    if(style){
        dbox.bgcolor = style.bgcolor;
    }
    dbox.setBorders([0.5, 'solid', '#d0d0d0'])//border-style:dotted solid double dashed; 
    draw.save().translate(gLeftFixedCellWidth, row.height)
                .translate(-scrollOffset.x, -scrollOffset.y);
    draw.rect(dbox);
    // render cell数据
    const cellText = cell.text;// TODO:格式化
    const $viewDataStyle = this.$viewdata.style;
    const wrapText = (style && style.wrapText) ||  $viewDataStyle.wrapText;
    const font = (style && style.font) ||  $viewDataStyle.font;
    draw.text(cellText, dbox, {
        align: (style && style.align) ||  $viewDataStyle.align,
        valign: (style && style.align) ||  $viewDataStyle.valign,
        font,
        color: (style && style.color) ||  $viewDataStyle.color,
    }, wrapText);
    draw.restore();
}

    
function getDrawBox(rindex, cindex){
    let x,y,width,height;//x.y 坐标值
    this.$viewdata.rowEach(rindex, (i, y1, rowHeight) => {
        y = y1;
        height = rowHeight;
    });
    this.$viewdata.colEach(cindex, (i, x1, colWidth) => {
        x = x1;
        width = colWidth;
    });
    return new DrawBox(x, y, width, height, gCellPaddingWidth);
}
//  高亮selector所在行&列的索引格
function renderSelectRect() {
    const {
      draw,$viewdata
    } = this;
    const { selectRectIndexes, row, col,} = $viewdata;
    if (selectRectIndexes) {
        const {
            left, top, height, width,
        } = $viewdata.getSelectRect();
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
    renderSelectRect,
}