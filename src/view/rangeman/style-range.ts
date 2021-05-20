/**
 * @file 单元格样式
 * - border
 * - bgcolor
 * 绘制方式：传入当前cell的全部style属性，即为newcell的style
 * 全局绘制style：border、bg每次render都重新绘制
 */

// 功能：
//     给指定range加border、bg
// 设计纠结点：
//     需不需要开放 当前range去访问 cell已有属性的能力？
//     还是说由controller层 拿到最终的cell上的属性注入给range进行渲染即可？
// 那如果是当成纯ui组件设计的话：text、style基本是这样的
// 不过text的时候 renderbox大小是减去了border的，应该修改下

import { RectOffset, CellStyle } from '../../type';
import { RangeRenderController } from './index';
import { BaseRange } from '../../abstract/range-base';

interface IStyleRange {
    render: (
        rect: RectOffset,
        style: CellStyle,
    ) => void;
}

export class StyleRange extends BaseRange implements IStyleRange {
    readonly namespace = 'style-range';
    private _rect: RectOffset;
    // 普通单元格的style
    getDefaultCfg() {
        return {
            bordersize: 1,
            bordercolor: '#333333',
            borderstyle: 'solid',
            bgcolor: '#fff',
        };
    }
    constructor(
        rangecontroller: RangeRenderController,
        cfg?: CellStyle
    ) {
        super(rangecontroller, cfg);
    }
    // 传入range的idxes，遍历挨个cell加style
    // renderCell()
    // 由于无法知道增量，所以每次style都是全局重绘：包括border和bg
    render(
        rect: RectOffset,
        style: CellStyle, // 最终单元格的样式
    ): void {
        this._rect = rect;
        this.setObj(style);
        this._canvas.drawRegion(rect, this._draw.bind(this));
        // 恢复原始设置 避免污染下次draw笔触
        this.setObj(this.getDefaultCfg());
    }
    _draw() {
        const border = [
            this.get('bordersize'),
            this.get('borderstyle'),
            this.get('bordercolor'),
        ].join(' ');
        this._canvas.drawRect(this._rect, this.get('bgcolor'), border);
    }
}