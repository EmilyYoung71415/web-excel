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
        const [event, ...infos] = eventName.split('.');
        this.el.addEventListener(event, evt => {
            for (let i = 0; i < infos.length; i++) {
                const info = infos[i];
                // 鼠标左键正确
                if (info === 'left' && evt.button !== 0) {
                    return;
                }
                // 鼠标右键正确
                if (info === 'right' && evt.button !== 2) {
                    return;
                }
                if (info === 'stop') {
                    evt.stopPropagation();//阻止冒泡
                }
            }
            handler(evt);
        })
        return this;
    }
    /***
     * exp: ('display','none')
     *      ({
     *         'display':'none',
     *         'color':'red'     
     *      })
     */
    css(name, value) {
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
    attr(key, value) {
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
    // 接受obj设置元素的 top left  width height
    offset(obj){
        const {
            offsetTop, offsetLeft, offsetHeight, offsetWidth,
        } = this.el;
        if(obj){
            Object.keys(obj).forEach(key=>{
                this.css(key,`${obj[key]}px`);
            })
            return this;
        }
        return {
            top: offsetTop,
            left: offsetLeft,
            height: offsetHeight,
            width: offsetWidth,
        }
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
    scroll(v) {
        const { el } = this;
        if (v !== undefined) {
            if (v.left !== undefined) {
                el.scrollLeft = v.left;
            }
            if (v.top !== undefined) {
                el.scrollTop = v.top;
            }
        }
        return { left: el.scrollLeft, top: el.scrollTop };
    }
}

// 工厂模式 使用者可以无需new 直接使用模板函数h创建对象
const h = (tag, className = '') => new Element(tag, className);
export {
    Element,
    h
}