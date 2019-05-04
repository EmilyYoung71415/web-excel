import { sheetOptions } from "./config/sheetOptions";
import Table from './component/table';

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
    this.data = null;
    const {row,col,style} = this.options;
    this.table = new Table(el, row, col, style);
    this.initRender();
    this.render();
  }
  initRender(){
      this.el.width  = this.options.width;
      this.el.height  = this.options.height;
  }
  loadData(data) {
    this.table.loadData(data);
    return this;
  }
  render(){
    this.table.render();
    return this;
  }
}

const webexcel = (el, options = {}) => new Webexcel(el, options);

if (window) {
  window.webexcel = webexcel;
}

export default webexcel;