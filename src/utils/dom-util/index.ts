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