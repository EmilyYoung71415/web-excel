import { Engine } from './engine';
import { EngineOption } from './type';
import './index.less';
declare const XWebExcel: {
    create(container: HTMLElement, opt?: EngineOption): Engine;
};
export default XWebExcel;
export { XWebExcel, };
