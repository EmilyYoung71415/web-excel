class Element {
    constructor(tag, className = '') {
        this.el = document.createElement(tag);
        this.el.className = className;
        this.data = {};
    }
    children(...nodes) {
        nodes.forEach(node => this.child(node));
        return this;
    }
    child(node) {
        let temp = node;
        if (typeof node == 'string') {
            temp = document.createTextNode(node);
        } else if (node instanceof Element) {
            temp = node.el;
        }
        this.el.append(temp);
        return this;
    }
    // TODO
    on(eventName, handler) {
        // on('mousemove',ev=>{})
        // resizer-hover .on('mousedown.stop', evt =>{})
        return this;
    }
    /***
     * exp: ('display','none')
     *      ({
     *         'display':'none',
     *         'color':'red'     
     *      })
     */
    css(name,value){
        if (Array.isArray(name)) {
            Object.keys(name).forEach((k) => {
              this.el.style[k] = name[k];
            });
            return this;
        }
        if (value != undefined) {
            this.el.style[name] = value;
            return this;
        }
        return this.el.style[name];
    }
    // exp: tableEl.attr({width:100px})
    attr(key, value){
        if (value !== undefined) {
            this.el.setAttribute(key, value);
        }
        if (typeof value === 'string') {
        return this.el.getAttribute(key);
        }
        Object.keys(key).forEach((k) => {
        this.el.setAttribute(k, key[k]);
        });
        return this;
    }
    hide() {
        this.css('display', 'none');
        return this;
    }
    show() {
        this.css('display', 'block');
        return this;
    }
    box() {
        return this.el.getBoundingClientRect();
    }
    parent() {
        return this.el.parentNode;
    }
    className() {
        return this.el.className;
    }
    addClass(name) {
        this.el.classList.add(name);
        return this;
    }
    hasClass(name) {
        return this.el.classList.contains(name);
    }
    removeClass(name) {
        this.el.classList.remove(name);
        return this;
    }
    toggleClass(name) {
        this.el.classList.toggle(name);
        return this;
    }
}

// 工厂模式 使用者可以无需new 直接使用模板函数h创建对象
const h = (tag,className='')=>new Element(tag,className);
export{
    Element,
    h
}