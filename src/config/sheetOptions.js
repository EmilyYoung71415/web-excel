// sheet config
// excel初始化(不含表格数据)
const sheetOptions = {
    view: {
        height: () => window.innerHeight,
        width: () => window.innerWidth,
    },
    row: { // 表格初始化 10行 每行25px高
        len: 300,
        height: 25,
    },
    col: {
        len: 25,
        width: 100,
        indexWidth: 60, // 列索引栏宽度
        minWidth: 60, // 伸缩最小宽度
    },
    style: {
        bgcolor: '#ffffff',
        align: 'left',
        valign: 'top',
        wrapText: true, // 文字分行
        textDecoration: 'normal',
        color: '#333333',
        font: {
            family: 'Arial',
            size: 14,
            bold: false,
            italic: false,
        },
    },
};
// excel的装载数据
const loadData = {
    borders: [
        [1, 'dashed', '#0366d6'],
    ],
    styles: [ // 某些单元格有特殊样式 bi指向在borders的索引
        {
            bgcolor: '#dddddd',
            bi: 0,
            color: '#900b09',
        },
    ],
    rowm: {// 特殊列 列高
        1: {height: 150},
    },
    colm: {
        4: {width: 40},
    },
    cellmm: {
        1: { // 单元格的数据,si指向它的特殊样式(如果有的话) styles[si]
            1: {
                text: 'testing测试testtestetst',
                si: 0,
            },
        },
    },
};

/*
  // tableOption
  el: element in document
  row: {
    len: number,
    height: number
  }
  col: {
    len: number,
    width: number
  }
  style: {
    bgcolor: '#ffffff',
    align: 'left',
    valign: 'middle',
    wrapText: false,
    textDecoration: 'normal',
    color: '#333333',
    bi: border-index
    bti: border-index
    bri: border-index
    bbi: border-index
    bli: border-index
    font: {
      name: 'Arial',
      size: 14,
      bold: false,
      italic: false,
    },
  }
*/

export {
    sheetOptions,
};