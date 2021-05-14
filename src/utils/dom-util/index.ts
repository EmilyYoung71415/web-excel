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
