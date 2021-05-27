/**
 * @file 滚动条
 */
import { Shape } from '../../abstract/shape-base';
export class ScrollBar extends Shape {
    constructor() {
        super();
    }
    createRender() {
        return `<h1>滚动条</h1>`;
    }
}