import {sheetOptions} from './config/sheetOptions';
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
        // 表格的基础设置；单元格初始大小、数量等
        const configOptions = Object.assign(sheetOptions, options);
        // 数据模型层model：viewdata
        // 拦截监听变化 & 访问代理
        let $viewdata = new ViewData(configOptions);
        // 根据sheetoption &  userdata
        // 渲染出 初始化的表格
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
