/**
 * @file 选区
 */
import { Shape } from '../../abstract/shape-base';
export class Selector extends Shape {
    constructor() {
        super();
    }
    createRender() {
        return `<h1>选区</h1>`;
    }
}