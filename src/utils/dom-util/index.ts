export function modifyCSS(dom: HTMLElement, css: { [key: string]: any }): HTMLElement {
    if (!dom) {
        return;
    }
    for (const key in css) {
        if (css.hasOwnProperty(key)) {
            dom.style[key] = css[key];
        }
    }
    return dom;
}

export function createDom(str: string): any {
    const container = document.createElement('div');
    str = str.replace(/(^\s*)|(\s*$)/g, '');
    container.innerHTML = '' + str;
    const dom = container.childNodes[0];
    container.removeChild(dom);
    return dom;
}

export function addEventListener(target: HTMLElement, eventType: string, callback: any) {
    if (!target) return;
    if (typeof target.addEventListener === 'function') {
        target.addEventListener(eventType, callback, false);
        // 用于清除 destroy
        return {
            remove() {
                target.removeEventListener(eventType, callback, false);
            },
        };
    }
}