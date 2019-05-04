import { sheetOptions } from "./config/sheetOptions";
import Sheet from './component/sheet';
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
    this.el = el;
    this.options = Object.assign(sheetOptions, options);
    this.sheet = new Sheet(el,this.options);
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