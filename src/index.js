import Sheet from './component/sheet';
import ViewData from './viewdata.js';
import './index.less';
/*
  el: element in document
  options: like #defaultOptions
  data: {
    styles: [{ bgcolor: '#dddddd', bi: 0, color: '#900b09' }]//特殊单元格的样式
    rowm: {}, // Map<int, Row>
    colm: {}, // Map<int, Col>
    cellmm: {}, // Map<int, Map<int, Cell>>
  }
*/
class Webexcel {
    constructor(el, options = {}) {
        // 数据模型层model：viewdata
        // 拦截监听变化 & 访问代理
        const $viewdata = new ViewData(options);
        /**
         * 1、initDom创建容器：
         *  div.id=webexcel
         *    canvas.excel-table
         *    div.excel-scrollbar
         *    div.excel-input(editor)
         *    div.excel-resizer
         *    div.excel-overlayer
         *  initDom初始化事件监听：
         *    基础组件就绪：
         *      overlayer、resizer、scrollbar
         * 2、table.render()
         *    画布单元格
         *    索引栏
         *    具体的单元格绘制：数据、样式填充
         */
        this.sheet = new Sheet(el, $viewdata);
    }

    loadData(data) {
        this.sheet.loadData(data);
        return this;
    }
}

const webexcel = (el, options = {}) => new Webexcel(el, options);

if (window) {
    window.webexcel = webexcel;
}

export default webexcel;
export {
    webexcel,
};
