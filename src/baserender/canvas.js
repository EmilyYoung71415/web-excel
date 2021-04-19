// 封装了canvas的draw
export class Draw {
    constructor(el) {
        this.el = el;
        this.ctx = el.getContext('2d');
    }

    clear() {
        const {width, height} = this.el;
        this.ctx.clearRect(0, 0, width, height);
        return this;
    }

    attr(options) {
        let renderfont = '';
        if (options.font) {
            const font = options.font;
            renderfont = `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${font.size}px ${font.name}`;
        };
        Object.assign(this.ctx, options, {
            font: renderfont,
        });
        return this;
    }

    save() {
        this.ctx.save();
        this.ctx.beginPath();
        return this;
    }

    restore() {
        this.ctx.restore();
        return this;
    }

    beginPath() {
        this.ctx.beginPath();
        return this;
    }

    translate(x, y) {
        this.ctx.translate(x, y);
        return this;
    }

    fillRect(x, y, w, h) {
        this.ctx.fillRect(x, y, w, h);
        return this;
    }

    fillText(text, x, y) {
        this.ctx.fillText(text, x, y);
        return this;
    }

    lineStyle(width, lineDash, color) {
        this.attr({
            lineWidth: width - 0.5,
            strokeStyle: color,
        });
        this.ctx.setLineDash(lineDash);
        return this;
    }

    line(...xys) {
        const {ctx} = this;
        if (xys.length > 1) {
            const [x, y] = xys[0];
            ctx.moveTo(x + 0.5, y + 0.5);
            for (let i = 1; i < xys.length; i += 1) {
                const [x1, y1] = xys[i];
                ctx.lineTo(x1 + 0.5, y1 + 0.5);
            }
            ctx.stroke();
        }
    }

    rect(box) {
        const {ctx} = this;
        const {
            x, y, width, height, bgcolor,
        } = box;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = bgcolor;
        ctx.fill();
        const {
            border, borderTop, borderRight, borderBottom, borderLeft,
        } = box;
        if (border) {
            this.border(...border);
            ctx.stroke();
        }
        else {
            if (borderTop) {
                this.border(...borderTop);
                this.line([x, y], [x + width, y]);
            }
            if (borderRight) {
                this.border(...borderRight);
                this.line([x + width, y], [x + width, y + height]);
            }
            if (borderBottom) {
                this.border(...borderBottom);
                this.line([x, y + height], [x + width, y + height]);
            }
            if (borderLeft) {
                this.border(...borderLeft);
                this.line([x, y], [x, y + height]);
            }
        }
        ctx.restore();
    }

    border(width, style, color) {
        const {ctx} = this;
        ctx.lineWidth = width - 0.5;
        ctx.strokeStyle = color;
        if (style === 'dashed') {
            ctx.setLineDash([5, 2]);
        }
        return this;
    }

    /*
        txt: 'xxxx测试测试'
        box: DrawBox
        attr: {
            align: left | center | right
            valign: top | middle | bottom
            color: '#333333',
            textDecoration: 'normal',
            font: {
                name: 'Arial',
                size: 14,
                bold: false,
                italic: false,
            }
        }
        isWrapText: wrap text
    */
    /**
     * @param {*} txt           渲染文本
     * @param {*} box           box实例
     * @param {*} attr          属性：对齐、字体
     * @param {*} isWrapText    换行
     * TODO:  之后分离成单独的文字排版类，支持超出省略、溢出截断等
     */
    text(txt, box, attr = {}, isWrapText = true) {
        const {ctx} = this;
        const {
            align, valign, font, color,
        } = attr;
        const tx = box.textx(align);// 按照对齐方式 返回在box里起点的坐标
        let ty = box.texty(valign);
        ctx.save();
        this.attr({
            textAlign: align,
            textBaseline: valign,
            font: `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${font.size}px ${font.name}`,
            fillStyle: color,
        });
        const txtWidth = ctx.measureText(txt).width;
        // canvas的手动换行处理 笔触提笔重新开头
        const boxWidth = box.innerWidth();
        if (isWrapText && txtWidth > boxWidth) {
            // len：当前串的像素长度 start:新一行以哪个字符开始
            const textLine = {len: 0, start: 0, height: 0};
            const textLineHeight = font.size + 2;
            for (let i = 0; i < txt.length; i++) {
                textLine.len += ctx.measureText(txt[i]).width;
                textLine.height += ctx.measureText(txt[i]).height;
                if (textLine.len >= boxWidth) { // 换行渲染剩余文字
                    const cutTxt = txt.substring(textLine.start, i);
                    ctx.fillText(cutTxt, tx, ty);
                    ty += textLineHeight;
                    textLine.len = 0;
                    textLine.height += textLineHeight;
                    textLine.start = i;
                }
            }
            if (textLine.len > 0) {
                ctx.fillText(txt.substring(textLine.start), tx, ty);
            }
            // TODO:超出单元格的高度则文字省略: 首次渲染时是截断的，但是当动态的input编辑输入回调时是未截断
        }
        else {
            ctx.fillText(txt, tx, ty);
        }
        ctx.restore();
        return this;
    }
}

/**
 * 生成一个单元格canvas块: 用于收敛box的内部绘制计算方法，实际绘制还是交给draw实现
 * @param：传入x横坐标、y纵坐标、单元格宽度、单元格高度、单元格padding
 * 基本用法： draw.rect(dbox); draw.text()
 */

export class DrawBox {// 生成一个块
    constructor(x, y, w, h, padding = 0) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.padding = padding;
        this.bgcolor = '#ffffff';
        // border: [width, style, color]
        this.border = null;
        this.borderTop = null;
        this.borderRight = null;
        this.borderBottom = null;
        this.borderLeft = null;
    }

    innerWidth() {
        return this.width - (this.padding * 2);
    }

    innerHeight() {
        return this.height - (this.padding * 2);
    }

    setBorders(b, bt, br, bb, bl) {
        this.border = b;// [1, 'dashed', '#0366d6']
        if (bt) {
            this.borderTop = bt;
        }
        if (br) {
            this.borderRight = br;
        }
        if (bb) {
            this.borderBottom = bb;
        }
        if (bl) {
            this.borderLeft = bl;
        }
    }

    // 根据对齐方式 返回在box书写的起点
    textx(align) {
        const {width, padding} = this;
        let {x} = this;
        if (align === 'left') {
            x += padding;
        }
        else if (align === 'center') {
            x += width / 2;
        }
        else if (align === 'right') {
            x += width - padding;
        }
        return x;
    }

    texty(align) {
        const {height} = this;
        let {y} = this;
        if (align === 'top') {
            y += 0;
        }
        else if (align === 'middle') {
            y += height / 2;
        }
        else if (align === 'bottom') {
            y += height;
        }
        return y;
    }
}
