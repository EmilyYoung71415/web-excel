class Draw {
    constructor(el) {
      this.el = el;
      this.ctx = el.getContext('2d');
    }
    clear() {
      const { width, height } = this.el;
      this.ctx.clearRect(0, 0, width, height);
      return this;
    }
    attr(options) {
      Object.assign(this.ctx, options);
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
    border(width, style, color) {
      const { ctx } = this;
      ctx.lineWidth = width - 0.5;
      ctx.strokeStyle = color;
      if (style === 'dashed') ctx.setLineDash([5, 2]);
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
      const { ctx } = this;
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
    rect(box){
        
    }
}
  
class DrawBox{
  
}
  
  
export default {};
export {
    Draw,// 封装了canvas的draw
    DrawBox,// draw上面 针对 box的drow
};